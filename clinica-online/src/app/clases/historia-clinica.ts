export interface DatoExtra {
  key: string;           // nombre que el usuario elige ("altura", "peso", etc.)
  valor: string; // puede ser string, number, etc.
}


export class HistoriaClinica {

    id: string;
    appointment_id: string;
    patient_id: string;
    specialist_id: string;
    created_at: string;
    altura: number | null;
    peso: number | null;
    temperatura: number | null;
    presion: string | null;

    fecha?: string | null;
    hora?: string | null;
    especialidad_nombre?: string | null;
    especialista_nombre?: string | null;

    extras: DatoExtra[];
    detalle?: string | null;

    constructor(
        _id: string,
        _appointment_id: string,
        _patient_id: string,
        _specialist_id: string,
        _created_at: string,
        _altura: number | null = null,
        _peso: number | null = null,
        _temperatura: number | null = null,
        _presion: string | null = null,
        _fecha: string | null = null,
        _hora: string | null = null,
        _especialidad_nombre: string | null = null,
        _especialista_nombre: string | null = null,
        _extras: DatoExtra[] = [],
        _detalle: string | null = null) {
        this.id = _id;
        this.appointment_id = _appointment_id;
        this.patient_id = _patient_id;
        this.specialist_id = _specialist_id;
        this.created_at = _created_at;
        this.altura = _altura;
        this.peso = _peso;
        this.temperatura = _temperatura;
        this.presion = _presion;
        this.fecha = _fecha;
        this.hora = _hora;
        this.especialidad_nombre = _especialidad_nombre;
        this.especialista_nombre = _especialista_nombre;
        this.extras = _extras;
        this.detalle = _detalle;
    }
}