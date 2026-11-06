export class Distrito {
    DIST_ID?: number;
    DIST_NOMBRE?: string;
    PRO_ID?: number;

    constructor(DIST_ID?: number, DIST_NOMBRE?: string, PRO_ID?: number) {
        if(DIST_ID)this.DIST_ID = DIST_ID;
        if(DIST_NOMBRE)this.DIST_NOMBRE = DIST_NOMBRE;
        if(PRO_ID)this.PRO_ID = PRO_ID;
    }
}
