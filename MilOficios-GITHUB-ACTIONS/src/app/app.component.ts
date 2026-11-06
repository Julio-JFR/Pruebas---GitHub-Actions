import { Component, OnInit } from '@angular/core';
import {  NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, RouterEvent} from '@angular/router';
import { AuthService } from './authorization/auth.service';
import { RoutingService } from './helpers/routing.service';
import { StorageService } from './helpers/storage.service';
import { TrabajosConfirmadosService } from './layout/trabajos-confirmados/trabajos-confirmados.service';
@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],

})
//aaaaaaa
export class AppComponent implements OnInit {

    loadingS;
    loadingD;
    animations;
    animation;

    constructor(private router: Router, private authorizationService: AuthService, private routingService: RoutingService, 
      private storageService:StorageService) {
        this.loadingS = false;
        this.loadingD = false;
        this.animations = ['flipOutX', 'bounce', 'rubberBand', 'shake', 'swing', 'jello', 'rotateIn', 'rotateOut'];
    }
    contador = 0;

    ngOnInit() {
        this.animation = this.animations[Math.floor(Math.random() * this.animations.length)];

        this.router.events.subscribe((event: RouterEvent)=> {
            if (event instanceof NavigationStart) {
                if(!this.router.navigated)
                    this.loadingS = true;
                else
                    this.loadingD = true;
            }
            else if (event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError) {
                this.loadingS = false;
                this.loadingD = false;
            }            
        });

        //Log out from all tabs when the user logs out in one of them
        window.addEventListener('storage', (event) => {
            if (event.storageArea == localStorage) {
                 let isLoggedin = localStorage.getItem('isLoggedin');
                 if(!isLoggedin) {                  
                   //Navigate to login/home
                    this.router.navigate(['/login']); 
                 }
            }
        });
        //CORREGIR CON LA VALIDACION DE TRABAJOS CONFIRMADOS
        // if(localStorage.length !== 0)
        //     this.authorizationService.verificarAuth().
        //     subscribe((data)=>{
        //         if (data.trabajoConfirmado==0 && localStorage.getItem('USER_FEL')) {
        //             localStorage.removeItem('USER_FEL');
        //             localStorage.removeItem('TRA_CNF');
        //             this.storageService.storeString('USE_SERV_ACTIVO', '0');
        //         }
        //     },error=>{
        //         this.onLoggedout();
        //     });
        
    }

    
    onLoggedout() {
        localStorage.removeItem('isLoggedin');
        localStorage.removeItem('ADM_SUB');
        localStorage.removeItem('ADM_USUARIO');
        localStorage.removeItem('ADM_ROL');
        this.routingService.replace(['/']); //Navigate to the main page   
    }
}
