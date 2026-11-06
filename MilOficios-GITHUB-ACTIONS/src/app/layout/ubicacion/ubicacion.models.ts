export class UbicacionModels {
    UBI_DIRECCION: string;
    UBI_LATITUD: string;
    UBI_LONGITUD: string;

    constructor(ubi_direccion?:string, ubi_latitud?:string, ubi_longitud?:string){
        this.UBI_DIRECCION = ubi_direccion;
        this.UBI_LATITUD = ubi_latitud;
        this.UBI_LONGITUD = ubi_longitud;
    }

}
