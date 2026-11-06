export class ExperienciaLaboral {
    EXP_ID?: number;
    EXP_ESPECIALIDAD?: string;
    EXP_EMPRESA?: string;
    EXP_DESCRIPCION?: string;
    EXP_FECH_INI?: string;
    EXP_FECH_FIN?: string;
    CONT_NOMBRES?: string;
    CONT_APELLIDOS?: string;
    CONT_EMAIL?: string;
    CONT_CELULAR?: string;

    constructor (EXP_ESPECIALIDAD?: string, EXP_EMPRESA?: string, EXP_DESCRIPCION?: string,
        EXP_FECH_INI?: string, EXP_FECH_FIN?: string ) {

        this.EXP_ESPECIALIDAD = EXP_ESPECIALIDAD;
        this.EXP_EMPRESA = EXP_EMPRESA;
        this.EXP_DESCRIPCION = EXP_DESCRIPCION;
        this.EXP_FECH_INI = EXP_FECH_INI;
        this.EXP_FECH_FIN = EXP_FECH_FIN;
    }
}
