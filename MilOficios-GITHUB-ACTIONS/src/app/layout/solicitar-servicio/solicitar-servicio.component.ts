import { Component, HostListener, OnInit,ViewChild } from '@angular/core';
import {SolicitarServicioService} from './solicitar-servicio.service';
import {CategoriasService} from '../servicios/categorias/categorias.service';
import { EntidadCategoria } from '../servicios/categorias/entidad-categoria';
import {ServiciosService} from '../servicios/servicios.service';
import { EntidadServicio } from '../servicios/entidad-servicio';
import { animate, state, style, transition, trigger } from '@angular/animations';
import {StorageService} from '../../helpers/storage.service';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { ConfiguracionesService } from '../configuraciones/configuraciones.service';
import { NgbAlert } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject,Subscription  } from 'rxjs';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { ServiceWorkerService } from 'src/app/shared/services/service-worker.service';

@Component({
  selector: 'app-solicitar-servicio',
  templateUrl: './solicitar-servicio.component.html',
  styleUrls: ['./solicitar-servicio.component.scss'],
  animations: [
    trigger('animacionServicios',[
      state('posicion_inicial',style({
        transform: 'translateX(0vw)',
        
      })),
      state('posicion_final',style({
        transform: 'translateX(10vw)'
        
      })),
      transition('posicion_inicial => posicion_final',
        animate('0.5s')
      )
    ])
    
  ]
})
export class SolicitarServicioComponent implements OnInit {
  active = 1 ;
  categoriaSeleccionada: string = "";
  /*  ATTRIBUTOS DE ALERTAS */
  mostrarAlerta = false;
  mostrarAlertaError = false;
  mensaje = '';
  tipoAlerta: string;
  loading:boolean;
  cargando:boolean;
  vermas:boolean;
  mostrar_servicios:string;
  colorFondo: number;
  mostrar: boolean;
  IdCat:number;
  width: number;
  height: number;
  precioMinimo = 0;
  precioMaximo = 0;
  origin: any;
  mostrarAlertaGoogle = false; // es para mostrar la alerta del estado que nos arroja google maps.

  mostrarAlertaNotification = false;
  tipoAlertaNotification = "";
  mensajeNotification = "";

  @HostListener('window:resize', ['$event'])
  getScreen(event?){
    this.width = window.innerWidth;
    this.height = window.innerHeight;
  }
  listaDeCategorias: EntidadCategoria[];
  listarServiciosPorCategoria: EntidadServicio[];
  @ViewChild('selfClosingAlert', {static: false}) selfClosingAlert: NgbAlert; 


  DOMINIO = environment.domain_url;

  constructor(
    private solicitarServicioService: SolicitarServicioService,
    private categoriaService : CategoriasService,
    private servicioService: ServiciosService,
    private localStorageService:StorageService,
    private serviceWorker:ServiceWorkerService,
    private configuracionesService:ConfiguracionesService,
    private notificacionesService:NotificacionesService,
    private router:Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    //this.mostrar_servicios ='posicion_inicial';
    this.loading = false;
    this.vermas = false;
    this.mostrar = false;
    this.colorFondo = 0;
    this.obtenerUbicacion();
    this.obtenerConfiguraciones();
    this.categoriaService.updateHeaders();
    this.servicioService.updateHeaders();
    this.obtenerCategorias();
    this.width = window.innerWidth;
    this.height = window.innerHeight; 
    this.getScreen();
    this.eliminarLocalStorageDeServicio();
    
    if(!this.serviceWorker.isWebview()){
      const band_click = localStorage.getItem('BAND_CLICK');

      if (Notification.permission === "granted" && band_click === "true") {
        this.mostrarAlertaNotification = false;
        this.tipoAlertaNotification = "";
        this.mensajeNotification = "";
      } else {

        this.serviceWorker.startVerification('true');
        this.serviceWorker.state$.subscribe((state) => {

            if(state === 'true'){
              const band_click_aux = localStorage.getItem('BAND_CLICK');
              if(!(Notification.permission === "granted" && band_click_aux === "true")){

                if(Notification.permission === "denied" || Notification.permission === "default"){

                  this.mostrarAlertaNotification = true;
                  this.tipoAlertaNotification = "danger";
                  this.mensajeNotification = "¿Deseas ver tus notificaciones? Actívalas primero desde la configuración de tu navegador";
                  console.log('Variable actualizada:', this.mostrarAlertaNotification);
                }
                else{

                  this.mostrarAlertaNotification = true;
                  this.tipoAlertaNotification = "danger";
                  this.mensajeNotification = "Advertencia: Las notificaciones de este sitio están desactivadas";
                  console.log('Variable actualizada:', this.mostrarAlertaNotification);

                }
              }
            }
            else{
              this.mostrarAlertaNotification = false;
              this.tipoAlertaNotification = "";
              this.mensajeNotification = "";
            }
            
          }
        );
      }
    } 
  }

