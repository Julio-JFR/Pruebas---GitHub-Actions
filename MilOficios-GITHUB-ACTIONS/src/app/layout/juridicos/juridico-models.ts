
export class JuridicoModels {
    CLI_ID?:number;
    JUR_RAZ_SOCIAL?: string;
    TIP_EMP_ID?: number;

    constructor(cli_id?:number, jur_raz_social?:string, tip_emp_id?:number) {
        if(cli_id) this.CLI_ID = cli_id;
        if(jur_raz_social) this.JUR_RAZ_SOCIAL = jur_raz_social;
        if(tip_emp_id) this.TIP_EMP_ID = tip_emp_id;
    }

}
