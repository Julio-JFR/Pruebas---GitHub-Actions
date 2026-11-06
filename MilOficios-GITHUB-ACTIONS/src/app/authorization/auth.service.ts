import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {  BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { StorageService } from '../helpers/storage.service';
import { environment } from '../../environments/environment';
import { RoutingService } from '../helpers/routing.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private event_guard = new BehaviorSubject<Boolean>(true);
  event_guard$ = this.event_guard.asObservable();

  private event_Postulante = new BehaviorSubject<Boolean>(false);
  event_Postulante$ = this.event_Postulante.asObservable();

  constructor(private http: HttpClient, private storageService: StorageService, private router: Router, private routingService: RoutingService) { }

  public checkedGuardPostulante(isPermited:boolean){
    this.event_guard.next(isPermited);
  }

  public isNewPostulante(isTrue: boolean ){
    this.event_Postulante.next(isTrue);
  }

  verificarAuth(){
    const url = environment.domain_url +'/api/auth/verificar'; 
    let type_user;
    if(this.storageService.getString("TIPO_SESION") === "0"){//si es un postulante
      type_user = "39805712";
    }else if(this.storageService.getString("TIPO_SESION") === "1"){
      type_user = "28491765";
    } else {
      this.onLoggedout();
    }
    const httpOptions  = {
      headers: new HttpHeaders({'Authorization': 'Basic ' + this.storageService.getString('USE_SUB'),
                                'type-user': type_user})
    };
    
    return this.http.get<any>(url, httpOptions);
  }

  onLoggedout() {
    console.log('service');
    localStorage.removeItem('USE_SUB');
    localStorage.removeItem('USE_USUARIO');
    localStorage.removeItem('USE_NAMES');
    localStorage.removeItem('USE_TYPE');
    localStorage.removeItem('USE_ID');
    localStorage.removeItem('USE_STATE');
    localStorage.removeItem('TIPO_SESION');
    localStorage.removeItem('POST_ID');//ID DEL POSTULANTE
    localStorage.removeItem('USE_CRONIX');
    localStorage.removeItem('USE_CRO');
    localStorage.removeItem('USER_CRO');
    localStorage.removeItem('SERVICIO');
    localStorage.removeItem('USE_EMAIL');
    if(this.storageService.hasKey('servRealizadoID'))localStorage.removeItem('servRealizadoID');
    if(this.storageService.hasKey('usuarioID'))localStorage.removeItem('usuarioID');
    if(this.storageService.hasKey('POST_STATE'))localStorage.removeItem('POST_STATE');// si existe el item POST_STATE lo elimino
    if(this.storageService.hasKey('ESP_TYPE'))this.storageService.remove('ESP_TYPE');
    this.router.navigate(["/home"]);
  }

}
