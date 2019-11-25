# Backend

## Introduction

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

The following environment variables can be used to override the configuration values, for example when starting it as
a docker container using `docker-compose`.

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

## API

The API is relatively simple and consists of the following calls:

## Health check
```
GET /health-check
```

## Verify token
```
GET /health-check
```

## Sign up new user
```
POST /signup
{
  name: kiffin
  password: secret
}
```

## Login
```
POST /signin
{
  name: kiffin
  password: secret
}
```

## Get all vehicles
```
GET /vehicles
...
[
  { "id": 1001, "name": "vehicle_001", "status": "READY" },
  { "id": 1002, "name": "vehicle_002", "status": "PARKED" },
  { "id": 1003, "name": "vehicle_003", "status": "REPAIR" },
  ...
]
```

## Get one vehicle
```
GET /vehicles/1003
...
{ "id": 1003, "name": "vehicle_003", "status": "REPAIR" }
```

## Get values within date range for one vehicle
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
```

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
* [Docker](https://www.docker.com)
* Docker Hub
    * [Postgres](https://hub.docker.com/_/postgres)
    * [Mongo](https://hub.docker.com/_/mongo)
    * [Redis](https://hub.docker.com/_/redis)
