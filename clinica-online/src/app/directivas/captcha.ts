import { Directive, EventEmitter, HostListener, inject, Input, Output } from '@angular/core';
import { ToastService } from '../servicios/toast';

@Directive({
  selector: '[appCaptcha]'
})
export class CaptchaDirective {
  @Input('appCaptcha') enabled = true;

  @Input() persist = false;

  @Output() captchaPassed = new EventEmitter<void>();

  private toast = inject(ToastService);
  private alreadyPassed = false;

  private alpha = Array('A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9');

  @HostListener('click', ['$event'])
  onClick(ev: Event) {
    if (!this.enabled) {
      this.captchaPassed.emit();
      return;
    }

    if (this.persist && this.alreadyPassed) {
      this.captchaPassed.emit();
      return;
    }

    ev.preventDefault();
    ev.stopImmediatePropagation();

    let codigo = '';

    for (let i = 0; i < 6; i++) {
      const a = this.alpha[Math.floor(Math.random() * this.alpha.length)];
      const b = this.alpha[Math.floor(Math.random() * this.alpha.length)];
      const c = this.alpha[Math.floor(Math.random() * this.alpha.length)];
      const d = this.alpha[Math.floor(Math.random() * this.alpha.length)];
      const e = this.alpha[Math.floor(Math.random() * this.alpha.length)];
      const f = this.alpha[Math.floor(Math.random() * this.alpha.length)];
      const g = this.alpha[Math.floor(Math.random() * this.alpha.length)];
      codigo += a + ' '  + b + ' ' + c + ' '  + d + ' ' + e + ' ' + f + ' ' + g;
    }

    const expected = codigo.replaceAll(' ', '');

    const answer = window.prompt(
      `Introduce el código:\n\n${codigo}`
    );

    if (answer === null) {
      return;
    }

    if ( answer === expected) {
      this.alreadyPassed = true;
      this.captchaPassed.emit();
    } else {
      this.toast.error('Código incorrecto. Intentá nuevamente.');
    }
  }

}