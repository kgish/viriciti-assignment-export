import { MongoClient } from "mongodb";
import { pipeline, Writable } from 'stream';
import { parallel } from 'async';

import * as fs from "fs";

import { unwindStream } from "./lib/unwind.stream";

const config = {
    db: {
        host: "localhost",
        port: 27017,
        username: "viriciti",
        password: "viriciti",
        settings: {
            useUnifiedTopology: true,
            connectTimeoutMS: 5000,
            socketTimeoutMS: 5000
        }
    }
};

interface IValues {
    soc: any;
    speed: number;
    current: number;
    odo: number;
    voltage: number;
}

const startTime = +(new Date());

const vehicle = process.argv[ 2 ] || 'vehicle_001';
const fromDate = process.argv[ 3 ] || '2018-01-01';
const toDate = process.argv[ 4 ] || '2018-12-31';

// Sanity check just in case.
if (+(new Date(fromDate)) > +(new Date(toDate))) {
    console.log('Sorry, but the fromDate must precede the toDate.');
    process.exit();
};

console.log(`vehicle='${vehicle}' fromDate='${fromDate}' toDate='${toDate}'`);

const handleError = (message: string, error: any) =>
    console.log('ERROR ' + message + ' : ' + (error.message || JSON.stringify(error)));

try {
    const uri = `mongodb://${config.db.username}:${config.db.password}@${config.db.host}:${config.db.port}`;
    MongoClient.connect(uri, config.db.settings, (error, client) => handleConnect(error, client));
} catch (error) {
    handleError('connect', error);
}

const handleConnect = (error, client: MongoClient) => {
    if (error) {
        handleError('connect', error);
    } else {
        console.log('Opened connection to database');
        handleConnectSuccess(client, () => {
            client.close().then(() => {
                console.log('Closed connection to database');
                console.log('Total processing time: %dms', +(new Date()) - startTime);
            });
        });
    }
};

const handleConnectSuccess = (client: MongoClient, cb) => {
    const fromMS = +(new Date(fromDate));
    const toMS = +(new Date(toDate));

    const results = {};

    parallel({
            soc: callback => getVehicleStats(client, vehicle, "soc", fromMS, toMS, results, callback),
            speed: callback => getVehicleStats(client, vehicle, "speed", fromMS, toMS, results, callback),
            current: callback => getVehicleStats(client, vehicle, "current", fromMS, toMS, results, callback),
            odo: callback => getVehicleStats(client, vehicle, "odo", fromMS, toMS, results, callback),
            voltage: callback => getVehicleStats(client, vehicle, "voltage", fromMS, toMS, results, callback)
        },
        (error) => {
            if (error) {
                console.log(`handleConnectSuccess() => NOK (${error.message})`);
            } else {
                console.log(`handleConnectSuccess() => OK`);
                handleResults(vehicle, fromDate, toDate, results);
            }
            cb();
        }
    );
};

const getVehicleStats = (client: MongoClient, v: string, attribute: string, fromMS: number, toMS: number,
                         results: any, callback: (error: NodeJS.ErrnoException | null) => void) => {
    const collection = client
        .db(v)
        .collection(attribute);

    const source = unwindStream(collection, fromMS, toMS);

    const sink = new Writable({
        objectMode: true,
        write(point, enc, cb) {
            const { time, value } = point;
            if (!results[ time ]) {
                results[ time ] = {};
                results[ time ].values = { soc: null, speed: null, current: null, odo: null, voltage: null };
            }
            results[ time ].values[ attribute ] = value;
            cb();
        }
    });

    pipeline([
        source,
        sink,
    ], (error: NodeJS.ErrnoException | null) => {
        if (error) {
            console.log(`getStats(${attribute}) => NOK (${error.message})`);
        } else {
            console.log(`getStats(${attribute}) => OK`);
        }
        callback(error);
    });
};

// Take the results and generate a csv file.
const handleResults = (v: string, from: string, to: string, results: any) => {
    const times = Object.keys(results).sort();
    const path = `${v}_${from}_${to}.csv`;
    const stream = fs.createWriteStream(path);
    stream.once('open', () => {
        stream.write("time,soc,speed,current,odo,voltage\n");
        times.forEach(t => {
            const e: IValues = results[ t ].values;
            stream.write(
                `${t},${fx(e.soc)},${fx(e.speed)},${fx(e.current)},${fx(e.odo)},${fx(e.voltage)}\n`);
        });
        stream.end();
    });
    console.log(`handleResults() => wrote ${times.length} results to ${path}`);
};

const fx = (n: number | null) => n === null ? '' : n;
