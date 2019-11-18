// @ts-ignore
import _ from "underscore";
import { Transform } from "stream";

const unwindDocument = (document: any) => {
    const unwindLevel = (level: any, time: number, currentDepth: number): any[] => {
        const subLevels = _.sortBy(_.map((_.keys(level.values)), Number));
        if (subLevels.length && level.values[subLevels[0]].values) {
            return _.map(subLevels, subLevel => unwindLevel(level.values[subLevel], time + subLevel, currentDepth + 1));
        } else {
            return _.sortBy((_.map(level.values, (value, subtime) => ({
                time: time + +subtime,
                value,
            }))), (value, key) => key);
        }
    };

    return _.flatten(unwindLevel(document, +document._id, 0));
};

export default function(collection: any, start: number, end: number) {

    const query = {
        _id: {
            $gte: start - (start % 3600000),
            $lt: end,
        },
    };

    const source = collection
        .find(query)
        .batchSize(24)
        .sort({ _id: 1 })
        .stream();

    const unwind = new Transform({
        objectMode: true,
        transform(doc: any, enc: string, cb) {
            const points = unwindDocument(doc);
            points.forEach(point => this.push(point));
            cb();
        },
    });

    const reduce = new Transform({
        objectMode: true,
        transform(point, enc, cb) {
            if (point.time < start) {
                cb();
            }
            if (point.time > end) {
                cb();
            }
            cb(null, point);
        },
    });

    return source
        .pipe(unwind)
        .pipe(reduce);
}
