import { inject, Injectable, NgZone, signal } from '@angular/core';
import { createClient, Session, SupabaseClient, User } from '@supabase/supabase-js';
import { supabaseKey, supabaseUrl } from '../../environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { AnyUsuario } from '../clases/usuario';
import { Admin } from '../clases/admin';
import { SpecialtyService } from './specialty';
import { Especialista } from '../clases/especialista';
import { Paciente } from '../clases/paciente';

@Injectable({
  providedIn: 'root'
})
export class SupabaseClientService {
  private _client: SupabaseClient;
  private _session$ = new BehaviorSubject<Session | null>(null);
  private _user$ = new BehaviorSubject<User | null>(null);
  private _profile$ = signal<AnyUsuario | null>(null);

  get client(): SupabaseClient {
    return this._client;
  }

  get session$(): Observable<Session | null> {
    return this._session$.asObservable();
  }
  get user$(): Observable<User | null> {
    return this._user$.asObservable();
  }

  get session(): Session | null {
    return this._session$.value;
  }
  get user(): User | null {
    return this._user$.value;
  }
  get profile(): AnyUsuario | null {
    return this._profile$();
  }

  constructor(private _ngZone: NgZone) {
    this._client = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });

    this._client.auth.getSession().then(({ data }) => {
      this._session$.next(data.session ?? null);
      this._user$.next(data.session?.user ?? null);
      if (data.session?.user) {
        void this.loadProfile();
      }
    });

    this._client.auth.onAuthStateChange((event, s) => {
      this._ngZone.run(() => {
        this._session$.next(s ?? null);
        this._user$.next(s?.user ?? null);
        if (s?.user) {
          void this.loadProfile();
        } else {
          this._profile$.set(null);
        }
      });
    });

  }

  async logOut(): Promise<void> {
    const { error } = await this._client.auth.signOut();
    this._session$.next(null);
    this._user$.next(null);
    this._profile$.set(null);
    if (error) throw error;
  }

  async isLoggedIn(): Promise<boolean> {
    const { data } = await this._client.auth.getSession();
    return !!data.session;
  }

  async loadProfile() {
    try {
      const logged = await this.isLoggedIn();
      if (!logged) {
        this._profile$.set(null);
        return;
      }

      const u = this.user;
      if (!u) {
        this._profile$.set(null);
        return;
      }

      // Leer perfil
      const { data: pr, error } = await this.client
        .from('profiles')
        .select('*')
        .eq('_uuid', u.id)
        .maybeSingle();

      if (error) {
        console.warn('[session] select profile error:', error.message);
      }

      if (pr) {
        let us: AnyUsuario;
        if (pr._rol === 'admin') {
          us = new Admin(pr._nombre, pr._apellido, Number(pr._edad), pr._dni, pr._email, pr._uuid, pr._avatar_path1);
        } else if (pr._rol === 'especialista') {

          let existingSpecs: string[] = u.user_metadata['specialties_ids'];
          let customSpecs: string = u.user_metadata['specialty_other'];
          let specialties: { id: string, nombre: string }[] = [];
          const specialtySvc = inject(SpecialtyService);
          if (Array.isArray(existingSpecs) && existingSpecs.length > 0 && typeof existingSpecs[0] === 'string') {
            existingSpecs.forEach(async (id) => {
              const { data, error } = await specialtySvc.getById(id);
              if (error) {
                console.warn('[session] fetch specialty error:', error.message);
              } else if (!data) {
                console.warn('[session] specialty not found for id:', id);
              } else {
                specialties.push({ id: data.id, nombre: data.nombre });
              }
            });
          }
          if (customSpecs && typeof customSpecs === 'string') {
            const customNames = customSpecs.split(',').map((s) => s.trim()).filter((s) => s.length > 0);
            for (const name of customNames) {
              const { data, error } = await specialtySvc.getByName(name);
              if (error) {
                console.warn('[session] fetch specialty error:', error.message);
              } else if (!data) {
                console.warn('[session] specialty not found for id:', name);
              } else {
                specialties.push({ id: data.id, nombre: data.nombre });
              }
            }
          }

          us = new Especialista(
            pr._nombre,
            pr._apellido,
            Number(pr._edad),
            pr._dni,
            pr._email,
            pr._uuid,
            pr._avatar_path1,
            specialties,
            Boolean(pr._is_approved)
          );
        } else if (pr._rol === 'paciente') {
          us = new Paciente(pr._nombre, pr._apellido, Number(pr._edad), pr._dni, pr._obra_social, pr._email, pr._uuid, pr._avatar_path1, pr._avatar_path2);
        } else {
          console.warn(`Rol de usuario desconocido: ${pr._rol}`);
          this._profile$.set(null);
          return;
        }
        this._profile$.set(us);
        return;
      }
      this._profile$.set(null);
    } catch (e) {
      console.error('[session] excepción loading profile:', e);
      this._profile$.set(null);
    }
  }


}