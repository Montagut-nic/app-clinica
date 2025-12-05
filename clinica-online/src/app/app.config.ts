import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { createClient } from '@supabase/supabase-js';
import { routes } from './app.routes';
import { initializeApp } from 'firebase/app';
import { Loader } from './componentes/loader/loader';
import { firebaseConfig, supabaseKey, supabaseUrl } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes)
  ]
};

export const supabase = createClient(supabaseUrl, supabaseKey);
export const app = initializeApp(firebaseConfig);

