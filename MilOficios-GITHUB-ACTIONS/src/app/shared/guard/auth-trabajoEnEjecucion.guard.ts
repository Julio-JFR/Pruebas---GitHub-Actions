import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { StorageService } from 'src/app/helpers/storage.service';



@Injectable({
  providedIn: 'root'
})

export class AuthTrabajoEnEjecucionGuard implements CanActivate {
  
  constructor( private router:Router,  private storageService: StorageService){}

  canActivate(): boolean {
    if ( (this.storageService.hasKey("MR") && this.storageService.getString("MR")=="1") ||
         this.storageService.hasKey("USER_FEL")  ){

        this.router.navigate(['/trabajos-ejecucion']);
        return false;
    }
    return true;
  }
  
}