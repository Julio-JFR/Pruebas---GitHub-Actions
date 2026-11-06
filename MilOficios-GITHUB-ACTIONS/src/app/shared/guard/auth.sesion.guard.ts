import { Injectable } from '@angular/core';
import { CanActivate,Router } from '@angular/router';
import { StorageService } from 'src/app/helpers/storage.service';

@Injectable({
  providedIn: 'root'
})

export class  AuthSesionGuard implements CanActivate {

  constructor(
      private router: Router,
      private storageService: StorageService,
    ){}
    
  canActivate() {
    if(!this.storageService.hasKey('TIPO_SESION')){
      return true;
    }else{
      if(this.storageService.hasKey("TIPO_SESION") && this.storageService.getString('TIPO_SESION') == '1' && (this.storageService.getString('USE_TYPE') == '0' && this.storageService.getString('USE_STATE') == '1')) this.router.navigate(['/solicitar-servicio']);
        else if(this.storageService.getString('TIPO_SESION') == '1' && (this.storageService.getString('USE_TYPE') == '1' && this.storageService.getString('USE_STATE') == '1')) this.router.navigate(['/app/especialista/solicitudes']);
        else if(this.storageService.getString('TIPO_SESION') == '0' && (this.storageService.hasKey('USE_STATE') && this.storageService.getString('USE_STATE') == '0')) this.router.navigate(['postulante/postulacion']);
        else if(this.storageService.getString('TIPO_SESION') == '0' && (this.storageService.hasKey('USE_STATE') && this.storageService.getString('USE_STATE') == '3')) this.router.navigate(['/change-password-post']);
        else if(this.storageService.getString('TIPO_SESION') == '1' && (this.storageService.hasKey('USE_STATE') && this.storageService.getString('USE_STATE') == '2')) this.router.navigate(['/change-password']);
        else  this.router.navigate(['/not-found']);
    }
  }
}