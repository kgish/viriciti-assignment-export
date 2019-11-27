# Backend

## Introduction

The backend was built using [NestJS](https://nestjs.com) which is a progressive Node.js framework for building efficient, reliable and scalable server-side applications.

Under the hood, NestJS makes use of the robust HTTP server Express framework.

NestJS like Express Gateway allows developers to use a specific architecture by introducing Angular-like modules, services, and controllers, ensuring the application is scalable, highly testable, and loosely coupled.

By using TypeScript, advanced decorators provide an easy means of building modern APIs.

Uses the refactored `unwind.stream.ts` located in the `/lib/utils` directory for accessing the MongoDB server.


## Configuration

All of the configuration parameters can be found in the `config/degfault.yml` file.

```
server:
  port: 3000

db:
  postgres:
    type: 'postgres'
    port: 5432
    database: 'viriciti'
  mongo:
    type: 'mongo'
    host: 'localhost'
    port: 27017
    username: 'viriciti'
    password: 'viriciti'
    settings:
      useUnifiedTopology: true
      connectTimeoutMS: 5000
      socketTimeoutMS: 5000

redis:
  type: 'redis'
  host: 'localhost'
  port: 6379
  db: 1
  password: 'viriciti'
  prefix: ''

rate-limiter:
  points: 100
  duration: 60
  keyPrefix: global

jwt:
  expiresIn: 3600
```

## ENV

The following environment variables can be used to override the configuration values, for example when starting it as a docker container using `docker-compose`.

```
# Postgres
POSTGRES_HOSTNAME
POSTGRES_PORT
POSTGRES_USERNAME
POSTGRES_PASSWORD
POSTGRES_DB_NAME

# TypeOrm
TYPEORM_SYNC

# Mongo
MONGO_HOSTNAME
MONGO_PORT
MONGO_USERNAME
MONGO_PASSWORD
MONGO_SETTINGS_USE_UNIFIED_TOPOLOGY
MONGO_SETTINGS_CONNECT_TIMEOUT_MS
MONGO_SETTINGS_SOCKET_TIMEOUT_MS

# Redis
REDIS_HOSTNAME
REDIS_PORT
REDIS_DB
REDIS_PASSWORD
REDIS_PREFIX

# Rate limiter
RATE_LIMITER_TYPE
RATE_LIMITER_POINTS
RATE_LIMITER_DURATION
RATE_LIMITER_KEYPREFIX
```

## Start

```
$ npm run start
```

## Development

```
$ npm run start:dev
```

## Authentication

NestJS provides JWT support out of the box by using `passport` with the `passport-local` strategy.

This is accomplished by creating an `AuthService` which implements a `validateUser` in order to validate the user name and password used.

auth/auth.service.ts
```
@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}
      
  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    if (user && user.password === pass) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }
}
```

If a request is received without the authentication header, a `401 UNAUTHORIZED` error is returned.

## API

The API is relatively simple and consists of the following calls:

### Health check
```
GET /health-check
200 OK
```

### Verify token
```
GET /verify-token
200 OK | 401 UNAUTHORIZED
```

### Sign up new user
```
POST /signup
{
  name: kiffin
  password: secret
}
201 CREATED
```

### Login
```
POST /signin
{
  name: kiffin
  password: secret
}
200 OK | 400 BAD REQUEST
```

### Get all vehicles
```
GET /vehicles
...
[
  { "id": 1001, "name": "vehicle_001", "status": "READY" },
  { "id": 1002, "name": "vehicle_002", "status": "PARKED" },
  { "id": 1003, "name": "vehicle_003", "status": "REPAIR" },
  ...
]
200 OK | 404 NOT FOUND | 401 UNAUTHORIZED
```

### Get one vehicle
```
GET /vehicles/1003
...
{ "id": 1003, "name": "vehicle_003", "status": "REPAIR" }
200 OK | 404 NOT FOUND | 401 UNAUTHORIZED
```

### Get values within date range for one vehicle
```
GET /vehicles/1003/values?fromDate=yyyy-mm-dd&toDate=yyyy-mm-dd
...
[
  {
    time: 1572562812345,
    soc: 23.1,
    speed: 45.2,
    current: null,
    odo: null,
    voltage: 602
  },
  {
    time: 1572562812391,
    soc: 23.0,
    speed: 45.2,
    current: 26,
    odo: 14234.2,
    voltage: null
  },
  ...
]
200 OK | 404 NOT FOUND | 401 UNAUTHORIZED
```

## Vehicle stats

### Vehicle controller

The controller takes a vehicle id, starting date and ending date as query parameters, and calls the underlying vehicles service to gather the stats from the MongoDB server. Returns a Promise. 

src/vehicles/vehicles.controller.ts
```
@Controller('vehicles')
@UseGuards(AuthGuard())
export class VehiclesController {

  constructor(private vehiclesService: VehiclesService) {}
  ...
    
  @Get('/:id/values')
  getVehicleValuesById(
    @Query('fromDate') fromDate,
    @Query('toDate') toDate,
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
  ): Promise<IValue[]> {
    this.logger.log(`getVehicleValuesById() user='${ user }' id='${ id }' \
                     fromDate='${ fromDate }' toDate='${ toDate }'`);
    return this.vehiclesService.getVehicleValuesById(id, user, fromDate, toDate);
  }
  ...
}
```

### Vehicle service

Normally a data service will access a repository factory, but for the cases for MongoDB and Redis I have chosen instead to connect during initialization and use the client handles to make the calls to the underlying `MongdbService` and `RedisService` modules.

src/vehicles/vehicles.service.ts:constructor()
```
@Injectable()
export class VehiclesService {

  private mongoClient: MongoClient;
  private redisClient: RedisClient;

  private vehicles: IVehicle[];

  constructor(
    @InjectRepository(VehicleRepository)
    private vehicleRepository: VehicleRepository,
    private mongodb: MongodbService,
    private redis: RedisService,
  ) {
    this.redisClient = redis.client;
    this.mongoClient = mongodb.client;
    this.vehicles = mongodb.getVehicles();
  }
  ...
}
```

src/vehicles/vehicles.service.ts:getVehicleValuesById()
```
  async getVehicleValuesById(
    id: number,
    user: User,
    fromDate: string,
    toDate: string,
  ): Promise<any> {
  
    // Get the vehicle name.
    const vehicle = this.vehicles.find(v => v.id === +id);

    // Split the time interval into day blocks.
    for (let t = fromMS; t < toMS; t += MSECS_PER_DAY) {
      blocks.push({
        fromDate: dateYYYYMMDD(new Date(t)),
        toDate: dateYYYYMMDD(new Date(t + MSECS_PER_DAY)),
      });
    }
    
    // Create an array of promises.
    blocks.forEach(block => {
      const from = block.fromDate;
      const to = block.toDate;
      promises.push(
        new Promise((resolve, reject) => resolve(this._getVehicleStatsPerDay(vehicle, from, to))),
      );
    });

    // Return the promise.
    return new Promise((resolve, reject) => {
      Promise.all(promises).then(arrays => {
        let result = [];
        arrays.forEach(array => array.forEach(item => result.push(item)));
        resolve(result);
      });
    });
}
```

The call to `_getVehicleValuesById()` does the following:

* Build redis key `rid = '${vehicle}.${from}.${to}'`
* Call redis server with this key.
* If results, then return.
* Otherwise, make parallel calls for each attribute: soc, speed, current, odo and voltage.
* Collate and return the results.


src/vehicles/vehicles.service.ts:_getVehicleValuesById()
```
_getVehicleStatsPerDay(veh: IVehicle, fromDate: string, toDate: string) {

  const fn = `_getVehicleStatsPerDay() vehicle='${ veh.name }'`;

  return new Promise((resolve, reject) => {

    const rid = `${ veh.name }.${ fromDate.replace('-', '') }.${ toDate.replace('-', '') }`;
    this.redisClient.get(rid, (err, reply) => {
      if (reply) {
        resolve(JSON.parse(reply));
      }

      if (err || !reply) {

      const vals = {};
      const mc = this.mongoClient;

      parallel([
        cb => this._getVehicleStats(mc, veh, 'soc', fromMS, toMS, vals, cb),
        cb => this._getVehicleStats(mc, veh, 'speed', fromMS, toMS, vals, cb),
        cb => this._getVehicleStats(mc, veh, 'current', fromMS, toMS, vals, cb),
        cb => this._getVehicleStats(mc, veh, 'odo', fromMS, toMS, vals, cb),
        cb => this._getVehicleStats(mc, veh, 'voltage', fromMS, toMS, vals, cb),
      ], error => {
        if (error) {
          reject('NOK');
        } else {
          const converted = this._convertValues(values);
          this.redisClient.set(rid, JSON.stringify(converted));
          resolve(converted);
        }
      });
  }    
}
```

The `_convertValues()` function will collate the array of results into a single result ordered by timestamp.


## Rate limiter

Throttling the API calls is done using the [Node Rate Limiter](https://github.com/animir/node-rate-limiter-flexible) library.

In order to configure the available options, update the appropriate yaml file in the config directory.

src/config/rate-limiter.ts
```
import * as config from 'config';

const rlConfig = config.get('rate-limiter');

export const rateLimiterConfig = {
  type: process.env.RATE_LIMITER_TYPE || rlConfig.type,
  points: process.env.RATE_LIMITER_POINTS || rlConfig.points,
  duration: process.env.RATE_LIMITER_DURATION || rlConfig.duration,
  keyprefix: process.env.RATE_LIMITER_KEYPREFIX || rlConfig.keyprefix,
};
```
where

* type: memory, cluster, redis or mongodb (default: memory)
* points: Maximum number of points can be consumed over duration (default: 4).
* duration: Number of seconds before consumed points are reset (default: 1).
* keyprefix: If you need to create several limiters for different purpose (default: rlflx).

In order to enable it for a given controller or globally, use the following decorator.

```
@UseInterceptors(RateLimiterInterceptor)
```

## Testing

Run the unit tests.

```
$ npm run test
```

Run the end-to-end tests.

```
$ npm run test:e2e

```
  
## References

* [NestJS](https://nestjs.com)
* [TypeORM](https://typeorm.io)
* [Jest](https://jestjs.io)
* [Node Rate Limiter](https://github.com/animir/node-rate-limiter-flexible)
* [Redis for NestJS](https://docs.nestjs.com/microservices/redis)
* [Caching a MongoDB Database with Redis](https://codeforgeek.com/caching-a-mongodb-database-with-redis)
* [NestJS Authentication](https://docs.nestjs.com/techniques/authentication)