  eliminarLocalStorageDeServicio(){
    if(this.localStorageService.hasKey("SERVICIO")) this.localStorageService.remove("SERVICIO");
  }

  obtenerCategorias(){
    this.loading = true;
    
    this.categoriaService.getCategorias().subscribe(data => {
      this.listaDeCategorias = data['Resultado '];
      this.loading = false;
    }, error => {
      //this.loading = false;
      this.tipoAlerta = 'danger';
      this.mostrarAlerta = true;
      this.mensaje = ' Hubo un error al intentar listar los datos de las Categorías. Por favor, intente de nuevo.';
      this.cerrarAlerta();
    }
    );
  }

  obtenerServiciosPorCategorias(IdCategoria: number) {
    this.cargando=true;
    this.categoriaSeleccionada = (this.listaDeCategorias.find(element => element.CAT_ID as unknown as number === IdCategoria).CAT_NOMBRE).toUpperCase();
    this.IdCat = IdCategoria;
    this.servicioService.getServiciosPorCategoriaLimitado(IdCategoria).subscribe(data => {
      this.mostrar_servicios = 'posicion_inicial'
      setTimeout(()=>this.mostrar_servicios = 'posicion_final',50);
       // this.mostrar_servicios = 'posicion_final';
      //this.mostrar_servicios = this.mostrar_servicios === 'posicion_inicial'?'posicion_final':'posicion_inicial';
      this.listarServiciosPorCategoria = data['resultado'];
      this.vermas = true;
      this.cargando=false;
      this.mostrar = true;
      this.colorFondo = IdCategoria;
    }, error => {
      
      if (error['error']['error'] !== undefined) {
        if (error['error']['error'] === 'error_BD') {
          this.mensaje = 'No se pudo obtener los datos, debido a la falla de alguna conexión. Por favor, intente otra vez.';
      } else {
        this.mensaje = ' Hubo un error al intentar mostrar los servicios. Por favor, intente otra vez.';
      }
      
    }
      this.mensaje = ' Hubo un error al intentar mostrar los servicios. Por favor, intente otra vez.';
  });
  }

  goToDetails(url, servicio) {
    servicio["CAT_ID"] = this.IdCat;
    this.localStorageService.storeObjeto("SERVICIO", servicio );
    this.router.navigate([`../${url}`], { relativeTo: this.route });
  } 

  verMasServicios() {
    this.router.navigate(['app/cliente/solicitar-servicio',this.IdCat]);
  }
  
  obtenerConfiguraciones(){
    this.configuracionesService.listar().subscribe(data=> {
      data['Resultado'].forEach(data =>{
        if ( data['CONF_CLAVE'] == 'PRE_MIN') this.precioMinimo = Number(data['CONF_VALOR'])/100;
        if ( data['CONF_CLAVE'] == 'PRE_MAX') this.precioMaximo = Number(data['CONF_VALOR'])/100;
      });

    }, error => {
      this.mostrarAlerta = true;
      this.tipoAlerta = 'danger';
      if (error['error']['error'] !== undefined) {
        if (error['error']['error'] === 'error_deBD') {
          this.mensaje = 'No se pudo realizar la comunicación interna para aceptar la solicitud. Por favor, intente de nuevo';
        }
      } else {
        this.mensaje = 'Hubo un error al intentar aceptar la solicitud. Por favor, intente de nuevo';
      }
      this.cerrarAlerta();
    });
  }

  //OBTENER UBCIACION
  obtenerUbicacion() { // Inicializar el mapa con la geocalización.

    if (navigator.geolocation) { // Verifica si el usuario permitió la geocalización.
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.origin = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
        } ,
        () => {
        this.mostrarAlerta = true;
        this.tipoAlerta = 'danger';
        this.mensaje = ' Advertencia: El servicio de geocalización no se puede realizar, debido que bloqueó la ubicación.  ';
        this.cerrarAlerta();
      }  );

    } else {
      this.mostrarAlerta = true;
      this.tipoAlerta = 'danger';
      this.mensaje = ' Error: El navegador no soporta la geocalización.  ';
      this.cerrarAlerta();
    }
  }

  cerrarAlerta(){
    setTimeout(() => {
      if(this.selfClosingAlert) {
        this.selfClosingAlert.close();
      }
      }, 300);
  }
  pruebaNot(){
    this.notificacionesService.insertarNotificacion('holaaaa1');
  }

  cerrarAlertaNotification(): void {
    // Acción al cerrar la alerta
    console.log('La alerta fue cerrada.');
  }
}
