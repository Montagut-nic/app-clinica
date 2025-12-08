import { inject, Injectable } from '@angular/core';
import { HistoriaClinica, DatoExtra } from '../clases/historia-clinica';
import { SupabaseClientService } from './supabase-client';

@Injectable({
  providedIn: 'root'
})
export class HistoriaClinicaSvc {

  private sb = inject(SupabaseClientService).client;

  async getHistoriaPaciente(idPaciente: string): Promise<HistoriaClinica[]> {
    const { data, error } = await this.sb
      .from('historias_clinicas')
      .select(
        `
      id,
      id_turno,
      id_paciente,
      id_especialista,
      created_at,
      altura,
      peso,
      temperatura,
      presion,
      fecha,
      hora,
      especialista_nombre,
      especialidad_nombre,
      extras
    `
      )
      .eq('id_paciente', idPaciente)
      .order('fecha', { ascending: false })
      .order('hora', { ascending: false });

    if (error) throw error;

    return (data ?? []).map((r: any) => ({
      id: r.id,
      appointment_id: r.id_turno,
      patient_id: r.id_paciente,
      specialist_id: r.id_especialista,
      created_at: r.created_at,
      altura: r.altura,
      peso: r.peso,
      temperatura: r.temperatura,
      presion: r.presion,
      fecha: r.fecha,
      hora: r.hora,
      especialidad_nombre: r.especialidad_nombre ?? null,
      especialista_nombre: r.especialista_nombre ?? null,
      extras: r.extras as DatoExtra[] ?? []
    }));
  }
  
}
