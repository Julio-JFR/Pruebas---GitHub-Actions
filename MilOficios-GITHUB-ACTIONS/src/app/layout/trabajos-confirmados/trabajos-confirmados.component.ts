import {  Component ,   OnDestroy, OnInit, ViewChild, ElementRef  } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {TrabajosConfirmadosService} from './trabajos-confirmados.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { timer} from 'rxjs';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import {StorageService} from '../../helpers/storage.service';
import { DeviceDetectorService } from 'ngx-device-detector';


declare var google;

@Component({
  selector: 'app-trabajos-confirmados',
  templateUrl: './trabajos-confirmados.component.html',
  styleUrls: ['./trabajos-confirmados.component.scss']
})
export class TrabajosConfirmadosComponent implements OnInit , OnDestroy {

  LISTADETRABAJOSCONFIRMADOS = [ ]; // Sirve para obtener los datos de los trabajos confirmados

  /***** MODALES CON VIEWCHILD  ***/
  @ViewChild('modalCroquis') elementModalCroquis: ElementRef;
  @ViewChild('modalEliminar') elementModalEliminar: ElementRef;



  source = timer(0, 1000);
  time = timer (0, 1000);
  origin: any;
  destination: any;
  destinoCliente: any;
  map: any;
  mapEle: HTMLElement; // referencia al identificador del template.
  directionsService = new google.maps.DirectionsService(); // retorna la ruta optima
  directionsRenderer = new google.maps.DirectionsRenderer(); // renderiza la ruta optima
  market: any; // marcador para el mapa.
  infowindow: any; // instanciamos la ventana propia de google maps.
  cliente: any; // sirve para localizar al cliente en el mapa.
  trabajoConfirmado: any;
  isBloqueoGeocalización = false;

  cargaDeDato = false;
  mostrarAlerta = false;
  invalido = false;
  mostrarAlertaError = false;
  tipoAlerta: string;
  mensaje: string;
  mostrarAlertaGoogle = false; // es para mostrar la alerta del estado que nos arroja google maps.


  idRelojRegresivo: any;
  esTiempoAgotado = false;


  cargando = true;
  collap = false;

  formattedaddress = ' ';
  options = {
    componentRestrictions: {
      country: ['PE'] // solo mostrará lugares del Perú.
    }
  };

  marcadores = [];

  isDesktopDevice:boolean;
  IS_CONFIRMACION: boolean = false;
  esRemoto: boolean;
  cargando_servicio_remoto: boolean;

  constructor(
    private trabajoConfirmadoService: TrabajosConfirmadosService,
    public modal: NgbModal,
    private router: Router,
    private route: ActivatedRoute,
    private deviceService: DeviceDetectorService,
    public storage: StorageService) {
      this.obtenerUbicacion();

    }

  ngOnInit(): void {
    let fecha1 = new Date('2023-06-04 21:45:01').getTime();
    let fecha2 = new Date('2023-06-04 21:44:33').getTime();
    let seconds = fecha1 - fecha2;
    this.isDesktopDevice = this.deviceService.isDesktop();
    this.trabajoConfirmadoService.updateHeaders();
    this.obtenerTrabajosConfirmados();
    this.idRelojRegresivo = this.source.subscribe( result =>
      this.LISTADETRABAJOSCONFIRMADOS.forEach(
        (value) => this.reducirSegundo(value) // Por cada iteración, obtenemos el objeto de trabajos confirmados.
      )
    );

  }


  definirEvento(trabajoConfirmado){
    console.log(trabajoConfirmado); 
    if (trabajoConfirmado.SERE_ESTADO === 1 && trabajoConfirmado.HORAE > 23) {
      this.mostrarAlerta = true;
      this.tipoAlerta = 'warning';
      this.mensaje = 'El trabajo aun no está disponible';
      this.cerrarAlerta();
      return;
    }
    console.log('trabajoConfirmado.SERE_ESTADO',trabajoConfirmado.SERE_ESTADO)
    if(trabajoConfirmado.SERE_ESTADO == 1 && trabajoConfirmado.HORAE <= 23){
      if(trabajoConfirmado.UBI_DIRECCION== 'Servicio remoto'){
        this.cargando_servicio_remoto = true;
        this.obtenerURL(trabajoConfirmado.SERE_ID, trabajoConfirmado.USU_ID);
        this.obtenerObjetoTrabajoConfirmado(trabajoConfirmado);
        this.goToRealizarServicio('/realizarServicio/'+trabajoConfirmado.SERE_ID+'/'+ trabajoConfirmado.USU_ID);
      }else{
        trabajoConfirmado.IS_CONFIRMACION = false;
        this.verificarTipoDeDispositivo(trabajoConfirmado);
      }
    }
  }

