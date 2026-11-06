export class TipoEmpresa {
        TIP_EMP_ID?: number;
        TIP_EMP_CLAVE?: string;
        TIP_EMP_DESCRIPCION?: string;
        constructor(TIP_EMP_ID?: number, TIP_EMP_CLAVE?: string, TIP_EMP_DESCRIPCION?: string) {
            if (TIP_EMP_ID) { this.TIP_EMP_ID = TIP_EMP_ID ; }
            if (TIP_EMP_CLAVE) { this.TIP_EMP_CLAVE = TIP_EMP_CLAVE; }
            if (TIP_EMP_DESCRIPCION) {this.TIP_EMP_DESCRIPCION = TIP_EMP_DESCRIPCION; }
        }
}
