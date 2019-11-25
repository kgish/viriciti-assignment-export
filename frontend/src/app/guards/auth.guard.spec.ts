import { TestBed, inject } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { MaterialModule } from '../modules';

import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ AuthGuard ],
      imports: [ HttpClientTestingModule, MaterialModule, RouterTestingModule ],
      schemas: [ NO_ERRORS_SCHEMA ]
    });
  });

  it('should create', inject([ AuthGuard ], (guard: AuthGuard) => {
    expect(guard).toBeTruthy();
  }));
});
