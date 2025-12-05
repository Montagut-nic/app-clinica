import { Usuario } from "./usuario";

export class Especialista extends Usuario {
    
    override save(): void {
        throw new Error("Method not implemented.");
    }

    private especialidades: {id: string, nombre: string}[];
    
    constructor(
        nombre: string,
        apellido: string,
        edad: number,
        dni: string,
        email: string,
        authUid: string,
        imagenPrincipalUrl: string,
        especialidades: {id: string, nombre: string}[]
    ) {
        super(
            nombre,
            apellido,
            edad,
            dni,
            email,
            authUid,
            imagenPrincipalUrl,
            'especialista'
        );
        this.especialidades = especialidades;
    }
    
}
