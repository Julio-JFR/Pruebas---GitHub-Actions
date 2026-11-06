export class SolicitudPago {

    SOL_PAG_ID: number;
    SOL_PAG_ESTADO: number;
    SOL_PAG_COMENTARIO: string;
    BON_ID: number;

    constructor(SOL_PAG_ID?: number, SOL_PAG_ESTADO?: number, SOL_PAG_COMENTARIO?: string, BON_ID?: number){
        this.SOL_PAG_ID = SOL_PAG_ID;
        this.SOL_PAG_ESTADO = SOL_PAG_ESTADO;
        this.SOL_PAG_COMENTARIO = SOL_PAG_COMENTARIO;
        this.BON_ID = BON_ID;
    }

}
