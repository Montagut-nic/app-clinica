import { Usuario } from "./usuario";

export class Admin extends Usuario {

    constructor(
        nombre: string,
        apellido: string,
        edad: number,
        dni: string,
        email: string,
        authUid: string,
        imagenPrincipalUrl: string,
    ) {
        super(
            nombre,
            apellido,
            edad,
            dni,
            email,
            authUid,
            imagenPrincipalUrl,
            'admin'
        );
    }
}
