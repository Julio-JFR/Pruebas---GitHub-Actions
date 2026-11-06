import { Injectable } from '@angular/core';
import { ActivatedRoute, CanActivate, Router } from '@angular/router';
import { StorageService } from 'src/app/helpers/storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardNotFound implements CanActivate {

  constructor(
    private router: Router,
    private storageService: StorageService,) {}

  canActivate(): boolean {
    const isLoggedIn = !!this.storageService.getString('isLoggedin') && !!this.storageService.getString('USE_SUB');
    console.log('aquii',isLoggedIn);
    if(isLoggedIn){
      const tipoUsuario = Number(this.storageService.getString('USE_TYPE'));
      const ruta = tipoUsuario==0 ? 'app/cliente/solicitar-servicio' : tipoUsuario==1 ?'/app/especialista/solicitudes' : 'app/postulante/postulacion';
      this.router.navigate([ruta]);
      return false;
    }else
      return true;

  }
}