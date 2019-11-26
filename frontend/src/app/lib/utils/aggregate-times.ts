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

export function aggregateTimes(data: IValue[], interval: Unit): IValue[] {
  const filter = this.filters[interval];
  const list = {};

  // Setup all the initial values
  const v0 = this.values[0];
  const t0 = v0.time;
  const bookmark = {
    time: t0,
    soc: { time: v0.soc === null ? null : t0, value: v0.soc },
    speed: { time: v0.speed === null ? null : t0, value: v0.speed },
    current: { time: v0.current === null ? null : t0, value: v0.current },
    odo: { time: v0.odo === null ? null : t0, value: v0.odo },
    voltage: { time: v0.voltage === null ? null : t0, value: v0.voltage },
  };
  //
  // list[filter(new Date(t0))] = { time: t0, soc: null, speed: null, current: null, odo: null, voltage: null };
  //
  // const num = this.values.length;
  // this.values.slice(1).forEach((v, idx) => {
  //   const vtime: number = v.time;
  //   const t = filter(new Date(vtime));
  //   if (!list[t]) {
  //     // Finished previous time interval
  //     list[t] = resetList(bookmark, vtime);
  //     const tprev = filter(new Date(bookmark.time));
  //     list[tprev] = updateList(list, tprev);
  //   }
  //   this.attributes.forEach(a => {
  //     const name: string = a.name;
  //     const vvalue: number = v[name];
  //     if (vvalue !== null) {
  //       if (bookmark[name].time !== null) {
  //         const diff = vtime - bookmark[name].time;
  //         // console.log(`${fn} aggregateTimes() name='${ name }' value='${ vvalue }' time='${ vtime }' bookmark='${ bookmark[name].time }' diff='${ diff }'`);
  //         // console.log(`${fn} aggregateTimes() BEFORE: list='${ list[t][name] }'`);
  //         list[t][name] += diff * vvalue;
  //         // console.log(`${fn} aggregateTimes() AFTER:  list='${ list[t][name] }'`);
  //       }
  //       bookmark[name].time = vtime;
  //       bookmark[name].value = vvalue;
  //     }
  //   });
  //
  //   if (idx === num - 1) {
  //     // We've reached the end of the data.
  //     list[t] = updateList(list, t);
  //   } else {
  //     // Still going strong.
  //     bookmark.time = vtime;
  //   }
  // });
  //
  // Object.keys(list).sort().forEach(time => {
  //   const v = list[time];
  //   filteredValues.push({
  //     time: v.time,
  //     soc: v.soc,
  //     speed: v.speed,
  //     current: v.current,
  //     odo: v.odo,
  //     voltage: v.voltage,
  //   });
  // });
  return data;
}

const resetList = (bookmark, t) => {
  console.log(`${ fn } resetList() bookmark='${ JSON.stringify(bookmark) }' t='${ t }'`);
  const result = {
    time: t,
    soc: bookmark.soc.value,
    speed: bookmark.speed.value,
    current: bookmark.current.value,
    odo: bookmark.speed.value,
    voltage: bookmark.speed.value
  };
  console.log(`${ fn } resetList() result='${ JSON.stringify(result) }'`);
  return result;
};

const updateList = (list, t) => {
  console.log(`${ fn } updateList() list='${ JSON.stringify(list) }' t='${ t }'`);
  const result = list[t];
  console.log(`${ fn } updateList() BEFORE: result='${ JSON.stringify(result) }'`);
  this.attributes.forEach(a => {
    const name = a.name;
    console.log(`${ fn } updateList() name='${ name }' BEFORE: list='${ result[name] }'`);
    if (result[name]) {
      result[name] /= unitIntervals[this.currentUnit];
    }
    console.log(`${ fn } updateList() name='${ name }' AFTER:  list='${ result[name] }'`);
  });
  console.log(`${ fn } updateList() AFTER:  result='${ JSON.stringify(result) }'`);
  return result;
};

