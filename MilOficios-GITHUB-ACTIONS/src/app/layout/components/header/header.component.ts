import { Component, OnInit ,ElementRef, ViewChild} from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { StorageService } from 'src/app/helpers/storage.service';
import { AuthService } from 'src/app/shared/guard/auth.service';
import { UsuariosService } from '../../usuarios/usuarios.service';
import { NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {Notificacion} from '../../notificaciones/notificacion.model'; 
import {NotificacionesService} from '../../notificaciones/notificaciones.service';
import { NavbarService } from 'src/app/shared/navbar/navbar.service';
import { ServiceWorkerService } from 'src/app/shared/services/service-worker.service';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
    public pushRightClass: string;
    USE_USUARIO: string = localStorage.getItem('USE_USUARIO');
    IS_LOGUEADO: boolean;
    CLI_ID :number;
    ESP_ID :number;
    POST_ID:number;
    cargar = false; 
    mostrarAlerta = false;
    tipoAlerta = "";
    mensaje = "";
    listaNotificaciones:any[]; //Almacena todas las notificaciones listadas de un usuario;}
    listaNotificacionesRecibidas:Notificacion[];
    listaNotificacionesPequena:Notificacion[];
    cantidadNotificaciones: number; //Cuenta la cantidad de notificaciones que tiene el usuario; 
    typeOfUser: any;
    listaMostrarNotificaciones: any;
    notificacionesAuto;
    @ViewChild('verMasNotificaciones') verMasNotificaciones: ElementRef;
    validarRecarga:boolean=false;
    isActive = false;
    mensajeNotificationPush = "";
    mostrarAlertaNotificationPush = false;
    tipoAlertaNotificactionPush = "";

    constructor(private translate: TranslateService, public router: Router, public authService: AuthService,
        private usuarioService: UsuariosService,
        private notificacionesService: NotificacionesService,
        private storageService: StorageService,
        public modal: NgbModal,
        private navbarService:NavbarService,
        private serviceWorker:ServiceWorkerService) {

        this.router.events.subscribe(val => {
            if (
                val instanceof NavigationEnd &&
                window.innerWidth <= 992 &&
                this.isToggled()
            ) {
                this.toggleSidebar();
            }
        });


        if(!this.serviceWorker.isWebview()){
            navigator.serviceWorker.register('sw.js').then((reg) => {
                reg.pushManager.getSubscription().then((activadas) => {
                    this.verificaSuscripcion(activadas);
                });
            });
    
            if (Notification.permission === "granted") {
    
                navigator.serviceWorker.register('sw.js').then((reg) => {
                    reg.pushManager.getSubscription().then((activadas) => {
                        if(!activadas){
    
                            const auth_key = localStorage.getItem('auth_key');
    
                            if(auth_key != null){
                                if(auth_key != ""){
    
                                    this.cerrarSuscripcionPlantilla(auth_key);
    
                                }
                            }
                            else{
                            
                                const band_click = localStorage.getItem('BAND_CLICK');
    
                                if(band_click === "true"){
                                    this.generarSuscripcion();
                                }
    
                            }
                        }
                        else{
                            const band_click = localStorage.getItem('BAND_CLICK');
    
                            if(band_click === "true"){
                                this.generarSuscripcion();
                            }
                        }
                    });
                });
        
            } 
            else if (Notification.permission === "denied") {
    
    
                const auth_key = localStorage.getItem('auth_key');
                if(auth_key != null){
                    if(auth_key != ""){
    
                        this.cerrarSuscripcionPlantilla(auth_key);
    
                    }
                }
                
            } 
            else {
    
                const auth_key = localStorage.getItem('auth_key');
    
                if(auth_key != null){
                    if(auth_key != ""){
                        this.cerrarSuscripcionPlantilla(auth_key);
                    }
                }
    
                Notification.requestPermission().then((permission) => {
    
                    if (permission === "granted") {
                        window.location.reload();
                    } else {
                        this.serviceWorker.startVerification('true');
                    }
    
                }).catch((error) => {
                    console.error("Error al solicitar permiso para notificaciones:", error);
                });
            }
        }
        else{
            // alert("SI estoy en webview");
        }

    }



    ngOnInit() {       
        this.IS_LOGUEADO = this.storageService.hasKey("USE_SUB");
        this.pushRightClass = 'push-right';
        this.usuarioService.usuarioUpdatedEvent.subscribe(updated => {
            this.USE_USUARIO = this.storageService.getString('USE_USUARIO');
        });

        if(this.storageService.hasKey('USE_ID')){
            this.typeOfUser = localStorage.getItem('USE_TYPE');
            if(this.typeOfUser == "0"){
                this.CLI_ID = +this.storageService.getString('USE_ID');
                // this.listarNotificacionesClientes();
            }else if (this.typeOfUser == "1" ){
                this.ESP_ID = +this.storageService.getString('USE_ID');
                // this.listarNotificacionesEspecialistaD();
            }
        }else if(this.storageService.hasKey('POST_ID')){ 
            this.POST_ID = +this.storageService.getString('POST_ID');
            // this.listarNotificacionesPostulantes();
        }

        // this.notificacionesAuto = setInterval(() => {
        //     if(this.storageService.hasKey('USE_ID')){
        //         this.typeOfUser = localStorage.getItem('USE_TYPE');
        //         if(this.typeOfUser == "0"){
        //             this.CLI_ID = +this.storageService.getString('USE_ID');
        //             this.listarNotificaciones(false);
        //         }else if (this.typeOfUser == "1" ){
        //             this.ESP_ID = +this.storageService.getString('USE_ID');
        //             this.listarNotificacionesEspecialistas(false);
        //         }
        //     }else if(this.storageService.hasKey('POST_ID')){ 
        //         this.POST_ID = +this.storageService.getString('POST_ID');
        //         this.listarNotificacionesPos(false);
        //     }
        //   }, 8000);
    }

    leerNotificacion(notificacionId:number){
        this.cargar = true; 
        this.notificacionesService.actualizarEstadoNotificacion(notificacionId).subscribe(data => {
           
            this.cargar = false; 
            this.mostrarAlerta = true;
            this.tipoAlerta = 'success';
            this.mensaje = "El mensaje se ha marcado como leído correctamente.";

            // this.listaNotificaciones.length = 0 ; 
            if(this.typeOfUser == "0"){
                // setTimeout(() => {
                //     this.listarNotificacionesClientes();
                // }, 1000);
            }else if (this.typeOfUser == "1" ){
               
                // setTimeout(() => {
                //     this.listarNotificacionesEspecialistaD();
                // }, 1000);
            }else{
                // setTimeout(() => {
                //     this.listarNotificacionesPostulantes();
                // }, 1000);
            }
            this.cerrarAlerta();
        },error =>{
            //aca debería ir el error
            this.cargar = false; 
            this.mostrarAlerta = true;
            this.tipoAlerta = "danger";
            this.mensaje = "No se pudo realizar la solicitud.";
            this.cerrarAlerta();
        });
        
    }

    listarNotificacionesPostulantes(){
        this.cargar = true;
        this.notificacionesService.listarNotificacionPostulante(this.POST_ID).subscribe(data=>{
            this.cargar = false;
            this.mostrarAlerta=false;
            this.listaNotificaciones = data['Resultado'] ;
            this.listaNotificacionesRecibidas= data['Resultado'];
            this.cantidadNotificaciones = this.listaNotificaciones.length;
            
            this.listaNotificacionesPequena = this.listaNotificacionesRecibidas.filter((x,index) =>{
                if(index < 3)
                    return x; 
                return false;
            });
            this.setCollapsed();
            this.cargar = false;
        },error=>{
            //aqui tengo que poner el error :v 
            this.cargar = false;
        });
    }

    cambiarIcono(not: any ){
        if(!this.cargar){
            for(let i = 0; i < this.listaNotificaciones.length; i++){
                if(this.listaNotificaciones[i].NOT_ID == not.NOT_ID){
                    this.listaNotificaciones[i].ICON = !this.listaNotificaciones[i].ICON;
                }
            }
        }
        
    }

    listarNotificacionesClientes(){
        this.cargar = true;
        this.notificacionesService.listarNotificacionCliente(this.CLI_ID).subscribe(data=>{
            this.cargar = false;
            this.mostrarAlerta=false;
            this.listaNotificaciones = data['Resultado'] ;
            this.listaNotificacionesRecibidas= data['Resultado'];
            this.cantidadNotificaciones = this.listaNotificaciones.length;
            this.listaNotificacionesPequena = this.listaNotificacionesRecibidas.filter((x,index) =>{
                if(index < 3)
                    return x; 
                return false;
            });
            this.setCollapsed();
            this.cargar = false;
        },error=>{
            //aqui tengo que poner el error :v 
            this.cargar = false;
        });
    }

    listarNotificaciones(boolean){
        this.notificacionesService.listarNotificacionCliente(this.CLI_ID).subscribe(data=>{
            this.cargar=false;
            let aux = this.listaNotificacionesRecibidas.filter((x,index) =>{
                if(index < 3)
                    return x; 
                return false;
            });
            
            if (this.listaNotificaciones.length!=0 && this.listaNotificacionesRecibidas.length!=0) {
                if (this.listaNotificaciones.length  != data['Resultado'].length && this.listaNotificacionesRecibidas.length != data['Resultado'].length) {
                    this.mostrarAlerta = true;
                    this.tipoAlerta = 'success';
                    this.mensaje = "Tiene notificaciones pendientes.";
                    this.validarRecarga=true;
                    if (boolean) {
                        this.cargar = true;
                        this.listaNotificaciones = data['Resultado'] ;
                        this.listaNotificacionesRecibidas= data['Resultado'];
                        this.cantidadNotificaciones = this.listaNotificaciones.length;
                        this.listaNotificacionesPequena = this.listaNotificacionesRecibidas.filter((x,index) =>{
                            if(index < 3)
                                return x; 
                            return false;
                        });
                    }
                    this.cerrarAlerta();
                }else{
                    this.validarRecarga=false;
                }
            }else{
                this.validarRecarga=false;
            }
        },error=>{
            //aqui tengo que poner el error :v 
            this.cargar = false;
        });
    }

    setCollapsed() {
        for (let index = 0; index < this.listaNotificaciones.length; index++) {
          this.listaNotificaciones[index]['IS_COLLAPSED'] = false;
          this.listaNotificaciones[index]['ICON'] = false;
        }
    }

    listarNotificacionesEspecialistas(boolean){
        this.notificacionesService.listarNotificacionEspecialista(this.ESP_ID).subscribe(data=>{
            let aux = this.listaNotificacionesRecibidas.filter((x,index) =>{
                if(index < 3)
                    return x;
                return false;
            });
            this.cargar=false;
            if (this.listaNotificaciones.length!=0 && this.listaNotificacionesRecibidas.length!=0) {
                if (this.listaNotificaciones.length  != data['Resultado'].length && this.listaNotificacionesRecibidas.length != data['Resultado'].length) {
                    this.mostrarAlerta = true;
                    this.tipoAlerta = 'success';
                    this.mensaje = "Tiene notificaciones pendientes.";
                    this.validarRecarga=true;
                    if (boolean) {
                        this.cargar = true;
                        this.listaNotificaciones = data['Resultado'] ;
                        this.listaNotificacionesRecibidas= data['Resultado'];
                        this.cantidadNotificaciones = this.listaNotificaciones.length;
                        this.listaNotificacionesPequena = this.listaNotificacionesRecibidas.filter((x,index) =>{
                            if(index < 3)
                                return x; 
                            return false;
                        });
                    }
                    this.cerrarAlerta();
                }else{
                    this.validarRecarga=false;
                }
            }else{
                this.validarRecarga=false;
            }
        },error=>{
            //aqui tengo que poner el error :v 
            this.cargar = false;
        });
    }

    listarNotificacionesPos(boolean){
        this.notificacionesService.listarNotificacionPostulante(this.POST_ID).subscribe(data=>{
            let aux = this.listaNotificacionesRecibidas.filter((x,index) =>{
                if(index < 3)
                    return x;
                return false;
            });
            
            if (this.listaNotificaciones.length!=0 && this.listaNotificacionesRecibidas.length!=0) {
                if (this.listaNotificaciones.length  != data['Resultado'].length && this.listaNotificacionesRecibidas.length != data['Resultado'].length) {
                    this.mostrarAlerta = true;
                    this.tipoAlerta = 'success';
                    this.mensaje = "Tiene notificaciones pendientes.";
                    this.validarRecarga=true;
                    if (boolean) {
                        this.cargar = true;
                        this.listaNotificaciones = data['Resultado'] ;
                        this.listaNotificacionesRecibidas= data['Resultado'];
                        this.cantidadNotificaciones = this.listaNotificaciones.length;
                        this.listaNotificacionesPequena = this.listaNotificacionesRecibidas.filter((x,index) =>{
                            if(index < 3)
                                return x; 
                            return false;
                        });
                    }
                    this.cerrarAlerta();
                }else{
                    this.validarRecarga=false;
                }
            }else{
                this.validarRecarga=false;
            }
        },error=>{
            //aqui tengo que poner el error :v 
            this.cargar = false;
        });
    }

    listarNotificacionesEspecialistaD(){
        this.cargar = true;
        this.notificacionesService.listarNotificacionEspecialista(this.ESP_ID).subscribe(data=>{
            this.cargar = false;
            this.mostrarAlerta=false;
            this.listaNotificaciones = data['Resultado'] ;
            this.listaNotificacionesRecibidas= data['Resultado'];
            this.cantidadNotificaciones = this.listaNotificaciones.length;
            
            this.listaNotificacionesPequena = this.listaNotificacionesRecibidas.filter((x,index) =>{
                if(index < 3)
                    return x; 
                return false;
            });
            this.setCollapsed();
            this.cargar = false;
        },error=>{
            //aqui tengo que poner el error :v 
            this.cargar = false;
        });
    }

    recargarNotificaciones(){
        if(this.storageService.hasKey('USE_ID')){
            if(this.typeOfUser == "0"){
                this.listarNotificacionesClientes();
            }else if (this.typeOfUser == "1" ){
                this.listarNotificacionesEspecialistaD();
            }
        }else if(this.storageService.hasKey('POST_ID')){ 
            this.listarNotificacionesPostulantes();
        }
    }

    isToggled(): boolean {
        const dom: Element = document.querySelector('body');
        return dom.classList.contains(this.pushRightClass);
    }

    toggleSidebar() {
        const dom: any = document.querySelector('body');
        dom.classList.toggle(this.pushRightClass);
    }

    rltAndLtr() {
        const dom: any = document.querySelector('body');
        dom.classList.toggle('rtl');
    }

    onLoggedout() {
        this.authService.logout();
        localStorage.removeItem('USER_FEL');
        localStorage.removeItem('USE_USUARIO');
        localStorage.removeItem('USE_SUB');
        const cookies = localStorage.getItem('cookieConsent') === 'true';
        localStorage.setItem('cookieConsent', cookies ? 'true' : 'false');

        //Notificaciones

        const auth_key = localStorage.getItem('auth_key');

        localStorage.removeItem('USU_NOTI');
        if(auth_key != null){
            if(auth_key != ""){
                /*const tablaAuthKey = {
                    auth_key: auth_key 
                };
    
                localStorage.removeItem('auth_key');
        
                this.serviceWorker.cerrarSubscripcion(tablaAuthKey).subscribe({
                    next: (data:any) => {
                    //localStorage.removeItem('auth_key');
                    }
                });*/
    
                this.cerrarSuscripcionPlantilla(auth_key);
            }
        }
        
        // if(this.storageService.getString('MOVIL')!=='1')
        //     this.router.navigate(['/home']); 
    }

    changeLang(language: string) {
        this.translate.use(language);
    }

    closeModal(): any {
        this.modal.dismissAll();
    }

    verMasNotificacionesFuncion() {
        this.modal.open(this.verMasNotificaciones, {size: 'lg'});
    }

    redireccionarNotificacion(not){
        this.navbarService.enviarBanderaAlerta(0);
        if (not.NOT_TITULO == 'Solicitud Aceptada' || not.NOT_TITULO == 'Servicio Programado' || not.NOT_TITULO == 'Solicitud Iniciada') {
            this.navbarService.disparadorNavbar.emit({
                data: 2
            });
        } else if (not.NOT_TITULO == 'Solicitud creada' || not.NOT_TITULO =='Solicitud remota creada'){
            this.navbarService.disparadorNavbar.emit({
                data: 1
            });
        } else if (not.NOT_TITULO == 'Solicitud Rechazada' ){
            this.navbarService.disparadorNavbar.emit({
                data: 4
            });
        }else{
            this.navbarService.disparadorNavbar.emit({
                data: 5
            });
        }
        this.router.navigate(['mis-solicitudes']);
    }

    ngOnDestroy() {
        if (this.notificacionesAuto) {
          clearInterval(this.notificacionesAuto);
        }
    }
    cerrarAlerta(){
        setTimeout(() => {
            this.mostrarAlerta=false;
            this.mensaje="";
        }, 5000);
    }



    verificaSuscripcion( activadas:any) {

        if ( activadas ) {

            this.isActive = true;
            
        } else {
            this.isActive = false;
        }

    }


    cancelarSuscripcion() {

        this.serviceWorker.getRegisterServiceWorker()?.pushManager.getSubscription().then( subs => {

            subs?.unsubscribe().then( () => { 
                this.verificaSuscripcion(false);
                window.location.reload();
            });

        });
    }


    toggle() {

        if(this.isActive){
            this.cancelarSuscripcion();
            this.isActive = false;
            localStorage.setItem('BAND_CLICK',"false");
        }
        else{
            this.serviceWorker.subscribeUser().then(subscription => {
                if (subscription) {


                    localStorage.setItem('auth_key',String(subscription.auth));
                    
                    const idUsuarioActual = localStorage.getItem('USU_NOTI');


                    const tablaSuscripcion = {
                        id_usuario: idUsuarioActual,            
                        endpoint: subscription.endpoint,   
                        p256dh_key: subscription.p256dh,  
                        auth_key: subscription.auth,
                        time_register: (new Date()).toISOString()
                    };
            
                    this.serviceWorker.guardarSubscripcion(JSON.stringify(tablaSuscripcion))
                            .subscribe({next: (data:any) => {
                                this.verificaSuscripcion(data);
                                this.serviceWorker.startVerification('false');
                                this.isActive = true;
                                localStorage.setItem('BAND_CLICK',"true");
                    
                            }});
        
                } 
                   
            }).catch((error) =>{


                Notification.requestPermission().then((permission) => {
                    if (permission === "granted") {
                        window.location.reload();
                    } else {
                        
                        this.serviceWorker.startVerification('true');
                    }
                  }).catch((error) => {
                    console.error("Error al solicitar permiso para notificaciones:", error);
                });

                console.log("Estoy en el catch de la suscripcion que no da");
            });
        }
    }

    cerrarSuscripcionPlantilla(auth_key:any){

        const tablaAuthKey = {
            auth_key: auth_key 
        };

        localStorage.removeItem('auth_key');

        this.serviceWorker.cerrarSubscripcion(tablaAuthKey).subscribe({
            next: (data:any) => {
                console.log(data);
                console.log("Cerrado correctamente con subscripcion");
            }
        });
    }

    generarSuscripcion(){
        this.serviceWorker.subscribeUser().then(subscription => {
            if (subscription) {


                localStorage.setItem('auth_key',String(subscription.auth));
                
                const idUsuarioActual = localStorage.getItem('USU_NOTI');


                const tablaSuscripcion = {
                    id_usuario: idUsuarioActual,            
                    endpoint: subscription.endpoint,   
                    p256dh_key: subscription.p256dh,  
                    auth_key: subscription.auth,
                    time_register: (new Date()).toISOString()
                };
        
                this.serviceWorker.guardarSubscripcion(JSON.stringify(tablaSuscripcion))
                    .subscribe({next: (data:any) => {
                        this.verificaSuscripcion(data);
                        this.serviceWorker.setBanderaToggleSidebar("true");
                        this.serviceWorker.startVerification('false');
                        this.isActive = true;
            
                    }});
            } 
            
        });
    }
}
