import { EventEmitter, Injectable, Output } from '@angular/core';
import { retry } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { StorageService } from 'src/app/helpers/storage.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  header  = {
    headers: new HttpHeaders({'Accept': 'application/json'})
  };

  httpOptions  = {
    headers: new HttpHeaders({'Authorization': 'Basic ' + this.storageService.getString('USE_SUB')}) // 9$$10710$2y$10$VZMRl4RVjOS2Qi/ttl/U9uq0D4MIqj/Z5Te6MZKPX.2305DwSYGSG5114
  };

  @Output() usuarioUpdatedEvent: EventEmitter<boolean> = new EventEmitter();
  constructor(private http: HttpClient, private storageService: StorageService) { }

  usuarioUpdated(username: string) {
    this.storageService.storeString('USE_USUARIO', username);
    this.usuarioUpdatedEvent.emit(true);
  }

  updateHeaders() {
    this.httpOptions  = {
      headers: new HttpHeaders({'Authorization': 'Basic ' + this.storageService.getString('USE_SUB')})
    };
  }

  verificarCredenciales(usuUsuario: string, usuContrasenia: string, tipoUsuario: number) {

    const url = environment.domain_url + '/api/usuarios/login';
    const navegador = localStorage.getItem('navegador');
    return this.http.post<{code_error: string, autenticar: string, id: string, fullName: string,
      estado: number, email: string, mensaje: string, exito: boolean, servicioIniciado:string, fechaServicio:any, SERE_ID:any,USU_ID:any}>(url,
      {
        USU_IDENTIFICADOR: usuUsuario, //Puedes autentificarte con email o alias(nickname)
        USU_CONTRASENIA: usuContrasenia,
        TIPO_CUENTA: tipoUsuario , // 1 para especialistas y 0 para clientes
        USU_INI_NAVEGADOR:navegador
      }
    ).pipe(retry(2));
  }
  
  cambiarContrasena(contrasena: string) {
    const url = environment.domain_url + '/api/usuarios/cambiarContrasenia';

    const nuevaContrasena = {
      USU_ALIAS : this.storageService.getString('USE_USUARIO'),
      CONTRASENIA: contrasena
    };
    return this.http.post<any>(url, nuevaContrasena).pipe(retry(2));
  }
  buscarAliasUsuario(identificador:any) {

    const url = environment.domain_url + '/api/usuarios/recuperarAlias?USU_IDENTIFICADOR='+identificador;
    return this.http.get<any>(url).pipe(retry(2));
  }

}
