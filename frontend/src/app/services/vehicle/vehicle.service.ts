import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

import { IValue, IVehicle } from './vehicle.model';
import { catchError } from 'rxjs/operators';
import { dateYYYYMMDD } from '../../lib/utils';

const fn = 'VehicleService';

@Injectable({
  providedIn: 'root'
})
export class VehicleService {

  constructor(private http: HttpClient) {
  }

  getVehicles(): Observable<IVehicle[]> {
    const url = '/api/vehicles';
    return this.http.get<IVehicle[]>(url)
      .pipe(
        catchError(() => of([]))
      );
  }

  getVehicleValues(vehicle: IVehicle, fromDate: Date, toDate: Date): Observable<IValue[]> {
    const url = `/api/vehicles/${vehicle.id}/values?fromDate=${dateYYYYMMDD(fromDate)}&toDate=${dateYYYYMMDD(toDate)}`;
    console.log(`${fn} GET ${url}`);
    return this.http.get<IValue[]>(url)
      .pipe(
        catchError(() => of([]))
      );
  }
}