  abrirModalUbicacion(event,trabajoConfirmado):void{
    event.stopPropagation();  // Detiene la propagación del evento al div
    if(trabajoConfirmado.UBI_DIRECCION== 'Servicio remoto'){
      this.cargando_servicio_remoto = true;
      this.obtenerURL(trabajoConfirmado.SERE_ID, trabajoConfirmado.USU_ID);
      this.obtenerObjetoTrabajoConfirmado(trabajoConfirmado);
      this.goToRealizarServicio('/realizarServicio/'+trabajoConfirmado.SERE_ID+'/'+ trabajoConfirmado.USU_ID);
    }else
      this.abrirModalCroquis(trabajoConfirmado);
  }

  ngOnDestroy() {
    this.idRelojRegresivo.unsubscribe(); // Nos desuscribimos con el id que obtenemos de la suscripción.
  }

  obtenerTrabajosConfirmados() {
    this.trabajoConfirmadoService.getTrabajosConfirmados(localStorage.getItem('USE_ID')).subscribe( data => {
      // tslint:disable-next-line:quotemark
      this.LISTADETRABAJOSCONFIRMADOS = data ["Resultado"];
      this.setCollapsed();
      this.cargando = false;
    }, error => {
      this.cargando = false;
      this.mostrarAlerta = true;
      this.tipoAlerta = 'danger';
      this.mensaje = 'Hubo un error al intentar obtener los trabajos confirmados. Por favor, intente de nuevo';
      this.cerrarAlerta();
    });
  }

  reducirSegundo(trabajadoConfirmado) { // Método para el reloj regresivo.

    if (trabajadoConfirmado.HORANEGATIVO.toString().substr(0, 1)  === '-' || trabajadoConfirmado.IS_STYLE === true  ) {
      trabajadoConfirmado.IS_STYLE = true;
      this.storage.storeString("SEG", "6"); 
      trabajadoConfirmado.MENSAJETIEMPOADICIONAL = ' ¡Apresúrate!. ';
      if (trabajadoConfirmado.SEGUNDOSE < 59) {
        trabajadoConfirmado.SEGUNDOSE = trabajadoConfirmado.SEGUNDOSE + 1;
      } else {
        trabajadoConfirmado.SEGUNDOSE = 0;
        if ( trabajadoConfirmado.MINUTOSE < 59 ) {
          trabajadoConfirmado.MINUTOSE = trabajadoConfirmado.MINUTOSE + 1;
          if ( trabajadoConfirmado.HORAE === 0 && trabajadoConfirmado.MINUTOSE >= Number(trabajadoConfirmado.TIEMPOADICIONAL ) ) {
            trabajadoConfirmado.TIEMPOAGOTADO = true;
          }
        } else {
          trabajadoConfirmado.MINUTOSE = 0;
        }
      }
    } else {
      if (trabajadoConfirmado.HORAE <= 23 ) {
        trabajadoConfirmado.TIEMPOAGOTADO = false;
        if (trabajadoConfirmado.SEGUNDOSE === 0) {
          if ( trabajadoConfirmado.MINUTOSE === 0) {
            if (trabajadoConfirmado.HORAE > 0) {
              trabajadoConfirmado.HORAE --;
              trabajadoConfirmado.MINUTOSE = 59;
              trabajadoConfirmado.SEGUNDOSE = 59;
            } else {
              trabajadoConfirmado.HORAE = 0;
              trabajadoConfirmado.MINUTOSE = 0;
              trabajadoConfirmado.SEGUNDOSE = 0;
              trabajadoConfirmado.IS_STYLE = true;
            }
          }
          else {
            trabajadoConfirmado.MINUTOSE --;
            trabajadoConfirmado.SEGUNDOSE = 59;
          }
        }
        // tslint:disable-next-line:one-line
        else {
          trabajadoConfirmado.SEGUNDOSE--;
        }
      }
      
    }

  }

  obtenerUbicacion() { // Inicializar el mapa con la geocalización.
    if(this.storage.getString('MOVIL') === '1'){
      const latitud = localStorage.getItem('LATITUD');
      const longitud = localStorage.getItem('LONGITUD');

      if (latitud && longitud) {
        console.log(`[---MOVIL---] Ubicación recibida: LAT ${latitud}, LONG ${longitud}`);
        this.origin = {
          lat: latitud,
          lng: longitud
        };
        //this.obtenerSolicitudesZip(); 
      } else {
        //this.cargando = false;
        this.isBloqueoGeocalización = true;
        this.mostrarAlerta = true;
        this.tipoAlerta = 'warning';
        this.mensaje = ' Advertencia: El servicio de geolocalización no se puede realizar, debido que bloqueo la ubicación.  ';
        //this.cerrarAlerta();
      }
    }
    else{
      if (navigator.geolocation) { // Verifica si el usuario permitió la geocalización.
        navigator.geolocation.getCurrentPosition(
          (position) => {
            this.origin = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
        } ,
        () => {
          this.isBloqueoGeocalización = true;
          this.mostrarAlerta = true;
          this.tipoAlerta = 'warning';
          this.mensaje = ' Advertencia: El servicio de geolocalización no se puede realizar, debido que bloqueó la ubicación.  ';
          this.cerrarAlerta();
        }  );
  
      } else {
        this.isBloqueoGeocalización = true;
        this.mostrarAlerta = true;
        this.tipoAlerta = 'danger';
        this.mensaje = ' Error: El navegador no soporta la geolocalización.  ';
        this.cerrarAlerta();
      }
    }
  }

