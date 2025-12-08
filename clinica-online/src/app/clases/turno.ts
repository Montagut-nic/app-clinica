import { Time } from "@angular/common";

export class Turno {
    private id: string;
    private fecha: Date;
    private hora: Time;
    private estado : 'pendiente' | 'aceptado' | 'rechazado' | 'cancelado' | 'realizado';
    private especialidad_nombre: string | null;

    constructor(){
        this.id = '';
        this.fecha = new Date();
        this.hora = {hours:0, minutes:0};
        this.estado = 'pendiente';
        this.especialidad_nombre = null;
    }

}
