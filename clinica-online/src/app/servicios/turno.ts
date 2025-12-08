import { Time } from '@angular/common';
import { Injectable } from '@angular/core';

export type TurnoEstado =
  | 'pendiente'
  | 'aceptado'
  | 'rechazado'
  | 'cancelado'
  | 'realizado';

export interface Turno {
  id: string;
  fecha: Date;
  hora: Time;
  estado: TurnoEstado;

  especialidad_nombre?: string | null;
  especialista_nombre?: string | null;
  paciente_nombre?: string | null;
  hasPatientFeedback?: boolean;
  hasPatientSurvey?: boolean;

  specialty_id?: string;
  specialist_id?: string;
  patient_id?: string;

  resena_especialista?: string | null;

  historia_texto?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TurnoService {

  private turnos: Turno[] = [];

  constructor() {
    this.turnos = [];
    this.turnos[0] = {
      id: '1',
      fecha: new Date('yyyy-mm-dd'),
      hora: { hours: 10, minutes: 30},
      estado: 'pendiente'
   };
   this.turnos[0].hora.minutes += 31;
   console.log(this.turnos[0].hora);
   

  }
  
}
