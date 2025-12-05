import { TestBed } from '@angular/core/testing';

import { RecaptchaLoader } from './recaptcha-loader';

describe('RecaptchaLoader', () => {
  let service: RecaptchaLoader;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RecaptchaLoader);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
