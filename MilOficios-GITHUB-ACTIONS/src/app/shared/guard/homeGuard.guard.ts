import { Injectable } from '@angular/core';
import { CanActivate,Router } from '@angular/router';
import { StorageService } from 'src/app/helpers/storage.service';

@Injectable({
  providedIn: 'root'
})

export class  HomeGuard implements CanActivate {

  constructor(
      private router: Router,
      private storageService: StorageService,
    ){}
    
  canActivate() {
    const isLoggedIn = !!this.storageService.getString('isLoggedin') && !!this.storageService.getString('USE_SUB');
    console.log('isLoggedIn home',isLoggedIn);
    if(this.storageService.getString('MOVIL')=='1'){
      const tipoUsu = Number(this.storageService.getString('USE_TYPE_MOVIL'));
      console.log('1',tipoUsu);
      let ruta = '';
      switch (tipoUsu) {
        case 1:
          ruta ='/especialistas/login/movil';
          break;
        case 2:
          ruta ='/clientes/login/movil';
          break;
        default:
          console.log('DEFAULT');
          ruta ='postulante/login/movil';
          break;
      }
      this.router.navigate([ruta]);
      return false;
    }else if(isLoggedIn){
      const tipoUsuario = Number(this.storageService.getString('USE_TYPE'));
      const tipoPost = Number(this.storageService.getString('POS_TYPE'));
      console.log('npoooooooo');
      // const ruta = tipoPost== 0 ? 'app/postulante/postulacion': tipoUsuario==0 ? 'app/cliente/solicitar-servicio' : '/app/especialista/solicitudes';
      // this.router.navigate([ruta]);
    }else{
      console.log('limpiando');
      this.limpiarLocalStorage();
    }
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