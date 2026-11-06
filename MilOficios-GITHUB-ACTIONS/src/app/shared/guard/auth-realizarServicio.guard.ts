import { Injectable } from '@angular/core';
import {  CanActivate, Router} from '@angular/router';
import { StorageService } from 'src/app/helpers/storage.service';

@Injectable({
  providedIn: 'root'
})

export class AuthRealizarServicioGuard implements CanActivate {
  
  constructor(private router: Router, private storageService: StorageService){}

  canActivate(): boolean 
  {
      // H2aUzWe$nDjVZji1b5Z&8Y^h!FUJ5m!$I para que le impida salir de una interfaz.
    if(this.storageService.getString('USE_CRO') == 'H2aUzWe$nDjVZji1b5Z&8Y^h!FUJ5m!$I') {
      return true;
    }
    else if(this.storageService.getString('USE_CRO') == 'H2aUzWe$nDjVRji1b5Z&8Y^h!FUJ5m!$I') { 
      return true;
    }

  }

}
