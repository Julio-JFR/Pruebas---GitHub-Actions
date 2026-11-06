export class Postulacion {
    public POS_ESTADO?: number;
    public POS_ID?: number;
    public POS_FECHA?: string;
    public POS_EMAIL_ERROR?: number;
    public POS_MOT_RECHAZO?: string;
    public POS_MSJ_RECHAZO?: string;
    public POST_ID?: number;

    constructor(POS_ESTADO?: number, POS_ID?: number, POS_FECHA?: string, POS_EMAIL_ERROR?: number, POS_MOT_RECHAZO?: string,
                POS_MSJ_RECHAZO?: string, POST_ID?: number){
        if(POS_ESTADO) this.POS_ESTADO = POS_ESTADO;
        if(POS_ID) this.POS_ID = POS_ID;
        if(POS_FECHA) this.POS_FECHA = POS_FECHA;
        if(POS_EMAIL_ERROR) this.POS_EMAIL_ERROR = POS_EMAIL_ERROR;
        if(POS_MOT_RECHAZO) this.POS_MOT_RECHAZO = POS_MOT_RECHAZO;
        if(POS_MSJ_RECHAZO) this.POS_MSJ_RECHAZO = POS_MSJ_RECHAZO;
        if(POST_ID) this.POST_ID = POST_ID;
    }
}