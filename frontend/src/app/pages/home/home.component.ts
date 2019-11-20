import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { Subscription } from 'rxjs';

import { IValue, IVehicle, VehicleService } from '../../services';
import { MatRadioChange } from '@angular/material/radio';
import {
  dateYYYY,
  dateYYYYMM,
  dateYYYYMMDD,
  dateYYYYMMDDHH0000,
  dateYYYYMMDDHHMM00,
  dateYYYYMMDDHHMMSS, exportToCsv,
} from '../../lib/utils';

type Unit = 'msec' | 'sec' | 'min' | 'hour' | 'day';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: [ './home.component.scss' ]
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  @ViewChild('fromDate', { static: false }) fromTo;
  @ViewChild('toDate', { static: false }) dateTo;

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

  private subscription: Subscription;

  constructor(private vehiclesService: VehicleService,
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
    setTimeout(() => {
      this.vehiclesService.getVehicleValues(vehicle, fromDate, toDate)
        .subscribe(values => {
            this.values = values;
            this._resetDataSource();
          },
          error => console.log(error),
          () => this.loading = false);

    }, 1000);
  }

  onDownload() {
      const textarea = document.createElement('textarea');
      document.body.appendChild(textarea);
      textarea.value = exportToCsv(this._resetDataSource());
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
  }

  unitChanged(event: MatRadioChange) {
    this.currentUnit = event.value;
    this._resetDataSource();
  }

  // Private

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
}
