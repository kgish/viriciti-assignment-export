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

rate-limiter:
  points: 100
  duration: 60
  keyPrefix: global

jwt:
  expiresIn: 3600
```

## ENV

The following environment variables can be used to override the configuration values.

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

```
POST /signup
{
  name: kiffin
  password: secret
}
...

```

```
POST /signin
{
  name: kiffin
  password: secret
}
...

```

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

```
GET /vehicles/1003
...
{ "id": 1003, "name": "vehicle_003", "status": "REPAIR" }
```

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

```
@UseInterceptors(RateLimiterInterceptor)

```
  
## References

* [NestJS](https://nestjs.com)
* [TypeORM](https://typeorm.io)
* [Jest](https://jestjs.io)
* [node-rate-limiter-flexible](https://github.com/animir/node-rate-limiter-flexible)
