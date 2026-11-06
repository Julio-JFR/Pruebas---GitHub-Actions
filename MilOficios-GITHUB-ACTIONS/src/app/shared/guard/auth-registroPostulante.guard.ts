import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../../authorization/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthRegistroPostulanteGuard implements CanActivate {
  
  constructor(
    private router: Router, 
    private authService: AuthService
  ) {}

  canActivate() : any {
    this.authService.event_guard$.subscribe(
      (data) => {
        if(data ==true){
          return true;
        }else{
          this.router.navigate(['postulante/login']);
          return false;
        }
      }, error=>{
        return false;
      } );
  }

}
