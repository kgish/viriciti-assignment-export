import { MongoClient } from "mongodb";
import { pipeline, Writable } from 'stream';
import { parallel } from 'async';

import * as fs from "fs";

import { unwindStream } from "./unwind.stream";

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

interface IEvent {
    time: number;
    values: IValues;
}

const handleError = (message: string, error: any) =>
    console.log('ERROR ' + message + ' : ' + (error.message || JSON.stringify(error)));

try {
    const uri = `mongodb://${ config.db.username }:${ config.db.password }@${ config.db.host }:${ config.db.port }`;
    MongoClient.connect(uri, config.db.settings, (error, client) => handleConnect(error, client));
} catch (error) {
    handleError('connect', error);
}

const handleConnect = (error, client: MongoClient) => {
    if (error) {
        handleError('connect', error);
    } else {
        handleConnectSuccess(client, () => {
            client.close();
        });
    }
};

const handleConnectSuccess = (client: MongoClient, cb) => {
    const fromDate = "2018-10-01";
    const toDate = "2018-10-02";
    const fromMS = +(new Date(fromDate));
    const toMS = +(new Date(toDate));
    const vehicle = "vehicle_001";

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
                console.log(`handleConnectSuccess() => NOK (${ error.message })`);
            } else {
                console.log(`handleConnectSuccess() => OK`);
                handleResults(vehicle, fromDate, toDate, results);
            }
            cb();
        }
    );
};

const getVehicleStats = (client: MongoClient, vehicle: string, attribute: string, fromMS: number, toMS: number,
                         results: any, callback: (error: NodeJS.ErrnoException | null) => void) => {
    const collection = client
        .db(vehicle)
        .collection(attribute);

    const source = unwindStream(collection, fromMS, toMS);

    const sink = new Writable({
        objectMode: true,
        write(point, enc, cb) {
            const { time, value } = point;
            if (!results[time]) {
                results[time] = {};
                results[time].values = { soc: null, speed: null, current: null, odo: null, voltage: null };
            }
            results[time].values[attribute] = value;
            cb();
        }
    });

    pipeline([
        source,
        sink,
    ], (error: NodeJS.ErrnoException | null) => {
        if (error) {
            console.log(`getStats(${ attribute }) => NOK (${ error.message })`);
        } else {
            console.log(`getStats(${ attribute }) => OK`);
        }
        callback(error);
    });
};

const handleResults = (vehicle: string, fromDate: string, toDate: string, results: any) => {
    const times = Object.keys(results).sort();
    const path = `${ vehicle }_${ fromDate }_${ toDate }.csv`;
    const stream = fs.createWriteStream(path);
    stream.once('open', fd => {
        stream.write("time,soc,speed,current,odo,voltage\n");
        times.forEach(t => {
            const e: IValues = results[t].values;
            stream.write(
                `${ t },${ fx(e.soc) },${ fx(e.speed) },${ fx(e.current) },${ fx(e.odo) },${ fx(e.voltage) }\n`);
        });
        stream.end();
    });
    console.log(`handleResults() => wrote ${ times.length } results to ${ path }`);
};

const fx = (n: number | null) => n === null ? '' : n;
