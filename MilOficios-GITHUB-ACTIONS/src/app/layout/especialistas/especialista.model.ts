import { Usuarios } from '../usuarios/usuarios';

export class Especialista extends Usuarios {
    ESP_ID?: number;
    USU_CALIFICACION?: number;

    constructor(USU_ID?: number, USU_NOMBRES?: string, USU_APE_PAT?: string, USU_APE_MAT?: string, USU_DNI?: string,
        USU_DIRECCION?: string, USU_FECH_NACIMIENTO?: string, USU_CELULAR?: string, USU_SEXO?: string,
        USU_ALIAS?: string, USU_CONTRASENIA?: string, USU_FOTO?: string, USU_EMAIL?: string, USU_ESTADO?: number,
        USU_RUC?: any, DIST_ID?: any, PRO_ID?: number, REG_ID?: number, PAI_ID?: number, IDI_ID?: number,
        ESP_ID?: number, USU_CALIFICACION?: number, JUR_RUC?:string
    ) {
        super(USU_ID, USU_NOMBRES, USU_APE_PAT, USU_APE_MAT, USU_DNI, USU_DIRECCION, USU_FECH_NACIMIENTO,
            USU_CELULAR, USU_SEXO, USU_ALIAS, USU_CONTRASENIA, USU_FOTO, USU_EMAIL, USU_ESTADO, USU_RUC, DIST_ID,
            PRO_ID, REG_ID, PAI_ID, IDI_ID);

        this.ESP_ID = ESP_ID;
        this.USU_CALIFICACION = USU_CALIFICACION;
    }
}
