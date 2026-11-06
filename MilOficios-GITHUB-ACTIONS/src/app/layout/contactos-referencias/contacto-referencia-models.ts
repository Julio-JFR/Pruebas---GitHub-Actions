export class ContactoReferenciaModels {
    CONT_NOMBRES: string;
    CONT_APELLIDOS: string;
    CONT_EMAIL: string;
    CONT_CELULAR: string;

    constructor(nombres?: string, apellidos?: string, email?: string, celular?: string) {
        this.CONT_NOMBRES = nombres;
        this.CONT_APELLIDOS = apellidos;
        this.CONT_EMAIL = email;
        this.CONT_CELULAR = celular;
    }
}
