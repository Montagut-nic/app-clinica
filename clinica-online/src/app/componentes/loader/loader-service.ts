import { Injectable, signal, computed } from '@angular/core';

const DEFAULT_MESSAGES = [
  'Preparando todo para tu atención...',
  'Terminando de cargar registros...',
  'Verificando datos de pacientes...',
  'Dejando todo listo para comenzar...'
];


@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  private readonly _visible = signal(false);
  private readonly _messages = signal<string[]>(DEFAULT_MESSAGES);

  // señales públicas
  readonly isVisible = computed(() => this._visible());
  readonly messages = computed(() => this._messages());

  show(messages?: string[]) {
    this._messages.set(
      messages && messages.length ? messages : DEFAULT_MESSAGES
    );
    this._visible.set(true);
  }

  hide() {
    this._visible.set(false);
  }
}