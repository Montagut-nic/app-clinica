import { Usuario } from "./usuario";

export class Especialista extends Usuario {

    especialidades: {id: string, nombre: string}[];
    
    constructor(
        nombre: string,
        apellido: string,
        edad: number,
        dni: string,
        email: string,
        authUid: string,
        imagenPrincipalUrl: string,
        especialidades: {id: string, nombre: string}[],
        activado: boolean
    ) {
        super(
            nombre,
            apellido,
            edad,
            dni,
            email,
            authUid,
            imagenPrincipalUrl,
            'especialista',
            activado
        );
        this.especialidades = especialidades;
    }
    
}
