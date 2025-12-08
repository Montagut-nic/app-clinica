import { Injectable, NgZone } from '@angular/core';
import { createClient, Session, SupabaseClient, User } from '@supabase/supabase-js';
import { supabaseKey, supabaseUrl } from '../../environments/environment';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class SupabaseClientService {
  private _client: SupabaseClient;
  private _session$ = new BehaviorSubject<Session | null>(null);
  private _user$ = new BehaviorSubject<User | null>(null);

  constructor(private _ngZone: NgZone) {
    let tabId = sessionStorage.getItem('sb_tab_id');
    if (!tabId) {
      tabId = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
      sessionStorage.setItem('sb_tab_id', tabId);
    }

    this._client = createClient(
      supabaseUrl,
      supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: `sb-${tabId}`,
        debug: true,
      }
    });

    this._client.auth.getSession().then(({ data }) => {
      this._session$.next(data.session ?? null);
      this._user$.next(data.session?.user ?? null);
    });

    this._client.auth.onAuthStateChange((event, session) => {
      this._ngZone.run(() => {
        this._session$.next(session ?? null);
        this._user$.next(session?.user ?? null);
      });
    });
  }

  get client() {
    return this._client;
  }
}