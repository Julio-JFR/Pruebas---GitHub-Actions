export class Estudio {
    EST_ID?: number;
    EST_TIPO?: string;
    EST_DESCRIPCION?: string;
    EST_INSTITUCION?: string;
    EST_FECH_INI?: string;
    EST_FECH_FIN?: string;

    constructor( tipo?: string, descripcion?: string, institucion?: string, fechaInicio?: string, fechaFin?: string ) {
        this.EST_TIPO = tipo;
        this.EST_DESCRIPCION = descripcion;
        this.EST_INSTITUCION = institucion;
        this.EST_FECH_INI = fechaInicio;
        this.EST_FECH_FIN = fechaFin;
    }
}