  public handleAddressChange (address: Address) { // Método que obtendrá la dirección del lugar seleccionado en el mapa.
    this.origin.lat = Number(address.geometry.location.lat());
    this.origin.lng = Number(address.geometry.location.lng());
    this.cargarMapa();
  }

  cargarMapa() {
    this.mapEle  = document.getElementById('map'); // Obtenemos la referencia del html, mediante el id del div.

    this.map = new google.maps.Map(this.mapEle, { // se crea el mapa con sus punto de origen.
      center: new google.maps.LatLng(this.origin.lat, this.origin.lng)  ,
      zoom: 15
    });

    
    this.directionsRenderer.setMap(this.map); // Escribimos sobre el mapa

    google.maps.event.addListenerOnce(this.map, 'idle', () => {
      this.calculateRoute(); // se calcula la ruta entre el especialista y el cliente.
    });

    this.map.addListener('click', (e)=>{
      this.eliminarMarcadores();
      this.origin = {
        lat: e.latLng.lat() ,
        lng:e.latLng.lng()
      };
      this.calculateRoute();
    } );

  }

  setMap(ref){
    for (let i = 0; i < this.marcadores.length; i++) {
      this.marcadores[i].setMap(ref); 
    }
  }

  eliminarMarcadores(){
    this.setMap(null); 
    this.marcadores = []; // reseteamos el array de marcadores
  }

  abrirModalCroquis(trabajoConfirmado) {
    if (this.isBloqueoGeocalización === false ) {
      this.mostrarAlertaGoogle = false;
      this.cliente = trabajoConfirmado;
      if(trabajoConfirmado.UBI_DIRECCION==="Servicio remoto"){
        this.esRemoto = true;
      }
      this.destinoCliente = {lat : Number(this.cliente.UBI_LATITUD) , lng : Number(this.cliente.UBI_LONGITUD)};
      this.modal.open(this.elementModalCroquis, {size: 'lg'});
      this.cargarMapa();
    } else {
      this.mostrarAlerta = true;
      this.tipoAlerta = 'danger';
      this.mensaje = ' Debido a que bloqueó el acceso a su ubicación, no puede utilizar la función de " ¿Cómo llegar? " ' +
                     ' . Permita acceder a su ubicación, para utilizar la función. ';
      this.cerrarAlerta();

    }
  }

  calculateRoute() {
    this.directionsService.route({
      origin: this.origin,
      destination: this.destinoCliente ,
      travelMode: google.maps.TravelMode.WALKING, // Modo de trazado(caminando, en taxi, ...)
    }, (response, status)  => {
      if (status === 'OK') {
        if(response['routes'][0].overview_path.length == 1){
          this.mostrarAlertaGoogle = true;
          this.tipoAlerta = 'warning';
          this.mensaje = 'La ubicación coincide con la del cliente, por lo cuál no se mostrará una ruta.';
        }
        this.directionsRenderer.setDirections(response); // Dibujamos la ruta desde el punto A hacia el punto B.
        this.cerrarAlerta();
      } else {
        this.tipoAlerta = 'danger';
        this.mostrarAlertaGoogle = true;
        switch (status) { // En caso de haber un error, se mostrará diferentes estado obtenidos de Google Maps.
          case 'ZERO_RESULTS':
            this.mensaje = 'No se pudo encontrar ninguna ruta entre el origen y el destino.';
            break;
          case 'UNKNOWN_ERROR':
            this.mensaje = 'No se pudo procesar una solicitud de indicaciones debido a un error del servidor.';
            break;
          case 'OVER_QUERY_LIMIT':
            this.mensaje = '	La página web superó el límite de solicitudes en un período de tiempo demasiado corto.';
            break;
          case 'NOT_FOUND':
            this.mensaje = '	No se pudo geocodificar al menos uno de los puntos de origen o destino.';
            break;
          case 'REQUEST_DENIED':
            this.mensaje = 'Acceso denegado';
            break;
        }
        this.cerrarAlerta();
      }
    });
  }

  setPosicionGpsPuntoA(e) {  // OBTENGO LA POSICIÓN DEL ESPECIALISTA.
    this.origin = {lat : e.coords.lat , lng : e.coords.lng};
    this.cargarMapa(); // Nuevamente se llama al método cargarMapa().
  }

