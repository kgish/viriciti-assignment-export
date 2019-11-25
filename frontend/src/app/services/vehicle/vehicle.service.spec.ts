import { async, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { VehicleService } from './vehicle.service';

describe('VehicleService', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
      .compileComponents();
  }));

  it('should be created', () => {
    const service: VehicleService = TestBed.get(VehicleService);
    expect(service).toBeTruthy();
  });
});
