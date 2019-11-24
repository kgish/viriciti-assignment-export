import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator, MatRadioChange, MatSnackBar, MatSort, MatTableDataSource } from '@angular/material';
import { Subscription } from 'rxjs';

import { Chart, ChartOptions } from 'chart.js';

import {
  AuthService,
  IValue,
  IVehicle,
  VehicleService
} from '../../services';

import {
  dateYYYY,
  dateYYYYMM,
  dateYYYYMMDD,
  dateYYYYMMDDHH0000,
  dateYYYYMMDDHHMM00,
  dateYYYYMMDDHHMMSS,
  exportToCsv
} from '../../lib';

import { Unit } from '../../global.types';
import { MatCheckboxChange } from '@angular/material/checkbox';

interface IPoint {
  x: number;
  y: number;
}

interface IDataValues {
  miny: number;
  maxy: number;
  data: IPoint[];
}

interface ICheckbox {
  name: string;
  checked: boolean;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: [ './home.component.scss' ]
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  @ViewChild('fromDate', { static: false }) fromDatepicker;
  @ViewChild('toDate', { static: false }) toDatepicker;

  title = 'Start';

  form: FormGroup;
  vehicles: IVehicle[];

  minDate = new Date('2018-01-01');
  minDate2 = new Date('2018-01-02');
  maxDate = new Date('2018-12-31');

  loading = false;

  pageOptions = [ 10, 25, 50, 100 ];
  displayedColumns: string[] = [ 'date', 'time', 'soc', 'speed', 'current', 'odo', 'voltage' ];
  dataSource = new MatTableDataSource<IValue>();

  values: IValue[] = [];

  units: Unit[] = [ 'msec', 'sec', 'min', 'hour', 'day' ];
  currentUnit: Unit = 'msec';

  attributes: ICheckbox[] = [
    { name: 'soc', checked: false },
    { name: 'speed', checked: false },
    { name: 'current', checked: false },
    { name: 'odo', checked: false },
    { name: 'voltage', checked: false },
  ];

  filters = {
    year: dateYYYY,
    month: dateYYYYMM,
    day: dateYYYYMMDD,
    hour: dateYYYYMMDDHH0000,
    min: dateYYYYMMDDHHMM00,
    sec: dateYYYYMMDDHHMMSS,
  };

  chartNames = [ 'soc', 'speed', 'current', 'odo', 'voltage' ];

  socChart: Chart;
  speedChart: Chart;
  currentChart: Chart;
  odoChart: Chart;
  voltageChart: Chart;

  private subscription: Subscription;

  constructor(private vehiclesService: VehicleService,
              private snackbar: MatSnackBar,
              private auth: AuthService,
              private fb: FormBuilder) {
  }

