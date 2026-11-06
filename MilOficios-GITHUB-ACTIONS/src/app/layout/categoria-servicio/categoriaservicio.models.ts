export class CategoriaservicioModels {
    CAT_SER_ID?: number;
    CAT_ID?: number;
    SER_ID?: number;

    constructor(CAT_SER_ID?: number,
        CAT_ID?: number,
        SER_ID?: number){
        
        if(CAT_SER_ID) this.CAT_SER_ID = CAT_SER_ID;
        if(CAT_ID) this.CAT_ID = CAT_ID;
        if(SER_ID) this.SER_ID = SER_ID;
    }
}
