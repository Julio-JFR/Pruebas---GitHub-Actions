export class DatosBancarios {
    CUE_BAN_NOMBRE?: string
    CUE_BAN_TITULAR?: string 
    CUE_BAN_CCI?: string
    CUE_BAN_NUMERO?: string
    CUE_BAN_ID?: number

    constructor (CUE_BAN_NOMBRE?: string, CUE_BAN_TITULAR?: string, CUE_BAN_CCI?: string, CUE_BAN_NUMERO?: string) {
        this.CUE_BAN_NOMBRE = CUE_BAN_NOMBRE;
        this.CUE_BAN_TITULAR = CUE_BAN_TITULAR;
        this.CUE_BAN_NUMERO = CUE_BAN_NUMERO;
        this.CUE_BAN_CCI = CUE_BAN_CCI;
    }
}