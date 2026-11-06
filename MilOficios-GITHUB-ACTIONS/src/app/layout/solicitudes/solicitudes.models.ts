export class SolicitudesModels {

    SOL_DESCRIPCION: string;
    CAT_SER_ID: number;
    CLI_ID: number;
    SOL_FECHA_SERVICIO:string;
    SOL_HORA_SERVICIO: any;
    SOL_NOMBRE_CONTACTO: string;
    SOL_CELULAR_CONTACTO: string;

    constructor(sol_description?:string, cat_ser_id?:number, cli_id?:number, sol_fecha_servicio?:string,
        sol_nombre_contacto?:string, sol_celular_contacto?:string, sol_hora_servicio?:any ){
        this.SOL_DESCRIPCION = sol_description;
        this.CAT_SER_ID = cat_ser_id;
        this.CLI_ID =  cli_id;
        this.SOL_FECHA_SERVICIO = sol_fecha_servicio;
        this.SOL_NOMBRE_CONTACTO = sol_nombre_contacto;
        this.SOL_CELULAR_CONTACTO =  sol_celular_contacto;
        this.SOL_HORA_SERVICIO = sol_hora_servicio;
    }

}
