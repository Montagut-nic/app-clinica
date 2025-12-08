import { APP_INITIALIZER, ApplicationConfig, inject, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '../environments/environment';
import { SessionService } from './servicios/session';
import { provideAnimations } from '@angular/platform-browser/animations';

export function initAuth() {
  const session = inject(SessionService);
  return () => session.hydrate();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimations(),
    {
      provide: APP_INITIALIZER,
      useFactory: initAuth,
      multi: true
    }
  ]
};

export const app = initializeApp(firebaseConfig);

