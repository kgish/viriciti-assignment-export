import { IValue } from '../../services';
import { Unit, unitIntervals } from '../../global.types';
import {
  dateYYYY,
  dateYYYYMM,
  dateYYYYMMDD,
  dateYYYYMMDDHH0000,
  dateYYYYMMDDHHMM00,
  dateYYYYMMDDHHMMSS
} from './date-format';

const filters = {
  year: dateYYYY,
  month: dateYYYYMM,
  day: dateYYYYMMDD,
  hour: dateYYYYMMDDHH0000,
  min: dateYYYYMMDDHHMM00,
  sec: dateYYYYMMDDHHMMSS,
};

const fn = 'aggregateTimes';

export function aggregateTimes(data: IValue[], unit: Unit): IValue[] {
  const result: IValue[] = [];
  const filter = filters[ unit ];
  const list = {};

  const fx = `${fn} aggregateTimes()`;

  // Setup all the initial values
  const v0 = data[ 0 ];
  const t0 = v0.time;

  const attributes: string[] = Object.keys(v0).filter(key => key !== 'time');

  const bookmark = { time: t0 };
  attributes.forEach(attr => bookmark[ attr ] = { time: v0[ attr ] === null ? null : v0[ attr ], value: v0[ attr ] });

  list[ filter(new Date(t0)) ] = { time: t0, soc: null, speed: null, current: null, odo: null, voltage: null };

  // Important: takes next slice(1) into account.
  const num = data.length - 1;

  data.slice(1).forEach((d, idx) => {
    const dt: number = d.time;
    const t: string = filter(new Date(dt));
    if (!list[ t ]) {
      // Finished previous time unit
      list[ t ] = createList(bookmark, dt, attributes);
      const tprev = filter(new Date(bookmark.time));
      list[ tprev ] = finalizeList(list, tprev, unit, attributes);
    }
    attributes.forEach(attr => {
      const dv: number = d[ attr ];
      if (dv !== null) {
        if (bookmark[ attr ].time !== null) {
          const diff = dt - bookmark[ attr ].time;
          console.log(`${fx} attr='${attr}' value='${dv}' time='${dt}' bookmark.time='${bookmark[ attr ].time}' diff='${diff}'`);
          console.log(`${fx} BEFORE: list='${list[ t ][ attr ]}'`);
          list[ t ][ attr ] += diff * dv;
          console.log(`${fx} AFTER:  list='${list[ t ][ attr ]}'`);
        }
        bookmark[ attr ].time = dt;
        bookmark[ attr ].value = dv;
      }
    });

    if (idx === num - 1) {
      // We've reached the end of the data.
      list[ t ] = finalizeList(list, t, unit, attributes);
    } else {
      // Still going strong.
      bookmark.time = dt;
    }
  });

  // Sort results by time
  Object.keys(list).sort().forEach(time => {
    result.push(list[ time ]);
  });

  return result;
}

// Create a new list for given time and set to current bookmark value
// for restarting the new time interval.
const createList = (bookmark, time, attributes) => {
  const fx = `${fn} createList()`;
  console.log(`${fx} bookmark='${JSON.stringify(bookmark)}' time='${time}' attributes='${attributes}'`);

  const result = { time };
  attributes.forEach(attr => result[ attr ] = bookmark[ attr ].value);

  console.log(`${fx} result='${JSON.stringify(result)}'`);
  return result;
};

// Finalize the previous list by calculating the averages of all
// attributes within the previous time slot. This occurs when
// either the next time interval or the end of the last interval
// has been detected.
const finalizeList = (list, t, unit: Unit, attributes: string[]) => {
  const fx = `${fn} finalizeList()`;

  console.log(`${fx} list='${JSON.stringify(list)}' t='${t}' unit='${unit}' attributes='${attributes}'`);
  const result = list[ t ];
  console.log(`${fx} BEFORE: result='${JSON.stringify(result)}'`);
  attributes.forEach(attr => {
    console.log(`${fx} attr='${attr}' BEFORE: result='${result[ attr ]}'`);
    if (result[ attr ]) {
      result[ attr ] /= unitIntervals[ unit ];
    }
    console.log(`${fx} attr='${attr}' AFTER:  result='${result[ attr ]}'`);
  });
  console.log(`${fx} AFTER:  result='${JSON.stringify(result)}'`);
  return result;
};

