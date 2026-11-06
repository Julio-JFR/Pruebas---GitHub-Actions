export class ServicioRealizadoModels {
    SERE_ID?:number;
    SERE_ESPECIFICACION?:string;
    SERE_TARIFA?:number;
    SERE_FECH_INI_ESTIMADA?: string;
    SERE_FECH_FIN_ESTIMADA?: string;
    SERE_FECH_INI_REAL?:string;
    SERE_FECH_FIN_REAL?:string;
    SERE_FECH_CANCELACION?:string;
    SERE_ESTADO?:boolean;
    SOL_ID?:number;
    ESP_ID?:number;

    constructor(
        SERE_ID?:number,
        SERE_ESPECIFICACION?:string,
        SERE_TARIFA?:number,
        SERE_FECH_INI_ESTIMADA?: string,
        SERE_FECH_FIN_ESTIMADA?: string,
        SERE_FECH_INI_REAL?:string,
        SERE_FECH_FIN_REAL?:string,
        SERE_FECH_CANCELACION?:string,
        SERE_ESTADO?:boolean,
        SOL_ID?:number,
        ESP_ID?:number,
    ){
        if(SERE_ID) this.SERE_ID = SERE_ID;
        if(SERE_ESPECIFICACION) this.SERE_ESPECIFICACION = SERE_ESPECIFICACION;
        if(SERE_TARIFA) this.SERE_TARIFA = SERE_TARIFA;
        if(SERE_FECH_INI_ESTIMADA) this.SERE_FECH_INI_ESTIMADA = SERE_FECH_INI_ESTIMADA
        if(SERE_FECH_FIN_ESTIMADA) this.SERE_FECH_FIN_ESTIMADA = SERE_FECH_FIN_ESTIMADA;
        if(SERE_FECH_INI_REAL) this.SERE_FECH_INI_REAL = SERE_FECH_INI_REAL;
        if(SERE_FECH_FIN_REAL) this.SERE_FECH_FIN_REAL = SERE_FECH_FIN_REAL;
        if(SERE_FECH_CANCELACION) this.SERE_FECH_CANCELACION = SERE_FECH_CANCELACION;
        if(SERE_ESTADO) this.SERE_ESTADO = SERE_ESTADO;
        if(SOL_ID) this.SOL_ID = SOL_ID;
        if(ESP_ID) this.ESP_ID = ESP_ID;
    }


}
