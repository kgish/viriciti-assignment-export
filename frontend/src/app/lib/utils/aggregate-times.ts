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

  const bookmark = {
    time: t0,
    soc: { time: v0.soc === null ? null : t0, value: v0.soc },
    speed: { time: v0.speed === null ? null : t0, value: v0.speed },
    current: { time: v0.current === null ? null : t0, value: v0.current },
    odo: { time: v0.odo === null ? null : t0, value: v0.odo },
    voltage: { time: v0.voltage === null ? null : t0, value: v0.voltage },
  };

  list[ filter(new Date(t0)) ] = { time: t0, soc: null, speed: null, current: null, odo: null, voltage: null };

  const num = data.length;
  data.slice(1).forEach((v, idx) => {
    const vtime: number = v.time;
    const t = filter(new Date(vtime));
    if (!list[ t ]) {
      // Finished previous time unit
      list[ t ] = resetList(bookmark, vtime, attributes);
      const tprev = filter(new Date(bookmark.time));
      list[ tprev ] = updateList(list, tprev, unit, attributes);
    }
    attributes.forEach(name => {
      const vvalue: number = v[ name ];
      if (vvalue !== null) {
        if (bookmark[ name ].time !== null) {
          const diff = vtime - bookmark[ name ].time;
          console.log(`${fx} name='${name}' value='${vvalue}' time='${vtime}' bookmark.time='${bookmark[ name ].time}' diff='${diff}'`);
          console.log(`${fx} BEFORE: list='${list[ t ][ name ]}'`);
          list[ t ][ name ] += diff * vvalue;
          console.log(`${fx} AFTER:  list='${list[ t ][ name ]}'`);
        }
        bookmark[ name ].time = vtime;
        bookmark[ name ].value = vvalue;
      }
    });

    if (idx === num - 1) {
      // We've reached the end of the data.
      list[ t ] = updateList(list, t, unit, attributes);
    } else {
      // Still going strong.
      bookmark.time = vtime;
    }
  });

  // Sort results by time
  Object.keys(list).sort().forEach(time => {
    result.push(list[ time ]);
  });

  return result;
}

const resetList = (bookmark, time, attributes) => {
  const fx = `${fn} resetList()`;
  console.log(`${fx} bookmark='${JSON.stringify(bookmark)}' time='${time}'`);
  const result = { time };

  attributes.forEach(name => result[ name ] = bookmark[ name ].value);

  console.log(`${fx} result='${JSON.stringify(result)}'`);
  return result;
};

const updateList = (list, t, unit: Unit, attributes: string[]) => {
  const fx = `${fn} updateList()`;

  console.log(`${fx} list='${JSON.stringify(list)}' t='${t}'`);
  const result = list[ t ];
  console.log(`${fx} BEFORE: result='${JSON.stringify(result)}'`);
  attributes.forEach(name => {
    console.log(`${fx} name='${name}' BEFORE: list='${result[ name ]}'`);
    if (result[ name ]) {
      result[ name ] /= unitIntervals[ unit ];
    }
    console.log(`${fx} name='${name}' AFTER:  list='${result[ name ]}'`);
  });
  console.log(`${fx} AFTER:  result='${JSON.stringify(result)}'`);
  return result;
};

