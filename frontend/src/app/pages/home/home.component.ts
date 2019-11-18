import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDatepicker, MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { Subscription } from 'rxjs';

import { IValue, IVehicle, VehicleService } from '../../services';

type Unit = 'msec' | 'sec' | 'min' | 'hour' | 'day'

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
  maxDate = new Date('2018-12-31');

  loading = false;

  pageOptions = [ 10, 25, 50, 100 ];
  displayedColumns: string[] = [ 'date', 'time', 'soc', 'speed', 'current', 'odo', 'voltage' ];
  dataSource = new MatTableDataSource<IValue>();

  values: IValue[];

  units: Unit[] = [ 'msec', 'sec', 'min', 'hour', 'day' ];

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
      unit: [ '' ],
    });

    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.form.get('fromDate').setValue(this.minDate);
      this.form.get('toDate').setValue(this.minDate);
    }, 200);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onSubmit() {
    const vehicle: IVehicle = this.form.value.vehicle;
    const fromDate: Date = this.form.value.fromDate;
    const toDate: Date = this.form.value.toDate;
    const unit: Unit = this.form.value.unit;
    console.log(`onSubmit() value='${ JSON.stringify(vehicle) }' fromDate='${ fromDate }' toDate='${ toDate }' unit='${unit}'`);
    this.loading = true;
    setTimeout(() => {
      this.vehiclesService.getVehicleValues(vehicle)
        .subscribe(values => {
            this.values = values;
            this.dataSource.data = values;
          },
          error => console.log(error),
          () => this.loading = false);

    }, 1000);
  }

  onDownload() {
    console.log('onDownload() called');
  }
}
