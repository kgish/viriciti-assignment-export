import { Pipe, PipeTransform } from '@angular/core';

import { dateYYYYMMDDHHSSMS } from '../lib/utils';

@Pipe({
  name: 'formatDate',
})
export class FormatDatePipe implements PipeTransform {

  transform(timeMS: number | null): string {
    return timeMS ? this._convertMStoDate(timeMS) : '';
  }

  // Private
  _convertMStoDate(timeMS) {
    const d = new Date(timeMS);
    return dateYYYYMMDDHHSSMS(d);
  }
}
