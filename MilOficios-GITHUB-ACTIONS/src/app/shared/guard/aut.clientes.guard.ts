import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { StorageService } from 'src/app/helpers/storage.service';
import { AuthService } from '../../authorization/auth.service';
@Injectable({
  providedIn: 'root'
})
export class AuthClienteGuard implements CanActivate {
  constructor(private authorizationService: AuthService, private router: Router, private storageService: StorageService){}
    
  canActivate() {
    this.authorization();
    if (this.storageService.getString('USE_TYPE') == '0' && (this.storageService.getString('USE_STATE') == '1' || this.storageService.getString('USE_STATE') == '2')) {    // Si su tipo de usuario es cliente y su estado es activo (1)
        return true;
    }
    else if(this.storageService.getString('USE_STATE') == '2') {    // Si su estado es pendiente de cambio de contraseña (2)
      this.router.navigate(['/change-password']);
    }
    else {
      this.router.navigate(['/not-found']);
    }
    return true;  
  }

  authorization(){
    this.authorizationService.verificarAuth().subscribe({
      next:() =>{},
      error:(err) =>{
        if(err['status']!=0)
          this.authorizationService.onLoggedout();
      },
    })
  }
  
}
