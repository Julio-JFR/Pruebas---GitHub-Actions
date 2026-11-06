import { Injectable } from '@angular/core';
import { HttpClient ,HttpHeaders} from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { retry } from 'rxjs/operators';
import {Notificacion} from '../notificaciones/notificacion.model';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificacionesService {

  private event_guard = new BehaviorSubject<boolean>(true);

  constructor(private http: HttpClient) { }

  httpOptions  = {
    headers: new HttpHeaders({'Authorization': 'Basic '})
  };

  actualizarEstadoNotificacion(NOT_IDC:number){
    const url = environment.domain_url +  '/api/notificaciones/actualizarEstadoNotificaciones';
    
    const envio={
      NOT_ID : NOT_IDC
    }
    
    return this.http.put<any>(url,envio,this.httpOptions).pipe(retry(2));
  }

  insertarNotificacion(data){
    this.event_guard.next(data);
  }

  obtener(){
    return this.event_guard.asObservable();
  }

  listarNotificacionCliente(CLI_ID:number):  Observable<Notificacion[]>{
    const url = environment.domain_url +  '/api/notificaciones/listarNotificacionesCliente?CLI_ID='+CLI_ID;
    return this.http.get<Notificacion[]>(url,this.httpOptions).pipe(retry(2));
  }

  listarNotificacionEspecialista(ESP_ID:number):  Observable<Notificacion[]>{
    const url = environment.domain_url +  '/api/notificaciones/listatNotificacionesEspecialista?ESP_ID='+ESP_ID;
    return this.http.get<Notificacion[]>(url,this.httpOptions).pipe(retry(2));
  }

  listarNotificacionPostulante(POST_ID:number):  Observable<Notificacion[]>{
    const url = environment.domain_url +  '/api/notificaciones/listarNotificacionesPostulante?POST_ID='+POST_ID;
    return this.http.get<Notificacion[]>(url,this.httpOptions).pipe(retry(2));
  }

}
