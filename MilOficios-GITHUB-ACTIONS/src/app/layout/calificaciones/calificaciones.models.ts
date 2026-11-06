

export class Calificaciones {

    CA_CALIFICACION: number;
    CA_COMENTARIO: string;
    CA_TIPO: number;
    SERE_ID: number;

    constructor(calificacion?: number, comentario?: string, tipo?: number, sere_id?: number) {
        this.CA_CALIFICACION = calificacion;
        this.CA_COMENTARIO = comentario;
        this.CA_TIPO = tipo;
        this.SERE_ID = sere_id;
    }

}
