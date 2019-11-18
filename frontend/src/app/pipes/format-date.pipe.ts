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
    return `${d.getFullYear()}-${this._pad(d.getMonth() + 1)}-${this._pad(d.getDay())}`;
  }

  _pad(n: number): string {
    return n.toString().padStart(2, '0');
  }
}