  ngOnInit() {
    this.subscription = this.vehiclesService.getVehicles().subscribe(vehicles => {
      this.vehicles = vehicles;
      if (vehicles.length) {
        this.form.get('vehicle').setValue(vehicles[0]);
      } else {
        this.auth.signout(false);
      }
    });

    this.form = this.fb.group({
      vehicle: [ '', [ Validators.required ] ],
      fromDate: [ '', [ Validators.required ] ],
      toDate: [ '', [ Validators.required ] ],
    });

    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.form.get('fromDate').setValue(this.minDate);
      this.form.get('toDate').setValue(this.minDate2);
    }, 200);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onSubmit() {
    const vehicle: IVehicle = this.form.value.vehicle;
    const fromDate: Date = this.form.value.fromDate;
    const toDate: Date = this.form.value.toDate;
    console.log(`onSubmit() value='${ JSON.stringify(vehicle) }' fromDate='${ fromDate }' toDate='${ toDate }'`);
    this.loading = true;
    const tm = +(new Date());
    setTimeout(() => {
      this.vehiclesService.getVehicleValues(vehicle, fromDate, toDate)
        .subscribe(values => {
            this.values = values;
            this._resetDataSource();
            this.snackbar.open(`Fetched ${ values.length } records in ${ +(new Date()) - tm } msecs.`, 'X', { duration: 5000 });
          },
          error => console.log(error),
          () => this.loading = false
        );

    }, 1000);
  }

  onDownload() {
    const vehicle: IVehicle = this.form.value.vehicle;
    const fromDate: Date = this.form.value.fromDate;
    const toDate: Date = this.form.value.toDate;
    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);
    // remove null values
    const data = this._resetDataSource().map(v => ({
      time: v.time,
      soc: v.soc === null ? '' : v.soc,
      speed: v.speed === null ? '' : v.speed,
      current: v.current === null ? '' : v.current,
      odo: v.odo === null ? '' : v.odo,
      voltage: v.voltage === null ? '' : v.voltage,
    }));
    textarea.value = exportToCsv(data, vehicle.name, fromDate, toDate);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }

  changeAttribute(event: MatCheckboxChange) {
    const checked = event.checked;
    const source = event.source;
    const name = source.name;
    console.log(`changeAttribute() name='${ name }' checked='${ checked }'`);
    const found = this.attributes.find(a => a.name === name);
    if (found) {
      found.checked = checked;
    } else {
      console.error(`changeAttribute() invalid name='${ name }'`);
    }
    console.log(`changeAttribute() attributes='${ JSON.stringify(this.attributes) }'`);
    this._resetDataSource();
  }

  unitChanged(event: MatRadioChange) {
    this.currentUnit = event.value;
    this._resetDataSource();
  }

  selectedIndexChange(event: number) {

    const chart = this.chartNames[event];

    const type = 'line';

    setTimeout(() => {
      // const { miny, maxy, data } = this._getDataValues(chart);
      const data = [
        { x: 10, y: 29 },
        { x: 11, y: 26 },
        { x: 12, y: 21 },
        { x: 15, y: 20 },
        { x: 19, y: 28 },
        { x: 20, y: 22 },
        { x: 25, y: 22 },
        { x: 27, y: 27 },
        { x: 28, y: 29 },
        { x: 33, y: 23 },
      ];

      // const options = this._setChartOptions(miny, maxy);
      const options = this._setChartOptions(20, 29);

      // console.log(`miny='${ miny }' maxy='${ maxy }'`);
      // console.log(data);

      this.socChart = new Chart(`${ chart }-chart`, {
        type,
        data: {
          labels: [],
          datasets: [ { fill: false, data } ]
        },
        options
      });
    }, 200);

  }

  // Private

  _resetDataSource(): IValue[] {
    let filteredValues = this.values;
    if (this.currentUnit !== 'msec') {
      const filter = this.filters[this.currentUnit];
      const list = {};
      filteredValues = [];

      const prev = {
        time: null,
        soc: { time: null, value: null },
        speed: { time: null, value: null },
        current: { time: null, value: null },
        odo: { time: null, value: null },
        voltage: { time: null, value: null },
      };

      const num = this.values.length;
      this.values.forEach((v, idx) => {
        const time = filter(new Date(v.time));
        if (!list[time]) {
          list[time] = { soc: null, speed: null, current: null, odo: null, voltage: null };
        }
        list[time].time = time;
        this.attributes.forEach(a => {
          const name = a.name;
          if (v[name] !== null) {
            if (list[time][name] === null) {
              list[time][name] = 0;
            }
            if (prev[name].time === null) {
              prev[name].time = v.time;
              prev[name].value = v[name];
            } else {
              const diff = v.time - prev[name].time;
              list[time][name] += diff * v[name];
            }
          }
        });

        if (prev.time !== null && (prev.time !== time || idx === num - 1)) {
          this.attributes.forEach(a => {
            const name = a.name;
            list[time][name] /= 1;
          });
        }
        prev.time = time;
      });

      Object.keys(list).sort().forEach(time => {
        const v = list[time];
        filteredValues.push({
          time: v.time,
          soc: v.soc,
          speed: v.speed,
          current: v.current,
          odo: v.odo,
          voltage: v.voltage,
        });
      });
    }

    const checked = this.attributes.filter(a => a.checked).map(v => v.name);
    if (checked.length) {
      filteredValues = filteredValues.filter(v => checked.every(a => v[a] !== null));
    }

    this.dataSource.data = filteredValues;

    return filteredValues;
  }

  // --- CHART --- //

  _setChartOptions(miny: number, maxy: number): ChartOptions {
    return {
      responsive: true,
      legend: { display: false },
      scales: {
        yAxes: [ {
          ticks: {
            min: miny,
            max: maxy
          }
        } ]
      }
    };
  }

  // Convert data to an array of (x, y) points, miny and maxy, ignoring undefined (null) values
  _getDataValues(chart: string): IDataValues {
    const result: IDataValues = { miny: 0, maxy: 0, data: [] };
    let first = true;
    this.values.forEach(v => {
      const x = v.time;
      const y = v[chart];
      if (y !== null) {
        if (first) {
          if (result.miny > y) {
            result.miny = y;
          }
          if (result.maxy < y) {
            result.maxy = y;
          }
          first = false;
        } else {
          result.miny = y;
          result.maxy = y;
        }
        result.data.push({ x, y });
      }
    });
    return result;
  }
}
