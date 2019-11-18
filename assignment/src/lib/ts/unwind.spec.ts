import { EJSON } from "bson";
import { MongoClient } from "mongodb";
import { pipeline, Writable } from "stream";
import * as chai from "chai";
import * as fs from "fs";

import unwindStream from "./unwind";

import async = require("async");

const assert = chai.assert;

const config = {
    db: {
        host: "localhost",
        port: 27018,
        name: "viriciti-test",
        username: "viriciti-test",
        password: "viriciti-test"
    }
};

let mongoClient: MongoClient;

describe("unwind", () => {
    before(done => {
        async.series([
            cb => {
                const uri = `mongodb://${ config.db.username }:${ config.db.password }@${ config.db.host }:${ config.db.port }`;
                MongoClient.connect(uri, { useUnifiedTopology: true }, (error, client) => {
                    mongoClient = client;
                    if (error) {
                        cb(error);
                    }
                    cb();
                });
            },

            cb => {
                mongoClient
                    .db(config.db.name)
                    .collection("speed")
                    .deleteMany({}, cb);
            },

            cb => {
                const ejson = fs
                    .readFileSync("./meta/test-data/vehicle_001_speed.json")
                    .toString();

                mongoClient
                    .db(config.db.name)
                    .collection("speed")
                    // @ts-ignore
                    .insertMany((EJSON.parse(ejson)), cb);
            }
        ], done);
    });

    after(done => {

        async.series([
            cb => {
                mongoClient
                    .db(config.db.name)
                    .collection("speed")
                    .deleteMany({}, cb);
            },

            cb => {
                mongoClient
                    .db(config.db.name)
                    // .dropDatabase(config.db.name, cb);
                    .dropDatabase(cb);
            },

            cb => {
                mongoClient.close(false, cb);
            }
        ], done);

    });

    it("should transform the stored document model and stream in a time-series format", done => {
        const collection = mongoClient
            .db(config.db.name)
            .collection("speed");

        const source = unwindStream(collection, (+new Date("2019-10-01")), (+new Date("2019-12-01")));

        const sink = new Writable({
            objectMode: true,
            write(point, enc, cb) {
                // @ts-ignore
                if (!this.prev) { this.prev = { time: 0, value: 0 };
                }
                // @ts-ignore
                if (!this.count) { this.count = 1;
                }
                // @ts-ignore
                this.count++;
                assert(point, `point='${ JSON.stringify(point) }'`);
                assert(point.time, `point.time='${ point.time }'`);
                assert(point.value !== null, `point.value='${ point.value }' !== null`);
                // @ts-ignore
                assert(point.time > this.prev.time, `point.time='${ point.time }' > prev.time='${ this.prev.time }'`);
                // @ts-ignore
                this.prev = point;
                cb();
            }
        });

        pipeline([
            source,
            sink,
        ], error => {
            if (error) {
                done(error);
            }

            assert(sink, `sink='${ sink }'`);
            // @ts-ignore
            assert.equal(sink.count, 37276, `sink.count='${ sink.count }' === 37276`);
            // @ts-ignore
            assert(sink.prev, `sink.prev='${ sink.prev }'`);
            // @ts-ignore
            assert.equal(sink.prev.time, 1572618753018, `sink.prev.time='${ sink.prev.time }' === 1572618753018`);
            // @ts-ignore
            assert.equal(sink.prev.value, 0, `sink.prev.value === 0`);

            done();
        });
    });
});
