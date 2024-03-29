import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator, MatRadioChange, MatSnackBar, MatSort, MatTableDataSource } from '@angular/material';
import { Subscription } from 'rxjs';

import {
  AuthService,
  ChartService, IChartData,
  IValue,
  IVehicle,
  VehicleService
} from '../../services';

import {
  exportToCsv,
  aggregateTimes
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
  disabled: boolean;
}

const fn = 'HomeComponent';

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
    { name: 'soc', checked: false, disabled: true },
    { name: 'speed', checked: false, disabled: true },
    { name: 'current', checked: false, disabled: true },
    { name: 'odo', checked: false, disabled: true },
    { name: 'voltage', checked: false, disabled: true },
  ];

  chartNames = [ 'soc', 'speed', 'current', 'odo', 'voltage' ];

  private subscription: Subscription;

  constructor(private vehiclesService: VehicleService,
              private snackbar: MatSnackBar,
              private auth: AuthService,
              private chartService: ChartService,
              private fb: FormBuilder) {
  }

  ngOnInit() {
    this.subscription = this.vehiclesService.getVehicles().subscribe(vehicles => {
      this.vehicles = vehicles;
      if (vehicles.length) {
        this.form.get('vehicle').setValue(vehicles[0]);
      } else {
        this.snackbar.open(
          'No vehicles found, either signin again or ensure MongoDB is running and has been seeded with data.',
          'X', { duration: 5000 });
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
            this._enableCheckboxes();
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

  applyFilter(event: any) {
    const filterValue = event.target.value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  getAttribute(name: string): ICheckbox {
    return this.attributes.find(attr => attr.name === name);
  }

  disabledAttribute(name: string): boolean {
    let result = true;
    const attr = this.getAttribute(name);
    if (attr) {
      result = attr.disabled;
    } else {
      console.error(`disabledAttribute() invalid name='${ name }'`);
    }
    return result;
  }

  // TODO: FRONTEND Use real data instead of dummy data.
  selectedIndexChange(index: number) {
    const tabs = this.attributes.filter(a => !a.disabled).map(a => a.name);
    const attr = tabs[index];

    if (attr) {
      const chartId = `${ attr }-chart`;
      const n = this._randomScalingFactor(100);
      const len = this._randomScalingFactor(100);
      const data = [];

      let next = 0;

      for (let j = 0; j < len; j++) {
        data.push({
          x: next,
          y: this._randomScalingFactor(n)
        });
        next += this._randomScalingFactor(10);
      }

      setTimeout(() =>
          this.chartService.renderChart(chartId, data, this.currentUnit, 'blue'),
        // this.chartService.renderChart(chartId, this._convertData(this.dataSource.data, this.currentUnit), this.currentUnit),
        500);
    } else {
      console.log(`${ fn } selectedIndexChange() invalid index='${ index }'`);
    }
  }

  // Private

  // Only enable the table header checkboxes if non-null values present.
  _enableCheckboxes() {
    if (!this.values || !this.values.length) {
      return;
    }

    this.attributes.forEach(attr => {
      const name = attr.name;
      this.getAttribute(name).disabled = !this.values.some(v => v[name] !== null);
    });
  }

  _resetDataSource(): IValue[] {
    let filteredValues = this.values;

    if (!this.values || !this.values.length) {
      return filteredValues;
    }

    if (this.currentUnit !== 'msec') {
      const enabled = this.attributes.filter(attr => !attr.disabled).map(attr => attr.name);
      filteredValues = aggregateTimes(this.values, this.currentUnit, enabled);
    }

    // If one or more of the attribute checkboxes are checked, then filter out those
    // records which contain null values for those checked attributes.
    const checked = this.attributes.filter(a => a.checked).map(v => v.name);
    if (checked.length) {
      filteredValues = filteredValues.filter(v => checked.every(a => v[a] !== null));
    }

    this.dataSource.data = filteredValues;

    return filteredValues;
  }

  // Convert IValue data records to Chart data records { x: xval, y: yval }
  _convertData(data: IValue[], attr: string): IChartData[] {
    return data.map(d => ({ x: d.time, y: d[attr] }));
  }

  _randomScalingFactor(n: number) {
    return Math.round(n * (Math.random() + 1));
  }
}
