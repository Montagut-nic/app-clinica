import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Recaptcha } from './recaptcha';

describe('Recaptcha', () => {
  let component: Recaptcha;
  let fixture: ComponentFixture<Recaptcha>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Recaptcha]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Recaptcha);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
