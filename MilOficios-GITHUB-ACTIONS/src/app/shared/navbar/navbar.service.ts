import { EventEmitter, Injectable, Output } from '@angular/core';
import {BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class NavbarService {

  typeUser = new BehaviorSubject(2);
  typeEspecialista = new BehaviorSubject(2);
  alertaBandera = new BehaviorSubject(2);
  @Output() disparadorNavbar: EventEmitter<any> = new EventEmitter();

  constructor() { }

  obtenerTipoUsuario(tipoUsuario: number) {
    this.typeUser = new BehaviorSubject(tipoUsuario);
  }

  definirTipoEspecialista(tipoUsuario: number) {
    this.typeEspecialista = new BehaviorSubject(tipoUsuario);
  }

  enviarTipoUsuario() {
    return this.typeUser;
  }

  obtenerTipoEspecialista(){
    return this.typeEspecialista;
  }

  //funciones para obtener y enviar bandera de alerta de servicios realizados pendientes de cancelar
  enviarBanderaAlerta(alertaBander:number){
    this.alertaBandera = new BehaviorSubject(alertaBander);
  }
  obtenerBanderaAlerta(){ 
    return this.alertaBandera;
  }
}
