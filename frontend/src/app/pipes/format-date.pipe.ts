import { Pipe, PipeTransform } from '@angular/core';

import {
  dateYYYYMMDD,
  dateYYYYMMDDHH,
  dateYYYYMMDDHHMM,
  dateYYYYMMDDHHMMSS,
  dateYYYYMMDDHHMMSSMS
} from '../lib/utils';

import { Unit } from '../global.types';

@Pipe({
  name: 'formatDate',
  pure: true
})
export class FormatDatePipe implements PipeTransform {

  format = {
    msec: dateYYYYMMDDHHMMSSMS,
    sec: dateYYYYMMDDHHMMSS,
    min: dateYYYYMMDDHHMM,
    hour: dateYYYYMMDDHH,
    day: dateYYYYMMDD
  };

  transform(timeMS: number | null, unit: Unit = 'msec'): string {
    return timeMS ? this._convertMStoDate(timeMS, unit) : '';
  }

  // Private
  _convertMStoDate(timeMS: number, unit: Unit) {
    const d = new Date(timeMS);
    const fn = this.format[ unit ];
    return fn(d);
  }
}
