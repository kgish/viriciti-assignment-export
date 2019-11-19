import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

import { IValue, IVehicle } from './vehicle.model';
import { catchError } from 'rxjs/operators';

const fn = 'VehicleService';

@Injectable({
  providedIn: 'root'
})
export class VehicleService {

  private vehicles: IVehicle[] = [
    { id: 1001, name: 'vehicle_001' },
    { id: 1002, name: 'vehicle_002' },
    { id: 1003, name: 'vehicle_003' },
  ];

  private values: IValue[] = [
    {
      time: +(new Date('2018-01-01 20:21:33.142')),
      soc: 5, speed: null, current: 100, odo: null, voltage: null
    },
    {
      time: +(new Date('2018-01-01 20:21:33.145')),
      soc: 10, speed: 1, current: 102, odo: null, voltage: null
    },
    {
      time: +(new Date('2018-01-01 20:21:33.156')),
      soc: 11, speed: 2, current: null, odo: 10222, voltage: 23
    },
    {
      time: +(new Date('2018-01-01 20:21:33.161')),
      soc: 9, speed: 5, current: 110, odo: 10222, voltage: 27
    },
    {
      time: +(new Date('2018-01-01 20:21:33.165')),
      soc: 21, speed: 5, current: 125, odo: null, voltage: null
    },
  ];

  constructor(private http: HttpClient) {
  }

  getVehicles(): Observable<IVehicle[]> {
    const url = '/api/vehicles';
    return this.http.get<IVehicle[]>(url)
      .pipe(
        catchError(() => of(this.vehicles))
      );
  }

  getVehicleValues(vehicle: IVehicle): Observable<IValue[]> {
    const url = `/api/vehicles/${vehicle.id}/values`;
    console.log(`${fn} GET ${url}`);
    return this.http.get<IValue[]>(url)
      .pipe(
        catchError(() => of(this.values))
      );
  }
}
