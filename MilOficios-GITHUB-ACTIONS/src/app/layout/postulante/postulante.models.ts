
export class Postulante {
    POST_ID: number;
    POST_NOMBRES: string;
    POST_APE_PAT: string;
    POST_APE_MAT: string;
    POST_DNI: string;
    POST_RUC: string;
    POST_DIRECCION: string;
    POST_FECH_NACIMIENTO: string;
    POST_SEXO: string;
    POST_CELULAR: string;
    POST_EMAIL: string;
    POST_ALIAS: string;
    POST_CONTRASENIA: string;
    POST_FECH_REGISTRO: string;
    POST_FOTO: string;
    POST_ESTADO: boolean;
    POST_CV: string;


    constructor( nombres?: string, apellidoPaterno?: string, apellidoMaterno?: string,
                dni?: string, ruc?: string, direccion?: string, fechaNacimiento?: string, sexo?: string, celular?: string,
                email?: string, alias?: string, contrasena?: string, foto?: string,
                cv?: string ) {
        // tslint:disable-next-line:curly
        if (nombres)this.POST_NOMBRES = nombres;
        // tslint:disable-next-line:curly
        if (apellidoMaterno)this.POST_APE_MAT = apellidoMaterno;
        // tslint:disable-next-line:curly
        if (apellidoPaterno)this.POST_APE_PAT = apellidoPaterno;
        // tslint:disable-next-line:curly
        if (dni)this.POST_DNI = dni;
        if (ruc)this.POST_RUC = ruc;
        // tslint:disable-next-line:curly
        if (direccion)this.POST_DIRECCION = direccion;
        // tslint:disable-next-line:curly
        if (fechaNacimiento)this.POST_FECH_NACIMIENTO = fechaNacimiento;
        // tslint:disable-next-line:curly
        if (sexo)this.POST_SEXO = sexo;
        // tslint:disable-next-line:curly
        if (celular)this.POST_CELULAR = celular;
        // tslint:disable-next-line:curly
        if (email)this.POST_EMAIL = email;
        // tslint:disable-next-line:curly
        if (alias)this.POST_ALIAS = alias;
        // tslint:disable-next-line:curly
        if (contrasena)this.POST_CONTRASENIA = contrasena;
        // tslint:disable-next-line:curly
        if (foto)this.POST_FOTO = foto;
        // tslint:disable-next-line:curly
        if (cv)this.POST_CV = cv;

    }

}
