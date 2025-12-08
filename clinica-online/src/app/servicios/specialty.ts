import { inject, Injectable } from '@angular/core';
import { SupabaseClientService } from './supabase-client';

@Injectable({
  providedIn: 'root'
})
export class SpecialtyService {
  private sb = inject(SupabaseClientService).client;

  async listActive() {
    return await this.sb
      .from('specialties')
      .select('id,nombre')
      .eq('is_custom', false)
      .eq('is_active', true)
      .order('nombre', { ascending: true });
  }

  async listSpecialties() {
    const { data, error } = await this.sb
      .from('specialties')
      .select('id, nombre')
      .eq('is_active', true)
      .order('nombre', { ascending: true });
    if (error) throw error;
    return data as { id: string; nombre: string }[];
  }

  async add(nombre: string) {
    const { data, error } = await this.sb
      .from('specialties')
      .insert({ nombre: nombre.trim(), is_active: true })
      .select('id,nombre')
      .single();
    return { data, error };
  }

  async addCustom(nombre: string) {
    const { data, error } = await this.sb
      .from('specialties')
      .upsert({ nombre: nombre.trim(), is_active: true, is_custom: true }, { onConflict: 'nombre' })
      .select('id,nombre')
      .single();
    return { data, error };
  }

  async update(id: string, active = true, custom = true, nombre: string | null = null) {
    if (nombre === null || nombre.trim() === '') {
      const { data, error } = await this.sb
        .from('specialties')
        .update({ is_active: active, is_custom: custom })
        .eq('id', id)
        .select('id,nombre')
        .single();
      return { data, error };
    } else {
      const { data, error } = await this.sb
        .from('specialties')
        .update({ nombre: nombre.trim(), is_active: active, is_custom: custom })
        .eq('id', id)
        .select('id,nombre')
        .single();
      return { data, error };
    }

  }


  async getById(id: string): Promise<{ data: { id: string, nombre: string } | null; error: any }> {
    const { data, error } = await this.sb
      .from('specialties')
      .select('id,nombre')
      .eq('id', id)
      .single();
    return { data, error };
  }

  async getByName(nombre: string): Promise<{ data: { id: string, nombre: string } | null; error: any }> {
    const { data, error } = await this.sb
      .from('specialties')
      .select('id,nombre')
      .eq('nombre', nombre)
      .single();
    return { data, error };
  }
}
