# Tooling

## Introduction

In this project, I refactored the original coffeeScript `unwind.coffee` and `unwind_test.coffee` files from the original assignment and converted them with TypeScript.

This was useful as I could better understand what these scripts do as well testing for robust code which is type checked and conforms better to the newer ES6 standards.

## Directory

The directory structure looks like this.

```
.
├── dist
│   ├── app.js
│   ├── app.js.map
│   └── lib
│       ├── unwind.stream.js
│       └── unwind.stream.js.map
├── package.json
├── package-lock.json
├── README.md
├── src
│   ├── app.ts
│   └── lib
│       └── unwind.stream.ts
├── tsconfig.json
└── tslint.json
```

The `app.ts` is the main node program which does the following:

* read config
* read and verify args
* connect to MongoDB if possible
* get vehicle stats: soc, speed, current, odo, voltage
* collate results and order by date
* generate a CSV file


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
vehicle='vehicle_001' fromDate='2018-10-01' toDate='2018-10-02'
Opened connection to database
getStats(soc) => OK
getStats(speed) => OK
getStats(current) => OK
getStats(odo) => OK
getStats(voltage) => OK
handleConnectSuccess() => OK
handleResults() => wrote 182171 results to vehicle_001_2018-10-01_2018-10-02.csv
Closed connection to database
Total processing time: 1523ms
```

The CSV file which is generated is called `vehicle_001_2018-10-01_2018-10-02.csv`.

Finally, you should cleanup.

```
$ docker-compose down mongo-test
```

## Run

If you would prefer using a different vehicle and date range, run the following command.

```
$ ./node_modules/.bin/tsc && node dist/app.js vehicle_00N fromDate toDate
```

where
```
N = 1,2,3
fromDate = YYYY-MM-DD
toDate = YYYY-MM-DD
```

The CSV file which is generated will be called `vehicle_00N_YYYY-MM-DD_.csv`.

## Conclusion

That's all for now folks.
