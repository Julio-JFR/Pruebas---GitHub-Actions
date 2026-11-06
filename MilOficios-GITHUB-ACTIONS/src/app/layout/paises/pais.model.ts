export class Pais {
    PAI_ID?: number;
    PAI_NOMBRE?: string;
    PAI_CLAVE?: string;

    constructor(PAI_ID?: number, PAI_NOMBRE?: string, PAI_CLAVE?: string) {
        if(PAI_ID)this.PAI_ID = PAI_ID;
        if(PAI_NOMBRE)this.PAI_NOMBRE = PAI_NOMBRE;
        if(PAI_CLAVE)this.PAI_CLAVE = PAI_CLAVE;
    }
}
