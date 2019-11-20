const padz = (n: number): string => n.toString().padStart(2, '0');

export const dateYYYY = (d: Date) => `${ d.getFullYear() }`;
export const dateYYYYMM = (d: Date) => `${ dateYYYY(d) }-${ padz(d.getMonth() + 1) }`;
export const dateYYYYMMDD = (d: Date) => `${ dateYYYYMM(d) }-${ padz(d.getDate()) }`;
export const dateYYYYMMDDHH = (d: Date) => `${ dateYYYYMMDD(d) } ${ padz(d.getHours()) }`;
export const dateYYYYMMDDHH0000 = (d: Date) => `${ dateYYYYMMDDHH(d) }:00:00`;
export const dateYYYYMMDDHHMM = (d: Date) => `${ dateYYYYMMDDHH(d) }:${ padz(d.getMinutes())}`;
export const dateYYYYMMDDHHMM00 = (d: Date) => `${ dateYYYYMMDDHHMM(d) }:00`;
export const dateYYYYMMDDHHMMSS = (d: Date) => `${ dateYYYYMMDDHH(d) }:${ padz(d.getSeconds())}`;
export const dateYYYYMMDDHHMMSSMS = (d: Date) => `${ dateYYYYMMDDHHMMSS(d) }.${ padz(d.getMilliseconds()).padStart(3, '0') }`;

import { ExportToCsv } from 'export-to-csv';

const csvExporter = new ExportToCsv({
  fieldSeparator: ',',
  quoteStrings: '"',
  decimalSeparator: '.',
  showLabels: true,
  showTitle: false,
  useTextFile: false,
  useBom: true,
  useKeysAsHeaders: true,
});

export function exportToCsv(data): string {

  return csvExporter.generateCsv(data);
}
