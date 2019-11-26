# Tooling

## Introduction

TODO

## Test

The main application uses a test MongoDB which looks like this.

docker-compose.yaml
```
mongo-test:
  image: mongo:latest
  container_name: 'mongo_test_db'
  environment:
    NODE_ENV: development
    MONGO_INITDB_DATABASE: viriciti-test
    MONGO_INITDB_ROOT_USERNAME: viriciti-test
    MONGO_INITDB_ROOT_PASSWORD: viriciti-test
  healthcheck:
    test: ["CMD", "mongo", "--eval", "db.adminCommand('ping')"]
    interval: 10s
    timeout: 5s
    retries: 3
  volumes:
    - ./data/db/mongo-test:/data/db
  ports:
    - "27018:27017"
  networks:
    - viriciti-network
```

Ensure that the test MongoDB is running by executing the following command.

```
$ docker-compose up mongo-test
```

Run the test.

```
$ npm start
```

Cleanup.

```
$ docker-compose down mongo-test
```

That's all for now folks.
