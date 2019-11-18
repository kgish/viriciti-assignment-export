import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit, QueryList,
  ViewChild, ViewChildren
} from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDatepicker, MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { Subscription } from 'rxjs';

import { IValue, IVehicle, VehicleService } from '../../services';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: [ './home.component.scss' ]
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  @ViewChild('selectVehicle', { static: false }) selectVehicle: ElementRef;
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

  private subscription: Subscription;

  constructor(private vehiclesService: VehicleService,
              private fb: FormBuilder) {
  }

  ngOnInit() {
    this.subscription = this.vehiclesService.getVehicles().subscribe(vehicles => this.vehicles = vehicles);

    this.form = this.fb.group({
      vehicle: [ '', [ Validators.required ] ],
      fromDate: [ '', [ Validators.required ] ],
      toDate: [ '', [ Validators.required ] ],
    });

    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngAfterViewInit(): void {
    // Need to use setTimeout() to avoid ExpressionChangedAfterItHasBeenCheckedError.
    setTimeout(() => {
        // Put focus on the first select field
        this.selectVehicle.nativeElement.focus();

        // this.dateFrom.select(this.minDate);
      }, 200
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onSubmit() {
    const vehicle: IVehicle = this.form.value.vehicle;
    console.log(`onSubmit() vehicle='${JSON.stringify(vehicle)}'`);
    this.loading = true;
    setTimeout(() => {
      this.vehiclesService.getVehicleValues(vehicle)
        .subscribe(values => {
            this.values = values;
            this.dataSource.data = values;
          },
          error => console.log(error),
          () => this.loading = false);

    }, 3000);
  }

  onDownload() {
    console.log('onDownload() called');
  }
}
