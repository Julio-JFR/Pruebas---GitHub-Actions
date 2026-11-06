export class Usuarios {
    USU_ID?: number;
    USU_NOMBRES?: string;
    USU_APE_PAT?: string;
    USU_APE_MAT?: string;
    USU_DNI?: string;
    USU_DIRECCION?: string;
    USU_FECH_NACIMIENTO?: string;
    USU_CELULAR?: string;
    USU_SEXO?: string;
    USU_ALIAS?: string;
    USU_CONTRASENIA?: string;
    USU_FOTO?: string;
    JUR_RUC?:string
    USU_EMAIL?: string;
    USU_ESTADO?: number;
    USU_CALIFICACION?: number;
    USU_RUC?: string;
    DIST_ID?: number;
    PRO_ID?: number;
    REG_ID?: number;
    PAI_ID?: number;
    IDI_ID?: number;

    constructor(USU_ID?: number, USU_NOMBRES?: string, USU_APE_PAT?: string, USU_APE_MAT?: string, USU_DNI?: string,
        USU_DIRECCION?: string, USU_FECH_NACIMIENTO?: string, USU_CELULAR?: string, USU_SEXO?: string,
        USU_ALIAS?: string, USU_CONTRASENIA?: string, USU_FOTO?: string, USU_EMAIL?: string, USU_ESTADO?: number,
        USU_CALIFICACION?: number, USU_RUC?: string, DIST_ID?: number, PRO_ID?: number, REG_ID?: number, PAI_ID?: number, IDI_ID?: number
    ) {
        this.USU_ID = USU_ID;
        this.USU_NOMBRES = USU_NOMBRES;
        this.USU_APE_PAT = USU_APE_PAT;
        this.USU_APE_MAT = USU_APE_MAT;
        this.USU_DNI = USU_DNI;
        this.USU_DIRECCION = USU_DIRECCION;
        this.USU_FECH_NACIMIENTO = USU_FECH_NACIMIENTO;
        this.USU_CELULAR = USU_CELULAR;
        this.USU_SEXO = USU_SEXO;
        this.USU_ALIAS = USU_ALIAS;
        this.USU_CONTRASENIA = USU_CONTRASENIA;
        this.USU_FOTO = USU_FOTO;
        this.USU_EMAIL = USU_EMAIL;
        this.USU_ESTADO = USU_ESTADO;
        this.USU_CALIFICACION = USU_CALIFICACION;
        this.USU_RUC = USU_RUC;
        this.DIST_ID = DIST_ID;
        this.PRO_ID = PRO_ID;
        this.REG_ID = REG_ID;
        this.PAI_ID = PAI_ID;
        this.IDI_ID = IDI_ID;
    }
}
