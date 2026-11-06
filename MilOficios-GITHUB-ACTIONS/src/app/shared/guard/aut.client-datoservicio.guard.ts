import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { StorageService } from 'src/app/helpers/storage.service';



@Injectable({
  providedIn: 'root'
})

export class AuthDatoServicio implements CanActivate {
  
  constructor( private router:Router,  
    private storageService: StorageService  ){}

  canActivate(): boolean {
    if ( this.storageService.hasKey("SERVICIO")  ){
        return true;
    }
    this.router.navigate(['/solicitar-servicio']);

    return false;
  }
  
}