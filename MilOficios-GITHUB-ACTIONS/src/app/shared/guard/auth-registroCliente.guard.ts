import { Injectable } from '@angular/core';
import {  CanActivate, Router} from '@angular/router';
import { StorageService } from 'src/app/helpers/storage.service';
import {NavbarService} from '../navbar/navbar.service';

@Injectable({
  providedIn: 'root'
})

export class AuthRegistroClienteGuard implements CanActivate {

  constructor(private router: Router, private storageService: StorageService,
    private navbarService: NavbarService) {}
    validarTipoCliente: number;
    canActivate() {
      if (this.storageService.hasKey('USE_TYPE')) {
         if (this.storageService.getString('USE_TYPE') === '0') {
            this.router.navigate(['/solicitar-servicio']);
          }
      } else {
          return true;
      }

      this.navbarService.enviarTipoUsuario().subscribe( x => {
        this.validarTipoCliente = x ;
        }
      );
      if (this.validarTipoCliente === 1 || this.validarTipoCliente === 0) {
          return true;
      } else {
          this.router.navigate(['/home']);
      }
  }

}
