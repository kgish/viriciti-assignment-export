import { Pipe, PipeTransform } from '@angular/core';

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
    return `${ d.getFullYear() }-${ this._pad(d.getMonth() + 1) }-${ this._pad(d.getDate() + 1) } ${ this._pad(d.getHours()) }:${ this._pad(d.getMinutes()) }:${ this._pad(d.getSeconds()) }.${ this._pad(d.getMilliseconds()) } `;
  }

  _pad(n: number): string {
    return n.toString().padStart(2, '0');
  }
}
