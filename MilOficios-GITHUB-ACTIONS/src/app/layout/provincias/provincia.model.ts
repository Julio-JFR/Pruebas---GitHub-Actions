export class Provincia 
{
    PRO_ID?: number;
    PRO_NOMBRE?: string;
    REG_ID?: number;

    constructor(PRO_ID?: number, PRO_NOMBRE?: string, REG_ID?: number) {
        if(PRO_ID)this.PRO_ID = PRO_ID;
        if(PRO_NOMBRE)this.PRO_NOMBRE = PRO_NOMBRE;
        if(REG_ID)this.REG_ID = REG_ID;
    }
}
