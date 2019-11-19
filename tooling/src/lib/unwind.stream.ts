import * as _ from "underscore";
import { Transform, TransformCallback } from "stream";
import { Collection, FilterQuery } from 'mongodb';

interface IDocument {
    _id: number;
    levels: number[];
    count: number;
    values: any;
}

interface IPoint {
    time: number;
    value: number;
}
const sortBy = (key) => (a, b) => (a[key] > b[key]) ? 1 : ((b[key] > a[key]) ? -1 : 0);

const unwindDocument = (document: IDocument) => {
    const unwindLevel = (level: IDocument, time: number, depth: number): any[] => {
        const subLevels = _.sortBy((Object.keys(level.values)).map(n => Number(n)));
        if (subLevels.length && level.values[subLevels[0]].values) {
            return subLevels.map(sl => unwindLevel(level.values[sl], time + sl, depth + 1));
        } else {
            return _.sortBy((_.map(level.values, (value, subtime) => ({
                time: time + +subtime,
                value,
            }))), (value, key) => key);
        }
    };

    return _.flatten(unwindLevel(document, +document._id, 0));
};

export const unwindStream = (collection: Collection, start: number, end: number) => {

    const query: FilterQuery<Collection> = {
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
        transform(document: IDocument, enc: string, cb: TransformCallback) {
            const points: IPoint[] = unwindDocument(document);
            points.forEach(point => this.push(point));
            cb();
        },
    });

    const reduce = new Transform({
        objectMode: true,
        transform(point: IPoint, enc: string, cb: TransformCallback) {
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
};
