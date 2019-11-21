import { ExportToCsv } from 'export-to-csv';
import { dateYYYYMMDD } from './date-format';

export function exportToCsv(data: any[], vehicle: string, fromDate: Date, toDate: Date): string {

  const filename = `${vehicle}-${dateYYYYMMDD(fromDate)}-${dateYYYYMMDD(toDate)}`;

  const csvExporter = new ExportToCsv({
    filename,
    fieldSeparator: ',',
    quoteStrings: '"',
    decimalSeparator: '.',
    showLabels: true,
    showTitle: false,
    useTextFile: false,
    useBom: true,
    useKeysAsHeaders: true,
  });

  return csvExporter.generateCsv(data);
}
