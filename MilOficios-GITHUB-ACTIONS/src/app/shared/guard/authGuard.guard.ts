import { Injectable } from '@angular/core';
import { ActivatedRoute, CanActivate, Router } from '@angular/router';
import { StorageService } from 'src/app/helpers/storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private router: Router,
    private storageService: StorageService,) {}

  canActivate(): boolean {
    const isLoggedIn = !!this.storageService.getString('isLoggedin') && !!this.storageService.getString('USE_SUB');
    console.log('aquii',isLoggedIn);
    if(isLoggedIn){
      const tipoUsuario = Number(this.storageService.getString('USE_TYPE'));
      const ruta = tipoUsuario==0 ? 'app/cliente/solicitar-servicio' : '/app/especialista/solicitudes';
      this.router.navigate([ruta]);
    }else
      this.limpiarLocalStorage();
    return true;
  }

  limpiarLocalStorage():void{
    this.storageService.remove('USE_SUB');
    this.storageService.remove('USE_USUARIO');
    this.storageService.remove('USE_ID');
    this.storageService.remove('USE_NAMES');
    this.storageService.remove("USE_EMAIL");
    this.storageService.remove('USE_TYPE');
    this.storageService.remove('USE_STATE');
    this.storageService.remove('TIPO_SESION');
    this.storageService.remove('isLoggedin');
  }
}