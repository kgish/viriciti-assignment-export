import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { MatRadioChange } from '@angular/material/radio';
import { Subscription } from 'rxjs';

import { Chart, ChartOptions } from 'chart.js';

import {
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
import { MatSnackBar } from '@angular/material/snack-bar';

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

  filters = {
    year: dateYYYY,
    month: dateYYYYMM,
    day: dateYYYYMMDD,
    hour: dateYYYYMMDDHH0000,
    min: dateYYYYMMDDHHMM00,
    sec: dateYYYYMMDDHHMMSS,
  };

  socChart: Chart;
  speedChart: Chart;
  currentChart: Chart;
  odoChart: Chart;
  voltageChart: Chart;

  private subscription: Subscription;

  constructor(private vehiclesService: VehicleService,
              private snackbar: MatSnackBar,
              private fb: FormBuilder) {
  }

  ngOnInit() {
    this.subscription = this.vehiclesService.getVehicles().subscribe(vehicles => {
      this.vehicles = vehicles;
      this.form.get('vehicle').setValue(vehicles[0]);
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
          () => this.loading = false);

    }, 1000);
  }

  onDownload() {
    const vehicle: IVehicle = this.form.value.vehicle;
    const fromDate: Date = this.form.value.fromDate;
    const toDate: Date = this.form.value.toDate;
    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);
    textarea.value = exportToCsv(this._resetDataSource(), vehicle.name, fromDate, toDate);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }

  unitChanged(event: MatRadioChange) {
    this.currentUnit = event.value;
    this._resetDataSource();
  }

  selectedIndexChange(event: number) {
    const charts = [ 'soc', 'speed', 'current', 'odo', 'voltage' ];

    const chart = charts[event];

    const type = 'line';
    const options: ChartOptions = {
      responsive: true,
      legend: {
        display: false
      }
    };

    setTimeout(() => {
      this.socChart = new Chart(`${ chart }-chart`, {
        type,
        data: {
          labels: [],
          datasets: [ {
            data: this._getDataValues(chart)
          } ]
        },
        options
      });
    }, 200);

  }

  // Private

  _getDataValues(chart: string) {
    console.log(this.values);
    const data = this.values.map(v => ({ x: v.time, y: v[chart] }));
    console.log(data);
    return data;
  }

  _resetDataSource(): IValue[] {
    let filteredValues = this.values;
    if (this.currentUnit !== 'msec') {
      const filter = this.filters[this.currentUnit];
      const list = {};
      filteredValues = [];
      this.values.forEach(v => {
        const time = filter(new Date(v.time));
        if (!list[time]) {
          list[time] = { soc: 0, speed: 0, current: 0, odo: 0, voltage: 0 };
        }
        list[time].time = time;
        list[time].soc += v.soc;
        list[time].speed += v.speed;
        list[time].current += v.current;
        list[time].odo += v.odo;
        list[time].voltage += v.voltage;
      });
      Object.keys(list).sort().forEach(time => {
        const v = list[time];
        filteredValues.push({
          time: v.time,
          soc: v.soc || '',
          speed: v.speed || '',
          current: v.current || '',
          odo: v.odo || '',
          voltage: v.voltage || '',
        });
      });
    }
    this.dataSource.data = filteredValues;
    return filteredValues;
  }

  _renderCharts() {

    const type = 'line';
    const options: ChartOptions = {
      responsive: true,
      legend: {
        position: 'right'
      }
    };

    this.socChart = new Chart('soc-chart', {
      type,
      data: {
        labels: [],
        datasets: [ {
          data: [ { x: 10, y: 20 }, { x: 20, y: 10 }, { x: 30, y: 50 } ]
        } ]
      },
      options
    });

    this.speedChart = new Chart('speed-chart', {
      type,
      data: {},
      options
    });

    this.currentChart = new Chart('current-chart', {
      type,
      options
    });

    this.odoChart = new Chart('odo-chart', {
      type,
      options
    });

    this.voltageChart = new Chart('voltage-chart', {
      type,
      data: {},
      options
    });
  }
}
