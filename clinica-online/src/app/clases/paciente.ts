import { Usuario } from "./usuario";

export class Paciente extends Usuario {

    imagenSecundariaUrl: string;
    obraSocial: string;

    constructor(
        nombre: string,
        apellido: string,
        edad: number,
        dni: string,
        obraSocial: string,
        email: string,
        authUid: string,
        imagenPrincipalUrl: string,
        imagenSecundariaUrl: string
    ) {
        super(
            nombre,
            apellido,
            edad,
            dni,
            email,
            authUid,
            imagenPrincipalUrl,
            'paciente'
        );
        this.obraSocial = obraSocial;
        this.imagenSecundariaUrl = imagenSecundariaUrl;
    }
}