  confirmarUbicacionEspecialista(){
    this.cliente.IS_CONFIRMACION = true;
    this.modal.dismissAll();
    if(this.isDesktopDevice === true && this.cliente.IS_CONFIRMACION===true) this.verificarTipoDeDispositivo(this.cliente);
  }

  verificarTipoDeDispositivo(trabajoConfirmado){
    if(this.isDesktopDevice === true){
      if(trabajoConfirmado.IS_CONFIRMACION===true){
        this.cargando= true;
        this.obtenerURL(trabajoConfirmado.SERE_ID, trabajoConfirmado.USU_ID);
        this.obtenerObjetoTrabajoConfirmado(trabajoConfirmado);
        this.goToRealizarServicio('/realizarServicio/'+trabajoConfirmado.SERE_ID+'/'+ trabajoConfirmado.USU_ID);
      }else{
        this.cliente = trabajoConfirmado;
        this.destinoCliente = {lat : Number(this.cliente.UBI_LATITUD) , lng : Number(this.cliente.UBI_LONGITUD)};
        this.modal.open(this.elementModalCroquis, {size: 'lg'});
        this.cargarMapa();
      }
    }else{
      this.cargando= true;
      this.obtenerURL(trabajoConfirmado.SERE_ID, trabajoConfirmado.USU_ID);
      this.obtenerObjetoTrabajoConfirmado(trabajoConfirmado);
      this.goToRealizarServicio('/realizarServicio/'+trabajoConfirmado.SERE_ID+'/'+ trabajoConfirmado.USU_ID);
    }
  }

  closeModal(): any {
    this.modal.dismissAll();
  }

  abrirModalCancelar(trabajoConfirmado) {
    this.trabajoConfirmado = trabajoConfirmado;
    this.modal.open(this.elementModalEliminar);
  }

  setCollapsed() {
    for (let index = 0; index < this.LISTADETRABAJOSCONFIRMADOS.length; index++) {
      this.LISTADETRABAJOSCONFIRMADOS[index]['IS_COLLAPSED'] = false;
      this.LISTADETRABAJOSCONFIRMADOS[index]['IS_STYLE'] = false;
      if(this.isDesktopDevice){
        this.LISTADETRABAJOSCONFIRMADOS[index]['IS_CONFIRMACION'] = false;
      }
    }
  }

  cancelarServicio() {
    this.cargaDeDato = true;
    this.invalido = true;
   
    this.trabajoConfirmadoService.cancelarServicioRealizadoPorEspecialista(this.trabajoConfirmado.SERE_ID, this.trabajoConfirmado.ESP_ID, this.trabajoConfirmado.SOL_ID,
      this.trabajoConfirmado.USU_EMAIL).subscribe(
      data => {
        this.modal.dismissAll();
        this.cargaDeDato = false;
        this.mostrarAlerta = true;
        this.tipoAlerta = 'success';
        this.mensaje = 'Se ha cancelado el trabajo correctamente.';
        this.obtenerTrabajosConfirmados();
        this.invalido = false;
        this.cerrarAlerta();
      }, error  => {
        this.cargaDeDato = false;
        this.mostrarAlertaError = true;
        this.tipoAlerta = 'danger';
        this.invalido = false;
        if (error['error']['error'] !== undefined) {
          if (error['error']['error'] === 'error_BD') {
            this.mensaje = 'No se pudo realizar la comunicación interna .Por favor, intente de nuevo.';
          } else if (error['error']['error'] === 'error_deCampo') {
            this.mensaje = 'Los valores de los parámetros enviados deben respetar los formatos permitidos. Por favor, intente de nuevo.';
          }
        } else {
          this.mensaje = 'Hubo un error al intentar cancelar el trabajo. Por favor, intente de nuevo ';
        }
        this.cerrarAlerta();
      }
    );
  }

  obtenerURL(SERE_ID, USU_ID) {
    this.storage.storeString('USE_CRO', 'H2aUzWe$nDjVRji1b5Z&8Y^h!FUJ5m!$I');
    this.storage.storeString('servRealizadoID', SERE_ID);
    this.storage.storeString('usuarioID', USU_ID);
  }

  obtenerObjetoTrabajoConfirmado(trabajoConfirmado){
    this.trabajoConfirmadoService.recibirTrabajoConfirmado(trabajoConfirmado);
  }

  goToRealizarServicio(url){
    this.cargando = false;
    // this.router.navigate([url]);
    this.router.navigate([`../${url}`], { relativeTo: this.route });

  }
  cerrarAlerta(){
    setTimeout(() => {
      this.mostrarAlerta=false;
      this.mostrarAlertaError=false;
      this.mensaje="";
    }, 5000);
  }
  
}
