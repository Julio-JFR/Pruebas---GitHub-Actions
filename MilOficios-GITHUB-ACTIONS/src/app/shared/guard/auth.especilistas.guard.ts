import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { StorageService } from 'src/app/helpers/storage.service';
import { AuthService } from '../../authorization/auth.service';
import { AuthService as Autoration }  from 'src/app/shared/guard/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthEspecilistasGuard implements CanActivate {
  constructor(private authorizationService: AuthService, private router: Router, private storageService: StorageService, public authService: Autoration){}
    
  canActivate() {
    console.log(this.storageService.getString('USE_TYPE'));
    this.authorization();
    if (this.storageService.getString('USE_TYPE') == '1' && (this.storageService.getString('USE_STATE') == '1' || this.storageService.getString('USE_STATE') == '2')) {    // Si su tipo de usuario es especialista y su estado es activo (1)
      console.log('storag 1');
        return true;
    }
    else if (this.storageService.getString('USE_TYPE') == '0' && this.storageService.getString('USE_STATE') == '1') {
      console.log('storag 2');

      this.router.navigate(['/not-found']);
    } else if(this.storageService.hasKey('TIPO_SESION') && this.storageService.getString('TIPO_SESION') === '0' && this.storageService.hasKey('USE_STATE') && this.storageService.getString('USE_STATE') === '1'){
      console.log('storag 3');

      this.router.navigate(['/not-found']);
    }
  }

  authorization(){
    this.authorizationService.verificarAuth().subscribe(data=>{
      console.log('datadata',data);
      if (data.navegador) {
        if (data.trabajoConfirmado == 1 && localStorage.getItem('navegador')!=data.navegador) {
          this.onLoggedout();
        } else {
          if (data.trabajoConfirmado == 0) {
            if (localStorage.getItem('USE_SERV_ACTIVO') == '1') {
              this.storageService.storeString('USE_CRO', 'H2aUzWe$nDjVZji1b5Z&8Y^h!FUJ5m!$I');
              this.storageService.remove('USER_FEL');
              this.storageService.remove('MR');
              this.storageService.remove('USE_SERV_ACTIVO');
              this.storageService.remove('servRealizadoID');
              this.storageService.remove('USE_CRONIX');
            }else{
              // this.router.navigate(['/especialista/solicitudes']); 
            }
          }
        }
      }
    },
      error=>{
        console.log('error');
        if(error['status']!=0)
        this.authorizationService.onLoggedout();
      }
    );
  }
  
  onLoggedout() {
    console.log('cerrar sesion');
    this.limpiarLocalStorage();
    const cookies = localStorage.getItem('cookieConsent') === 'true';
    localStorage.setItem('cookieConsent', cookies ? 'true' : 'false');
    this.router.navigate(['/home']);
  }

  
  limpiarLocalStorage():void{
    this.storageService.remove('USE_SUB');
    this.storageService.remove('USER_FEL');
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
