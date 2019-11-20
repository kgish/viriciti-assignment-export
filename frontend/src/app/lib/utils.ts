export const padz = (n: number): string => n.toString().padStart(2, '0');
export const dateYYYYMMDD = (d: Date) => `${ d.getFullYear() }-${ padz(d.getMonth() + 1) }-${ padz(d.getDate()) }`;
export const dateYYYYMMDDHHSS = (d: Date) =>
  `${ dateYYYYMMDD(d) }-${ padz(d.getDate()) } ${ padz(d.getHours()) }:${ padz(d.getMinutes()) }:${ padz(d.getSeconds()) }`;
export const dateYYYYMMDDHHSSMS = (d: Date) => `${ dateYYYYMMDDHHSS(d) }.${ padz(d.getMilliseconds()).padStart(3, '0') }`;
