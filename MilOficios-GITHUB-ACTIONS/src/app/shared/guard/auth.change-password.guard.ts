import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { StorageService } from 'src/app/helpers/storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthChangePasswordGuard implements CanActivate {
  
  constructor(private router: Router, private storageService: StorageService){}

  canActivate() {
    if(this.storageService.getString('USE_STATE') == '2') {    // Si su estado es pendiente de cambio de contraseña (2)
      return true;
    }
    else if(this.storageService.getString('USE_STATE') == '1' && this.storageService.getString('USE_TYPE') == '1'){ // Si su estado es activo (1) y si el tipo de usuario es especialista (1)
      this.router.navigate(['/app/especialista/solicitudes']);;
    }
    else if(this.storageService.getString('USE_STATE') == '1' && this.storageService.getString('USE_TYPE') == '0'){ // Si su estado es activo (1) y si el tipo de usuario es cliente (0)
      this.router.navigate(['/solicitar-servicio']);
    }
    else if(this.storageService.getString('USE_STATE') == '1' && this.storageService.getString('TIPO_SESION') == '0'){ // Si su estado es activo (1) y si el tipo de usuario es postulante (TIPO_SESION = 0)
      this.router.navigate(['postulante/postulacion']);
    } else {// solo es un porsiacaso, en caso de que el estado sea cualquier otro que no estén en las coindiciones anteriores
      this.router.navigate(['/not-found']);
    }
  }
  
}
