export abstract class Usuario {
    nombre: string;
    apellido: string;
    edad: number;
    dni: string;
    email: string;
    authUid: string;
    imagenPrincipalUrl: string;
    categoria: 'paciente' | 'especialista' | 'admin';
    activado: boolean;
    constructor(
        nombre: string,
        apellido: string,
        edad: number,
        dni: string,
        email: string,
        authUid: string,
        imagenPrincipalUrl: string,
        categoria: 'paciente' | 'especialista' | 'admin',
        activado: boolean = true
    ) {
        this.nombre = nombre;
        this.apellido = apellido;
        this.edad = edad;
        this.dni = dni;
        this.email = email;
        this.authUid = authUid;
        this.imagenPrincipalUrl = imagenPrincipalUrl;
        this.categoria = categoria;
        this.activado = activado;
    }

    abstract save(): void;
}
