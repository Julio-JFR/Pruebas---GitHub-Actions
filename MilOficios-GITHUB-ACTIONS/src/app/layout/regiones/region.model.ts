export class Region {
    REG_ID?: number;
    REG_NOMBRE?: string;
    PAI_ID?: number;

    constructor(REG_ID?: number, REG_NOMBRE?: string, PAI_ID?: number) {
        if(REG_ID)this.REG_ID = REG_ID;
        if(REG_NOMBRE)this.REG_NOMBRE = REG_NOMBRE;
        if(PAI_ID)this.PAI_ID = PAI_ID;
    }
}
