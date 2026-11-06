import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { retry } from 'rxjs/operators';
import { StorageService } from '../../../helpers/storage.service';
import { environment } from 'src/environments/environment';
import { Tarjeta } from '../../tarjetas/tarjeta.model';

@Injectable({
  providedIn: 'root'
})
export class ServicioRealizadoService {

  httpOptions  = {
    headers: new HttpHeaders({'Authorization': 'Basic ' + this.storageService.getString('USE_SUB'),
                              'type-user': '28491765'})
  };

  updateHeaders() {
    this.httpOptions  = {
      headers: new HttpHeaders({'Authorization': 'Basic ' + this.storageService.getString('USE_SUB'),
                              'type-user': '28491765'})
    };
  }

  constructor(private http: HttpClient, private storageService: StorageService) { }

  getServiciosRealizados(id: number): Observable<any> {
    const url: string =  environment.domain_url +  '/api/serviciosRealizados/listarServiciosRealizadoEspecialista?ESP_ID=' + id;
    return this.http.get<any>(url, this.httpOptions).pipe(
      retry(2)
    );
  }

  getServiciosContratados(id: number) {
    const url = environment.domain_url + '/api/serviciosRealizados/listarServiciosRealizadoAlCliente?CLI_ID=' + id;

    return this.http.get<any>(url, this.httpOptions).pipe(
      retry(2)
    );
  }

  /*********************************** FUNCIÓN TEMPORAL NO TOMAR EN CUENTA ESTA FUNCION **********************************/
  obtenerSolicitudAceptada(CLI_ID: number) {
    const url = environment.domain_url + '/api/solicitudes/obtenerSolicitudAceptada?CLI_ID=' + CLI_ID;

    return this.http.get<any>(url).pipe(
      retry(2)
    );
  }

  listarServiciosRealizadosPorCliente(id: number): Observable <any> {

    const url =  environment.domain_url + '/api/serviciosRealizados/listarServiciosRealizadosPorCliente?CLI_ID=' + id;

    return this.http.get<any>( url, this.httpOptions ).pipe(
      retry(2)
    );
  }

  actualizar(SERE_ID: number, OPCION: boolean, ESP_EMAIL: string, TAR_ID?: number): Observable <any>{
    const url =  environment.domain_url + '/api/serviciosRealiza/actualizar';
    const httpOptions  = {
      headers: new HttpHeaders({'Authorization': 'Basic ' + this.storageService.getString('USE_SUB')})
    };
    let json;
    if(OPCION){
      json = {SERE_ID: SERE_ID,OPCION: OPCION,ESP_EMAIL: ESP_EMAIL, TAR_ID: TAR_ID};
    }else{
      json = {SERE_ID: SERE_ID,OPCION: OPCION,ESP_EMAIL: ESP_EMAIL}
    }
    return this.http.post<any>( url,json,httpOptions ).pipe(
      retry(2)
    );
  }

  //Esta función sirve para aceptar el servicio enviando el id de la tarjeta
  aceptarServicio(SERE_ID: number, ESP_EMAIL: string, CLI_ID: number, PRECIO_SERVICIO: number, TAR_ID: number, ID_BONOS: number[]){
    const url =  environment.domain_url + '/api/serviciosRealizados/aceptar';
    const httpOptions  = {
      headers: new HttpHeaders({'Authorization': 'Basic ' + this.storageService.getString('USE_SUB')})
    };

    return this.http.post<any>( url,{SERE_ID: SERE_ID, CLI_ID: CLI_ID, TAR_ID: TAR_ID, PRECIO_SERVICIO: PRECIO_SERVICIO, ESP_EMAIL: ESP_EMAIL, ID_BONOS: ID_BONOS},httpOptions );
  }

  //Esta función sirve para aceptar el servicio enviando los datos de la tarjeta
  aceptarServicioTarjeta(SERE_ID: number, ESP_EMAIL: string, CLI_EMAIL: string, CLI_ID: number, PRECIO_SERVICIO: number, OPCION: boolean, tarjeta: Tarjeta, ID_BONOS: number[]){
    const url =  environment.domain_url + '/api/serviciosRealizados/aceptarTarjeta';
    const httpOptions  = {
      headers: new HttpHeaders({'Authorization': 'Basic ' + this.storageService.getString('USE_SUB')})
    };

    const json = {
      SERE_ID: SERE_ID, 
      ESP_EMAIL: ESP_EMAIL,
      CLI_EMAIL: CLI_EMAIL,
      CLI_ID: CLI_ID, 
      PRECIO_SERVICIO: PRECIO_SERVICIO, 
      OPCION: OPCION,
      TARJETA: tarjeta,
      ID_BONOS: ID_BONOS
    }

    // Imprimir en consola de forma legible
    console.log("Objeto: " + JSON.stringify(json, null, 2));

    // Mostrar en un alert (con versión compacta)
    alert(JSON.stringify(json));
    return this.http.post<any>( url,json,httpOptions );
  }

  rechazarServicio(SERE_ID: number, ESP_EMAIL: string){
    const url =  environment.domain_url + '/api/serviciosRealizados/rechazar';
    
    const httpOptions  = {
      headers: new HttpHeaders({'Authorization': 'Basic ' + this.storageService.getString('USE_SUB')})
    };

    return this.http.post<any>( url,{SERE_ID: SERE_ID,ESP_EMAIL: ESP_EMAIL},httpOptions ).pipe(
      retry(2)
    );
  }
  
  rechazarServicioSinSolicitud(SERE_ID: number, ESP_EMAIL: string){
    const url =  environment.domain_url + '/api/serviciosRealizados/rechazarSinSolicitud';
    
    const httpOptions  = {
      headers: new HttpHeaders({'Authorization': 'Basic ' + this.storageService.getString('USE_SUB')})
    };

    return this.http.post<any>( url,{SERE_ID: SERE_ID,ESP_EMAIL: ESP_EMAIL},httpOptions ).pipe(
      retry(2)
    );
  }

  obtenerCantidadDeServiciosPendientesDeCalificaciónPorCliente(idCliente:number){
    const url =  environment.domain_url + '/api/serviciosRealizados/obtenerCantidadDeServiciosPendientesDeCalificacion?CLI_ID='+idCliente;
    return this.http.get<number>(url,this.httpOptions).pipe(retry(2));
  }

  obtenerServicioCalificaciónCorreo(idServicio:number){
    const url =  environment.domain_url + '/api/serviciosRealizados/retornarInformacionServicioCorreoCalificacion?SERE_ID='+idServicio;
    const httpOptions  = {
      headers: new HttpHeaders({'Authorization': 'Basic '})
    };
    return this.http.get<any>(url).pipe(retry(2));
  }
}
