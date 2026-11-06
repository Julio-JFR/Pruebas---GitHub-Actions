import { Component, Output, EventEmitter, OnInit ,ViewChild, ElementRef} from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { StorageService } from 'src/app/helpers/storage.service';
import { AuthService } from 'src/app/shared/guard/auth.service';
import { UsuariosService } from '../../usuarios/usuarios.service';
import { PostulanteService } from '../../postulante/postulante.service';
import { NgbModal, NgbModalConfig, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import {Notificacion} from '../../notificaciones/notificacion.model'; 
import {NotificacionesService} from '../../notificaciones/notificaciones.service';
import { NavbarService } from 'src/app/shared/navbar/navbar.service';
import { RoutingService } from 'src/app/helpers/routing.service';
import { ServiceWorkerService } from 'src/app/shared/services/service-worker.service';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
    isActive: boolean;
    collapsed: boolean;
    showMenu: string;
    pushRightClass: string;
    USE_TYPE: string = this.storageService.getString('TIPO_SESION');
    USE_STATE: string = this.storageService.getString('USE_STATE');
    TIPO_USUARIO: string = this.storageService.getString('USE_TYPE');
    POST_STATE = this.storageService.hasKey('POST_STATE') ? this.storageService.getString('POST_STATE') : null; // si existe el POST_STATE se le asigna el valor de ese ítem, sino será null
    USE_NAMES = '';

    IS_LOGUEADO: boolean;

    rutaCambioContra: string;
    cargar = false; 

    mostrarAlerta = false;
    tipoAlerta = "";
    mensaje = "";
    routes = this.createRoutes();
    routesBackup = this.routes;
    ICONO ='fa fa-envelope-o';
    ICONO2 = 'fa fa-angle-down';
    public isCollapsed = true;
    CLI_ID :number;//almacena el id del cliente
    ESP_ID :number;//almacena el id del especialista
    POST_ID:number;//almacena el id del postulantee
    listaNotificaciones:any[]; //Almacena todas las notificaciones listadas de un usuario pero es tipo any ;
    listaNotificacionesRecibidas:Notificacion[];// Almacena todas las notificaciones listadas pero es tipo Notificacion
    listaNotificacionesPequena:Notificacion[];//Se guardarán solamenente 3 o menos notificaciones de las listas recividas
    cantidadNotificaciones: number; //Cuenta la cantidad de notificaciones que tiene el usuario; 
    typeOfUser: any;


    isActiveNotificaction = false;

    @Output() collapsedEvent = new EventEmitter<boolean>();
    @ViewChild('verMasNotificaciones') verMasNotificaciones: ElementRef;
    constructor(private translate: TranslateService, public router: Router, public authService: AuthService,
        private usuarioService: UsuariosService,
        private routingService: RoutingService,
        private serviceWorker:ServiceWorkerService,
        private postulanteService: PostulanteService,private notificacionesService: NotificacionesService,
        private storageService: StorageService,public modal: NgbModal,
        private navbarService:NavbarService,) {
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
    
            this.serviceWorker.bandera$.subscribe((banderaToggle) => {
                if (banderaToggle === 'true') {
                  navigator.serviceWorker.register('sw.js').then((reg) => {
                    reg.pushManager.getSubscription().then((activadas) => {
                      this.verificaSuscripcion(activadas);
                    });
                  });
                }
            });
        }
    }

    ngOnInit() {
        this.isActive = false;
        this.collapsed = false;
        this.showMenu = '';
        this.pushRightClass = 'push-right';
        this.USE_NAMES = localStorage.getItem('USE_USUARIO');
        this.IS_LOGUEADO = this.storageService.hasKey("USE_SUB");

        // si un usuario está tratando de cambiar la contraseña
        if (this.USE_TYPE === '1' && this.USE_STATE === '2') {
            this.rutaCambioContra = '/change-password';
        }

        // si un postulante está tratando de cambiar la contraseña
        if (this.USE_TYPE === '0' && this.USE_STATE === '3') {
            this.rutaCambioContra = '/change-password-post';
        }



            this.usuarioService.usuarioUpdatedEvent.subscribe(updated => {
                this.USE_NAMES = this.storageService.getString('USE_USUARIO');
                this.USE_STATE = this.storageService.getString('USE_STATE');
                this.USE_TYPE = this.storageService.getString('TIPO_SESION');

                this.routes = this.createRoutes();
            });

            if(this.storageService.hasKey('USE_ID')){
                this.typeOfUser = localStorage.getItem('USE_TYPE');
                if(this.typeOfUser == "0"){
                    // this.CLI_ID = +this.storageService.getString('USE_ID');
                    // this.listarNotificacionesClientes();
                }else if (this.typeOfUser == "1" ){
                    // this.ESP_ID = +this.storageService.getString('USE_ID');
                    // this.listarNotificacionesEspecialistas();
                }
            }else if(this.storageService.hasKey('POST_ID')){ 
                // this.POST_ID = +this.storageService.getString('POST_ID');
                // this.listarNotificacionesPostulantes();
            }
    }

    leerNotificacion(notificacionId:number){
        this.cargar = true; 
        this.notificacionesService.actualizarEstadoNotificacion(notificacionId).subscribe(data => {
           
            this.listaNotificaciones.length = 0 ; 
            if(this.typeOfUser == "0"){
                // this.listarNotificacionesClientes();
            }else if (this.typeOfUser == "1" ){
               
                // this.listarNotificacionesEspecialistas();
            }else{
                // this.listarNotificacionesPostulantes();
            }

            this.cargar = false; 
            this.mostrarAlerta = true;
            this.tipoAlerta = 'success';
            this.mensaje = "El mensaje se ha marcado como leído correctamente.";

        },error =>{
            //aca debería ir el error
            this.cargar = false; 
            this.mostrarAlerta = true;
            this.tipoAlerta = "danger";
            this.mensaje = "No se pudo realizar la solicitud.";
        });
        
    }
    
    listarNotificacionesPostulantes(){
        if(!this.cargar){
            this.cargar = true;
            this.notificacionesService.listarNotificacionPostulante(this.POST_ID).subscribe(data=>{
    
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
    setCollapsed() {
        for (let index = 0; index < this.listaNotificaciones.length; index++) {
          this.listaNotificaciones[index]['IS_COLLAPSED'] = false;
          this.listaNotificaciones[index]['ICON'] = false;
        }
      }
    listarNotificacionesEspecialistas(){
        this.cargar = true;
        this.notificacionesService.listarNotificacionEspecialista(this.ESP_ID).subscribe(data=>{

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
    closeModal(): any {
        this.modal.dismissAll();
    }
    verMasNotificacionesFuncion() {
        this.modal.open(this.verMasNotificaciones, {size: 'lg'});
      }
    createRoutes() {
        return [
            {
                show: (this.USE_TYPE === '0' &&  this.USE_STATE !== '3'), // La primera condición significa que es tipo: POSTULANTE y la segunda que su estado sea diferente a pendiente por contraseña
                link: 'postulante/postulacion',
                icon: 'fa fa-fw fa-id-card-o',
                title: 'Postulaciones',
            },
            {
                show: (this.USE_TYPE === '0' && this.USE_STATE !== '3'), // La primera condición significa que es tipo: POSTULANTE y la segunda que su estado sea diferente a pendiente por contraseña
                link: 'postulante/profile',
                icon: 'fa fa-fw fa-id-badge',
                title: 'Postulante'
            },
            {
                show: (this.USE_TYPE === '1' && this.USE_STATE !== '2' && this.TIPO_USUARIO === '1'),
                link: 'especialista/profile',
                icon: 'fa fa-user-circle-o',
                title: 'Mi Cuenta'
            },
            // Side bar cliente
            // Mi cuenta
            {
                show: this.USE_TYPE === '1' && this.USE_STATE !== '2' && this.TIPO_USUARIO === '0',
                link: 'cliente/profile',
                icon: 'fa fa-user-circle-o',
                title: 'Mi Cuenta'
            },
            // Solicitar Servicio
            {
                show: this.USE_TYPE === '1' && this.USE_STATE !== '2' && this.TIPO_USUARIO === '0',
                link: 'cliente/solicitar-servicio',
                icon: 'fa fa-clipboard',
                title: 'Solicitar Servicio'
            },
            // Mis Solicitudes
            {
                show: this.USE_TYPE === '1' && this.USE_STATE !== '2' && this.TIPO_USUARIO === '0',
                link: 'cliente/mis-solicitudes',
                icon: 'fa fa-clipboard',
                title: 'Mis Solicitudes'
            },
            // La primera condicion significa que es Tipo: USUARIO, la segunda es Tipo: especialista y el tercero quiere decir que sea diferente del estado 2 (que es el estado de cambio de contraseña para usuario)
            {
                show: (this.USE_TYPE === '1' && this.TIPO_USUARIO === '1') && this.USE_STATE !== '2',
                link: 'especialista/solicitudes',
                icon: 'fa fa-clipboard',
                title: 'Sol. de Servicios'
            },
            {
                show: (this.USE_TYPE === '1' && this.TIPO_USUARIO === '1') && this.USE_STATE !== '2',
                link: 'especialista/trabajosConfirmados',
                icon: 'fa fa-check-circle',
                title: 'Trab. Confirmados'
            },
            {
                show: (this.USE_TYPE === '1' && this.TIPO_USUARIO === '1' ) && this.USE_STATE !== '2',
                link: 'especialista/trabajos-ejecucion',
                icon: 'fa fa-hourglass-end',
                title: 'Trab. en ejecución'
            },
            // USE_TYPE indica el tipo de sesión (0 si la sesión es del postulante y 1 si lo hizo el usuario) y USE_STATE indica es el estado del quien inicio sesión (2 y 3 indican que está en estado pendiente por cambio de contraseña respectivamente)
            {
                show: (this.USE_TYPE === '1' && this.USE_STATE === '2') || (this.USE_TYPE === '0' && this.USE_STATE === '3') || (this.TIPO_USUARIO === '0' && this.USE_STATE === '2'),
                link: this.rutaCambioContra,
                icon: 'fa fa-expeditedssl',
                title: 'Act. Contraseña'
            }
        ];
    }

    eventCalled() {
        this.isActive = !this.isActive;
    }

    addExpandClass(element: any) {
        if (element === this.showMenu) {
            this.showMenu = '0';
        } else {
            this.showMenu = element;
        }
    }

    toggleCollapsed() {
        this.collapsed = !this.collapsed;
        this.collapsedEvent.emit(this.collapsed);
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

    changeLang(language: string) {
        this.translate.use(language);
    }

    onLoggedout() {

        //Notificaciones
        const auth_key = localStorage.getItem('auth_key');
        localStorage.removeItem('USU_NOTI');
        if(auth_key != null){
            if(auth_key != ""){
                this.cerrarSuscripcionPlantilla(auth_key);
            }
        }
        this.authService.logout();
        localStorage.removeItem('USER_FEL');
        localStorage.removeItem('isLoggedin');
        localStorage.removeItem('USER_FEL');
        localStorage.removeItem('USE_USUARIO');
        localStorage.removeItem('USE_SUB');
        const cookies = localStorage.getItem('cookieConsent') === 'true';
        localStorage.setItem('cookieConsent', cookies ? 'true' : 'false');

        //Notificaciones
    
        if(auth_key != ""){
            const tablaAuthKey = {
                auth_key: auth_key 
            };

            localStorage.removeItem('auth_key');
        }
        
        localStorage.removeItem('USU_NOTI');
        const tipoUsu = Number(this.storageService.getString('USE_TYPE_MOVIL'));
        const isMovil = this.storageService.getString('MOVIL')=='1';
        let ruta = '';
        switch (tipoUsu) {
          case 1:
            ruta = isMovil ? '/especialistas/login/movil' : '/especialistas/login';
            break;
          case 2:
            ruta = isMovil ? '/clientes/login/movil' : '/clientes/login';
            break;
          default:
            console.log('DEFAULT');
            ruta = isMovil ? 'postulante/login/movil' : 'postulante/login';
            break;
        }
        this.routingService.replace([ruta]);
    }
  
    
    recargarNotiticaciones(route){
        if(route.link == '/mis-solicitudes'){
            this.navbarService.disparadorNavbar.emit({
                data: 1
            });
        }
        this.notificacionesService.insertarNotificacion(true);
    }




    verificaSuscripcion( activadas:any) {

        if ( activadas ) {

            this.isActiveNotificaction = true;
            
        } else {
            this.isActiveNotificaction = false;
        }

    }

    cancelarSuscripcion() {

    }

    toggle() {

        if(this.isActiveNotificaction){
            this.cancelarSuscripcion();
            this.isActiveNotificaction = false;
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
                                this.isActiveNotificaction = true;
                                localStorage.setItem('BAND_CLICK',"true");
                    
                            }});
                } 
                   
            }).catch((error) =>{
                Notification.requestPermission().then((permission) => {
                    if (permission === "granted") {
                        window.location.reload();
                    } else {
                        //alert("Llege aca");
                        this.serviceWorker.startVerification('true');
                    }
                  }).catch((error) => {
                    console.error("Error al solicitar permiso para notificaciones:", error);
                });
            });
        }
    }


    cerrarSuscripcionPlantilla(auth_key:any){

        const tablaAuthKey = {
            auth_key: auth_key 
        };

        localStorage.removeItem('auth_key');
    }
}
