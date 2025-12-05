import { Usuario } from "./usuario";

export class Admin extends Usuario {
    
    override save(): void {
        throw new Error("Method not implemented.");
    }

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
