import { Usuarios } from '../usuarios/usuarios';
export class Cliente  extends Usuarios {
    CLI_ID: number;
    CLI_TIPO: number;
    CLI_DESCRIPCION: string;
    JUR_RAZ_SOCIAL: string;
    TIP_EMP_ID: number;

    constructor(USU_ID?: number, USU_NOMBRES?: string, USU_APE_PAT?: string, USU_APE_MAT?: string, USU_DNI?: string,
        USU_DIRECCION?: string, USU_FECH_NACIMIENTO?: string, USU_CELULAR?: string, USU_SEXO?: string,
        USU_ALIAS?: string, USU_CONTRASENIA?: string, USU_FOTO?: string, USU_EMAIL?: string, USU_ESTADO?: number,
        USU_RUC?: any, DIST_ID?: any, PRO_ID?: number, REG_ID?: number, PAI_ID?: number, IDI_ID?: number,
        CLI_ID?: number, CLI_TIPO?: number, CLI_DESCRIPCION?: string, JUR_RAZ_SOCIAL?: string, TIP_EMP_ID?: number
    ) {
        super(USU_ID, USU_NOMBRES, USU_APE_PAT, USU_APE_MAT, USU_DNI, USU_DIRECCION, USU_FECH_NACIMIENTO,
            USU_CELULAR, USU_SEXO, USU_ALIAS, USU_CONTRASENIA, USU_FOTO, USU_EMAIL, USU_ESTADO, USU_RUC, DIST_ID,
            PRO_ID, REG_ID, PAI_ID, IDI_ID);

        this.CLI_ID = CLI_ID;
        this.CLI_TIPO = CLI_TIPO;
        this.CLI_DESCRIPCION = CLI_DESCRIPCION;
        this.JUR_RAZ_SOCIAL = JUR_RAZ_SOCIAL;
        this.TIP_EMP_ID = TIP_EMP_ID;
    }
}
