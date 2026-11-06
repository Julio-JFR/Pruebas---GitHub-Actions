export class BonificacionModels {

    BON_ID: number;
    BON_DESCRIPCION: string;
    BON_MONTO:string;
    BON_SALDO: number;
    BON_FECH_INI: string;
    BON_FECH_FIN:string;
    BON_TIPO: boolean;
    BON_ID_CHARGE: string;
    USU_ID: number;
    MON_SIMBOLO:string;
    STATUS:string;

    constructor(bon_id?:number, bon_descripcion?:string, bon_monto?:string, bon_saldo?: number, bon_fech_ini?:string,
        bon_fech_fin?:string, bon_tipo?:boolean, bon_id_charge?:string, usu_id?:number, mon_simbolo?:string, status?:string){

            if(bon_id)this.BON_ID = bon_id;
            if(bon_descripcion)this.BON_DESCRIPCION = bon_descripcion;
            if(bon_monto)this.BON_MONTO = bon_monto;
            if(bon_saldo)this.BON_SALDO = bon_saldo;
            if(bon_fech_ini)this.BON_FECH_INI = bon_fech_ini;
            if(bon_fech_fin)this.BON_FECH_FIN = bon_fech_fin;
            if(bon_tipo)this.BON_TIPO = bon_tipo;
            if(bon_id_charge)this.BON_ID_CHARGE = bon_id_charge;
            if(usu_id)this.USU_ID = usu_id;
            if(mon_simbolo) this.MON_SIMBOLO = mon_simbolo;
            if(status) this.STATUS = status;
            
    }


}
