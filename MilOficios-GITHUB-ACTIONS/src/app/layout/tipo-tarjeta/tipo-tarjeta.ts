export class TipoTarjeta {
    TIP_TAR_ID?: number;
    TIP_TAR_NOMBRE?:string;
    TIP_TAR_COD?: string;

    constructor(
        TIP_TAR_ID?: number,
        TIP_TAR_NOMBRE?:string,
        TIP_TAR_COD?: string
    ){
        if(TIP_TAR_ID) this.TIP_TAR_ID = TIP_TAR_ID;
        if(TIP_TAR_NOMBRE) this.TIP_TAR_NOMBRE = TIP_TAR_NOMBRE;
        if(TIP_TAR_COD) this.TIP_TAR_COD = TIP_TAR_COD;

    }
}
