import { inject, Injectable } from '@angular/core';
import { SupabaseClientService } from './supabase-client';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private sb = inject(SupabaseClientService).client;

  private async logLogin(
    userId: string,
    email: string | null,
    role: string | null
  ) {
    try {
      const { error } = await this.sb.from('login_logs').insert({
        user_id: userId,
        email,
        role,
      });

      if (error) {
        console.error('[auth] error guardando login_logs', error);
      }
    } catch (e) {
      console.error('[auth] excepción guardando login_logs', e);
    }
  }

  signUpEmail(email: string, password: string) {
    return this.sb.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });
  }

  async signInEmailChecked(
    email: string,
    password: string
  ): Promise<
    { ok: true } | { ok: false; code: 'PENDIENTE' | 'CREDENCIALES' | 'OTRO' }
  > {
    const { data, error } = await this.sb.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return { ok: false, code: 'CREDENCIALES' };

    const { data: prof, error: qerr } = await this.sb
      .from('profiles')
      .select('_role, _is_approved')
      .eq('_uuid', data.user.id)
      .maybeSingle();

    if (!qerr && prof?._role === 'especialista' && prof?._is_approved === false) {
      await this.sb.auth.signOut();
      return { ok: false, code: 'PENDIENTE' };
    }

    await this.logLogin(
      data.user.id,
      data.user.email ?? null,
      (prof as any)?._role ?? null
    );

    return { ok: true };
  }

  signInEmail(email: string, password: string) {
    return this.sb.auth.signInWithPassword({ email, password });
  }

  async signOut() {
    await this.sb.auth.signOut();
  }

  async getSession() {
    const { data } = await this.sb.auth.getSession();
    return data.session ?? null;
  }

  async getCurrentUser() {
    const {
      data: { session },
    } = await this.sb.auth.getSession();
    return session?.user ?? null;
  }
}