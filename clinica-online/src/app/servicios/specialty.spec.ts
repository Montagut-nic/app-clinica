import { TestBed } from '@angular/core/testing';

import { Specialty } from './specialty';

describe('Specialty', () => {
  let service: Specialty;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Specialty);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
