export class Tarjeta {
    TAR_ID?: number;
    TAR_TITULAR?: string;
    TAR_NUMERO?: string;
    TAR_CVV?: string;
    TAR_MES?: string;
    TAR_ANIO?: string;
    TIP_TAR_ID?: string;
    TIP_TAR_NOMBRE?: string;
    TAR_ACTIVO?: number;
    TAR_CORREO?:string;
    TAR_SINCNUMERO?: string;//la bd trae el número de tarjeta sin modificar (en el atributo TAR_NUMERO solo muestra los últimos 4 dígitos y el resto con puros asteriscos)

    constructor(TAR_ID?: number, TAR_TITULAR?: string, TAR_NUMERO?: string, TAR_CVV?: string, TAR_MES?: string, 
        TAR_ANIO?: string, TIP_TAR_ID?: string, TIP_TAR_NOMBRE?: string, TAR_ACTIVO?: number,
        TAR_CORREO?:string) {

        if(TAR_ID)this.TAR_ID = TAR_ID;
        if(TAR_TITULAR)this.TAR_TITULAR = TAR_TITULAR;
        if(TAR_NUMERO)this.TAR_NUMERO = TAR_NUMERO;
        if(TAR_CVV)this.TAR_CVV = TAR_CVV;
        if(TAR_MES)this.TAR_MES = TAR_MES;
        if(TAR_ANIO)this.TAR_ANIO = TAR_ANIO;
        if(TIP_TAR_ID)this.TIP_TAR_ID = TIP_TAR_ID;
        if(TIP_TAR_NOMBRE)this.TIP_TAR_NOMBRE = TIP_TAR_NOMBRE;
        if(TAR_ACTIVO)this.TAR_ACTIVO = TAR_ACTIVO;
        if(TAR_CORREO)this.TAR_CORREO= TAR_CORREO;
    }
}
