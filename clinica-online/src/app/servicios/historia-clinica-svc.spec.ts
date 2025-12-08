import { TestBed } from '@angular/core/testing';

import { HistoriaClinicaSvc } from './historia-clinica-svc';

describe('HistoriaClinicaSvc', () => {
  let service: HistoriaClinicaSvc;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HistoriaClinicaSvc);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
