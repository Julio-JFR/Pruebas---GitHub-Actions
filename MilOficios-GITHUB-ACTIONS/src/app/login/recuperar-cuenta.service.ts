import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { retry } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RecuperarCuentaService {

constructor(private http: HttpClient) { }


  solicitudCambioContrasena(email:string, tipoUsuario:number,tipo?:number){
    let url = '';
    if (tipo==0 || tipo ==1) {
      url = environment.domain_url + '/api/recuperacionCuenta/solicitarCodigoRecuperacionCuenta?EMAIL='+email+'&TIPO_USUARIO='+tipoUsuario+'&TIPO='+tipo;
    }else{
      url = environment.domain_url + '/api/recuperacionCuenta/solicitarCodigoRecuperacionCuenta?EMAIL='+email+'&TIPO_USUARIO='+tipoUsuario;
    }
    return this.http.get<any>(url).pipe(retry(2));
  }
  verificiarCodigoRecuperacion(email:string,tipoUsuario:number,codigoVerficacion:string){
    const url = environment.domain_url + '/api/recuperacionCuenta/verificarCodigoRecuperacion?EMAIL='+email+'&TIPO_USUARIO='+tipoUsuario+'&EMAIL='+email+'&CODIGO='+codigoVerficacion;
    return this.http.get<any>(url).pipe(retry(2));
  }
}
