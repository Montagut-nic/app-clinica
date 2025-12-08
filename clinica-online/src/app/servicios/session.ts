import { computed, inject, Injectable, NgZone, signal } from '@angular/core';
import { Session, User } from '@supabase/supabase-js';
import { SupabaseClientService } from './supabase-client';
import { Usuario } from '../clases/usuario';
import { Admin } from '../clases/admin';
import { Especialista } from '../clases/especialista';
import { SpecialtyService } from './specialty';
import { Paciente } from '../clases/paciente';
import { AuthService } from './auth';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  private sb = inject(SupabaseClientService).client;
  private specialtySvc = inject(SpecialtyService);
  private _user$ = new BehaviorSubject<User | null>(null);
  private _profile = signal<Usuario | null>(null);
  private _loading = signal(false);
  private _ready = signal(false);
  private auth = inject(AuthService);

  private _initPromise: Promise<void> | null = null;
  private _whenProfileReadyResolvers: Array<() => void> = [];

  readonly profile = this._profile.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly ready = this._ready.asReadonly();
  readonly isLoggedIn = computed(() => !!this.user$);

  private _ngZone = inject(NgZone);

  async hydrate(): Promise<void> {
    if (this._initPromise) return this._initPromise;
    this._initPromise = (async () => {
      // Leer sesión persistida 
      const { data: { session } } = await this.sb.auth.getSession();
      this._user$.next(session?.user ?? null);

      // Cargar perfil
      if (this.user) {
        await this.loadProfile();
      } else {
        this._profile.set(null);
      }

      // Suscripción a cambios de auth
      this.sb.auth.onAuthStateChange((_ev, s) => {
        this._ngZone.run(() => {
          this._user$.next(s?.user ?? null);
          if (this.user) {
            this.loadProfile();
          } else {
            this._profile.set(null);
          }
        });
      });

      this._ready.set(true);
    })();
    return this._initPromise;
  }

  async waitReady(): Promise<void> {
    await this.hydrate();
  }

  get user$(): Observable<User | null> {
    return this._user$.asObservable();
  }

  get user(): User | null {
    return this._user$.value;
  }

  async waitForProfile(): Promise<void> {
    if (!this.loading()) return;
    return new Promise<void>((resolve) => {
      this._whenProfileReadyResolvers.push(resolve);
    });
  }

  async refresh() {
    await this.loadProfile();
  }

  async logout() {
    try {
      const { error } = await this.sb.auth.signOut();
      if (error) {
        console.error('[session] logout error:', error);
      }
    } catch (e) {
      console.error('[session] logout exception:', e);
    } finally {
      this._user$.next(null);
      this._profile.set(null);
      this._ready.set(true);
    }
  }

  async loadProfile() {
    this._loading.set(true);
    try {
      const u = this.user;
      if (!u) {
        this._profile.set(null);
        return;
      }

      // Leer perfil
      const { data: pr, error } = await this.sb
        .from('profiles')
        .select('*')
        .eq('_uuid', u.id)
        .maybeSingle();

      if (error) {
        console.warn('[session] select profile error:', error.message);
      }

      if (pr) {
        let us: Usuario;
        if (pr._rol === 'admin') {
          us = new Admin(pr._nombre, pr._apellido, Number(pr._edad), pr._dni, pr._email, pr._uuid, pr._avatar_path1);
        } else if (pr._rol === 'especialista') {

          let existingSpecs: string[] = u.user_metadata['specialties_ids'];
          let customSpecs: string = u.user_metadata['specialty_other'];
          let specialties: { id: string, nombre: string }[] = [];

          if (Array.isArray(existingSpecs) && existingSpecs.length > 0 && typeof existingSpecs[0] === 'string') {
            existingSpecs.forEach(async (id) => {
              const { data, error } = await this.specialtySvc.getById(id);
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
              const { data, error } = await this.specialtySvc.getByName(name);
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
          this._profile.set(null);
          return;
        }
        this._profile.set(us);
        return;
      }

      // Si no existe, crearlo con defaults seguros
      const { error: upErr } = await this.sb.from('profiles').upsert(
        {
          _uuid: u.id,
          _rol: 'paciente',
          _nombre: '',
          _apellido: '',
          _edad: 0,
          _dni: 'PEND',
          _email: u.email,
        },
        { onConflict: '_uuid', ignoreDuplicates: true },
      );
      if (upErr) {
        console.warn('[session] upsert profile error:', upErr.message);
      }

      const { data: pr2 } = await this.sb
        .from('profiles')
        .select('*')
        .eq('_uuid', u.id)
        .maybeSingle();

      const us2 = new Paciente(
        pr2?._nombre || '',
        pr2?._apellido || '',
        Number(pr2?._edad) || 0,
        pr2?._dni || 'PEND',
        pr2?._obra_social || '',
        pr2!._email,
        pr2!._uuid,
        pr2?._avatar_path1 || '',
        pr2?._avatar_path2 || '',

      );

      this._profile.set(us2 ?? null);
    } finally {
      this._loading.set(false);
      const pending = this._whenProfileReadyResolvers.splice(0);
      for (const resolve of pending) resolve();
    }
  }
}
