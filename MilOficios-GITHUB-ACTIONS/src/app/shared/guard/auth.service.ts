import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from '../../helpers/storage.service';
import {RealizarServicioService} from '../../layout/realizar-servicio/realizar-servicio.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(public router: Router, 
    private storageService: StorageService, 
    private realizarServicioService:RealizarServicioService
    ) {}

  logout() {
    console.log('cerrando aurhservice 17');
    if(this.storageService.getString('MOVIL')=='1'){
      const tipoUsu = Number(this.storageService.getString('USE_TYPE_MOVIL'));
      let ruta = '';
      switch (tipoUsu) {
        case 1:
          ruta ='/especialistas/login/movil';
          break;
        case 2:
          ruta ='/clientes/login/movil';
          break;
        default:
          ruta ='/app/postulante/login/movil';
          break;
      }
      this.router.navigate([ruta]);
    }else
      this.router.navigate(['/home']); 
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
    if(this.storageService.hasKey('POST_STATE'))localStorage.removeItem('POST_STATE');// si existe el item POST_STATE lo elimino
    if(this.storageService.hasKey('ESP_TYPE'))this.storageService.remove('ESP_TYPE');

    
  }

}