import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { StorageService } from 'src/app/helpers/storage.service';
import { AuthService } from '../../authorization/auth.service';
@Injectable({
  providedIn: 'root'
})
export class AuthPostulanteGuard implements CanActivate {

  constructor(private authorizationService: AuthService, private router: Router, private storageService: StorageService){}

  canActivate() {
    // this.authorization();
    const isLoggedIn = !!this.storageService.getString('isLoggedin') && !!this.storageService.getString('USE_SUB');
    if(this.storageService.getString('MOVIL')=='1' && !this.storageService.getString('POST_ID') && !isLoggedIn){
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
          console.log('DEFAULT');
          ruta ='postulante/login/movil';
          break;
      }
      this.router.navigate([ruta]);
      return false;
    }else{
      if(this.storageService.hasKey('TIPO_SESION') && this.storageService.getString('TIPO_SESION') != '0' && this.storageService.hasKey('USE_STATE') && this.storageService.getString('USE_STATE') === '1'){
        this.router.navigate(['/not-found']);
        return false;
      } 
    }
    return true;
  }

  authorization(){
    // this.authorizationService.verificarAuth().subscribe(data=>{},
    //   error=>{
    //     console.log('error',error);
    //     // this.authorizationService.onLoggedout();
    //   }
    // );
  }

}
