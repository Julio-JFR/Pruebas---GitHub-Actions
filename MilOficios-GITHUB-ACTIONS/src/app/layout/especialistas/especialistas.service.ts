import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry } from 'rxjs/operators';
import { Especialista } from './especialista.model';
import { StorageService } from '../../helpers/storage.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EspecialistasService {
  
  httpOptions  = {
    headers: new HttpHeaders({'Authorization': 'Basic ' + this.storageService.getString('USE_SUB'),
                              'type-user': '28491765'})
  };

  constructor(private http: HttpClient, private storageService: StorageService) {
   }

  updateHeaders(token?) {
    this.httpOptions  = {
      headers: new HttpHeaders({'Authorization': 'Basic ' + (token ? token : this.storageService.getString('USE_SUB')),
                              'type-user': '28491765'})
    };
  }

  getEspecialistaById(id): Observable<any> {
    const url: string = environment.domain_url+'/api/especialistas/rescatarDatosCuentaEspecialista?ESP_ID=' + id;
    this.updateHeaders(this.storageService.getString('USE_SUB'));
    return this.http.get<any>(url, this.httpOptions).pipe(
      retry(2)
    );
  }

  updateFotoEspecialista(id: number, foto: any): Observable<any> {
    const url = environment.domain_url + '/api/especialistas/actualizarFoto';
    this.updateHeaders(this.storageService.getString('USE_SUB'));
    return this.http.put<any>(url, {USU_FOTO: foto, DOMINIO_URL: environment.domain_url, ESP_ID: id}, this.httpOptions).pipe(
      retry(2)
    );
  }

  updateContrasenaEspecialista(id: number, contrasenaAnterior: string, contrasenaNueva: string): Observable<any> {
    const url =  environment.domain_url+'/api/especialistas/actualizarContrasenia';
    this.updateHeaders(this.storageService.getString('USE_SUB'));
    return this.http.put<any>(url, { ESP_ID: id , CONTRASENIA_ANTERIOR: contrasenaAnterior, CONTRASENIA: contrasenaNueva}, this.httpOptions).pipe(
      retry(2)
    );
  }

  getNiveles(): Observable<any> {
    const url = environment.domain_url+'/api/niveles/rescatarNiveles';
    return this.http.get<any>(url).pipe(
      retry(2)
    );
  }

  updateUsuarioEspecialista(especialista: Especialista): Observable<any> {
    const url = environment.domain_url+'/api/usuarios/actualizarDatosCuenta';
    const objetoEspecialista = {
      USUARIO: {
        USU_ID: especialista.USU_ID ,
        USU_TIPO: 1,
        USU_ESTADO: especialista.USU_ESTADO,
        USU_ALIAS: especialista.USU_ALIAS,
        USU_EMAIL: especialista.USU_EMAIL
      }
    };
    this.updateHeaders(this.storageService.getString('USE_SUB'));
    return this.http.put<any>(url, objetoEspecialista, this.httpOptions).pipe(
      retry(2)
    );
  }

  getDetallesDePago(id: number): Observable<any> {
    const url: string = environment.domain_url+'/api/especialistas/rescatarDatosBancarios?ESP_ID=' + id;
    return this.http.get<any>(url, this.httpOptions).pipe(
      retry(2)
    );
  }

  

  getBonos(id: number): Observable<any> {
    const url: string = environment.domain_url+'/api/bonificaciones/listarBonificacionesEspecialista?ESP_ID=' + id;
    return this.http.get<any>(url, this.httpOptions).pipe(
      retry(2)
    );
  }

  getMoneda(id: number): Observable<any> {
    const url: string = environment.domain_url+'/api/monedas/rescatarMonedaEspecialista?ESP_ID=' + id;
    return this.http.get<any>(url, this.httpOptions).pipe(
      retry(2)
    );
  }

  getIdiomas(): Observable<any> {
    const url = environment.domain_url+'/api/idiomas/rescatarIdiomas';
    return this.http.get<any>(url, this.httpOptions).pipe(
      retry(2)
    );
  }

  getDineroAcumulado(id: number): Observable<any> {
    const url = environment.domain_url+'/api/especialistas/rescatarDineroAcumulado?ESP_ID=' + id;
    return this.http.get<any>(url, this.httpOptions).pipe(
      retry(2)
    );
  }

  updateCuentaEspecialista( especialista: Especialista, tipoEspecialista: number, datoJuridico?:any): Observable<any> {
    const url = environment.domain_url +'/api/especialistas/actualizar';
    // tipoEspecialista: 0 es especialista persona, y 1 especialista empresa.
    let usuarioEspecialista = null;
    if(tipoEspecialista == 1){
      usuarioEspecialista = {
        USUARIO: {
          USU_NOMBRES: especialista.USU_NOMBRES,
          USU_APE_PAT: especialista.USU_APE_PAT,
          USU_APE_MAT: especialista.USU_APE_MAT,
          USU_DNI: especialista.USU_DNI,
          USU_DIRECCION: especialista.USU_DIRECCION,
          USU_FECH_NACIMIENTO: especialista.USU_FECH_NACIMIENTO,
          USU_SEXO: especialista.USU_SEXO,
          RUC: especialista.USU_RUC,
          USU_CELULAR: especialista.USU_CELULAR,
          IDI_ID: especialista.IDI_ID,
          DIST_ID: especialista.DIST_ID
        },
        ESP_ID: especialista.ESP_ID,
        DATOJURIDICO : {
          RAZ_SOCIAL: datoJuridico.razonSocial,
          TIPOEMPRESA: datoJuridico.tipoEmpresa,
          
        }
      };
    }else{
      usuarioEspecialista = {
        USUARIO: {
          USU_NOMBRES: especialista.USU_NOMBRES,
          USU_APE_PAT: especialista.USU_APE_PAT,
          USU_APE_MAT: especialista.USU_APE_MAT,
          USU_DNI: especialista.USU_DNI,
          USU_DIRECCION: especialista.USU_DIRECCION,
          USU_FECH_NACIMIENTO: especialista.USU_FECH_NACIMIENTO,
          USU_SEXO: especialista.USU_SEXO,
          USU_CELULAR: especialista.USU_CELULAR,
          RUC: especialista.USU_RUC,
          IDI_ID: especialista.IDI_ID,
          DIST_ID: especialista.DIST_ID
        },
        ESP_ID: especialista.ESP_ID
      };
    }

    

    return this.http.put<any>(url, usuarioEspecialista, this.httpOptions).pipe(
      retry(2)
    );
  }

  insertarCuentaBancaria(cuentaBancaria: any, idEspecialista: number) {
    const url = environment.domain_url+'/api/cuentaBancaria/insertar';
    const nuevaCuentaBancaria = { CUENTA_BANCARIA: cuentaBancaria, ESP_ID: Number(idEspecialista)};
    return this.http.post<any>(url, nuevaCuentaBancaria, this.httpOptions).pipe(
      retry(2)
    );
  }

  actualizarCuentaBancaria(cuentaBancaria: any) {
    const url = environment.domain_url+'/api/cuentaBancaria/actualizar';
    return this.http.put<any>(url, cuentaBancaria, this.httpOptions).pipe(
      retry(2)
    );
  }

  eliminarCuentaBancaria(idCuentaBancaria: number) {
    const url = environment.domain_url+'/api/cuentaBancaria/eliminar?CUE_BAN_ID=' + idCuentaBancaria;
    return this.http.delete<any>(url, this.httpOptions).pipe(
      retry(2)
    );
  }
}
