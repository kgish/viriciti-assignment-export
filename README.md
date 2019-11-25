# Viriciti Assignment Exports

## Introduction

In order to be able to better assess my technical expertise, I was given a code challenge.

Hopefully the results will demonstrate that I am a qualified candidate.


## Problem

The main challenge is creating an export system that will not overflow the database system when a lot of export 
requests are issued.

The export system exposes a simple API which for a given vehicle and range of dates will return a dataset result 
consisting off all data falling
within the start date and end date.


## Assignment 

The assignment can be found on the Viriciti github under [Exports assignment](https://github.com/viriciti/exports-assignment).

A data dump for three vehicles was also provided.

The starting point was an example `unwind` utility and an `unwind_test` utility written in the [CoffeeScript](https://coffeescript.org) programming language.

With the introduction of [ECMAScript 6](http://es6-features.org), CoffeeScript has become outdated and typed superset of JavaScript known as [TypeScript](https://www.typescriptlang.org) can easily replace many of its features.

Also, the example utility uses the [UnderscoreJS](https://underscorejs.org) and [Async](https://caolan.github.io/async/v3) libraries which can to a large degree be replaced by the built-in `map`, `sort` aand `flatten` features of ES6. 

By using [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise), for example `new Promise()` and `Promise.all()` we have a more elegant solution for handling asynchronous calls and avoiding callback hell.


## Plan of attack

These are the steps that I took in order to tackle this challenging assignment:

* Brush up on MongoDB.
* Rewrite the unwind utility and test in ES6 using TypeScript.
* Verify that the rewriten test works using a test MongoDB.
* Create a MongDB docker container and import the data dump.
* Tried to learn [Express Gateway](https://www.express-gateway.io) but not enough time
* Decided instead to use [NestJS](https://nestjs.com) which is more familiar to me.
* Build the backend API server.
* Learn [Redis](https://redis.io) quickly.
* Create a Redis docker container and use it as a cache.
* Build a responsive [Angular](https://angular.io) frontend with [Material CDK](https://material.angular.io).
* Dockerize everything.
* Finalize this readme.


## Prerequisites

You should have some knowledge of the following and have the relevant items installed.

* Git
* Docker
* Angular
* Node
* NestJS
* Postgres
* MongoDB
* Redis
* Chartjs
* Jasmine
* Chai
* Jest


## Architecture

The architecture needs to ensure that the export service will remain robust during high traffic, e.g. instensive
usage by multiple users exporting large volumes of data.

This means for example that the MongoDB will not become overloaded and that no performance hits arise for those
trying to export the data.

The strategy consists of the following:

* Restrict access to authorized users [JSON Web Tokens](https://jwt.io).
* Use a [Rate Limiter](https://github.com/animir/node-rate-limiter-flexible) to limit too many API calls.
* Cache dataset results for recurring calls.
* Split date ranges into common interval blocks (days).
* Offload the actual export to the frontend client.

Here is a diagram illustrating these prinicples:

![Architecture Diagram](images/architecture.png)


### MongoDB

For exploring the data the [MongoDB Compass](https://www.mongodb.com/products/compass) GUI is used.

In the `docker-compose.yaml` file:
```
  mongo:
    image: mongo:latest
    container_name: 'mongo_db'
    environment:
      MONGO_INITDB_DATABASE: viriciti
      MONGO_INITDB_ROOT_USERNAME: viriciti
      MONGO_INITDB_ROOT_PASSWORD: viriciti
    healthcheck:
      test: ["CMD", "mongo", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 3
    volumes:
      - ./data/db/mongo:/data/db
    ports:
      - "27017:27017"
    networks:
      - viriciti-network
```

### Redis

For exploring the data the [Redis Desktop](https://redisdesktop.com) GUI is used.

In the `docker-compose.yaml` file:
```
  redis:
    image: bitnami/redis:latest
    container_name: 'redis_cache'
    environment:
      REDIS_PASSWORD: 'viriciti'
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 3
    volumes:
      - /data/db/redis
    ports:
      - "6379:6379"
    restart: always
    networks:
      - viriciti-network
```

## Installation

### Download and setup

From the command line execute the following.

```
$ git clone https://github.com/kgish/viriciti-assignment-export.git
$ cd viriciti-assignment-export
$ chmod +x ./init-all.sh
$ ./init-all.sh
```

### Populate the MongDB with vehicle data

```
$ docker-compose up mongo -d
$ ./mongo-restore.sh
$ mongdb-compass # verify vehicle databases were created
$ docker-compose down -v
```

Note: You will need to run the `mongo-restore.sh` script preceded with `FORCE=true` in order actually to do the import.

### Verify

Verify that everything has been installed correctly by running the following tests.

```
$ docker-compose up -d
$ docker-compose down -v
```

## Directory structure

There are five sub-directories:

```
.
├── assignment
├── backend
├── data
├── docker-compose.yaml
├── frontend
├── images
├── init-all.sh
├── mongo-restore.sh
├── README.md
└── tooling
```

### assignment

This is where the original assignment is located without any changes made to it.

### frontend

```
.
├── src
│   ├── app
│   │   ├── app*.*
│   │   ├── components
│   │   ├── guards
│   │   ├── interceptors
│   │   ├── lib
│   │   ├── modules
│   │   ├── pages
│   │   ├── pipes
│   │   └── services
│   ├── assets/
│   ├── environments/
│   ├── hmr.ts
│   ├── index.html
│   ├── main.ts
│   ├── polyfills.ts
│   ├── styles.scss
│   └── test.ts
├── tsconfig.*
└── tslint.json
```

### backend

```
.
├── config/
├── Dockerfile
├── nest-cli.json
├── package.json
├── src
│   ├── app.module.ts
│   ├── auth/
│   ├── config
│   │   ├── mongodb.config.ts
│   │   ├── rate-limiter.config.ts
│   │   ├── redis.config.ts
│   │   └── typeorm.config.ts
│   ├── health-check/
│   ├── lib
│   │   └── utils/
│   ├── main.ts
│   ├── microservices/
│   ├── vehicles/
│   └── verify-token/
│       ├── verifiy-token.controller.ts
│       └── verify-token.module.ts
├── test/
├── tsconfig.build.json
├── tsconfig.json
├── tslint.json
```

### tooling

This is where I refactored the original `unwind` and `unwind_test`

```
.
├── package.json
├── src
│   ├── app.ts
│   └── lib
│       └── unwind.stream.ts
├── tsconfig.json
└── tslint.json
```

### data

Contains the data dump as well as the shared volumes for the containers.

```
.
├── db
│   ├── mongo
│   ├── mongo-test
│   └── postgres
└── dump

```

## Tooling

See: [README.md](tooling/README.md)

## Backend

See: [README.md](backend/README.md)

## Frontend

See: [README.md](frontend/README.md)

## References

Here are some references in alphabetical order.

* [Angular](https://angular.io)
* [Async](https://caolan.github.io/async/v3)
* [CoffeeScript](https://coffeescript.org)
* [ECMAScript 6](http://es6-features.org)
* [Exports assignment](https://github.com/viriciti/exports-assignment)
* [Express Gateway](https://www.express-gateway.io)
* [JWT](https://jwt.io)
* [Material CDK](https://material.angular.io)
* [MongoDB Compass](https://www.mongodb.com/products/compass)
* [NestJS](https://nestjs.com)
* [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
* [Rate Limiter](https://github.com/animir/node-rate-limiter-flexible)
* [Redis Desktop](https://redisdesktop.com)
* [Redis](https://redis.io)
* [TypeScript](https://www.typescriptlang.org)
* [UnderscoreJS](https://underscorejs.org)
