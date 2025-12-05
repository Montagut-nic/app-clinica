import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { supabaseKey, supabaseUrl } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class SupabaseClientService {
   private _client: SupabaseClient;

  constructor() {
    let tabId = sessionStorage.getItem('sb_tab_id');
    if (!tabId) {
      tabId = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
      sessionStorage.setItem('sb_tab_id', tabId);
    }

    this._client = createClient(
      supabaseUrl,
      supabaseKey,
    );
  }

  get client() {
    return this._client;
  }
}