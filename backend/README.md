# Backend

## Introduction

## Configuration


 Module '"/home/kiffin/projects/viriciti-assignment-export/tooling/node_modules/@types/underscore/index"' can only be default-imported using the 'esModuleInterop' flag


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
GET /vehicles
[
  { "id": 1001, "name": "vehicle_001", "status": "READY" },
  { "id": 1002, "name": "vehicle_002", "status": "PARKED" },
  { "id": 1003, "name": "vehicle_003", "status": "REPAIR" },
  ...
]
```

```
GET /vehicles/1003
{ "id": 1003, "name": "vehicle_003", "status": "REPAIR" }
```

```
GET /vehicles/1003/values?fromDate=yyyy-mm-dd&toDate=yyyy-mm-dd
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
  
## References

* [NestJS](https://nestjs.com)
* [TypeORM](https://typeorm.io)
* [Jest](https://jestjs.io)
