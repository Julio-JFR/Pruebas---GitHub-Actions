import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ServiciosService } from '../../servicios/servicios.service';
import { SolicitudesService } from '../solicitudes.service';
import { SignalService } from '../signal.service';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { FormGroup, FormBuilder,  Validators } from '@angular/forms';
import {ConfiguracionesService} from '../../configuraciones/configuraciones.service';
import { environment } from 'src/environments/environment';
import { DeviceDetectorService } from 'ngx-device-detector';
import { NotificacionesService } from '../../notificaciones/notificaciones.service';
import { takeUntil } from 'rxjs/operators';
import { Subject, zip } from 'rxjs';
declare var google;
import { Router, Data, ActivatedRoute } from '@angular/router';
import { ServiceWorkerService } from 'src/app/shared/services/service-worker.service';
import { StorageService } from 'src/app/helpers/storage.service';

@Component({
  selector: 'app-solicitudes-especialista',
  templateUrl: './solicitudes-especialista.component.html',
  styleUrls: ['./solicitudes-especialista.component.scss']
})
export class SolicitudesEspecialistaComponent implements OnInit,OnDestroy {

  SOLICITUDES = []; // Sirve para obtener los datos de las solicitudes
  SOLICITUDES_REMOTAS = [];
  TIEMPO_REAL = [];
  SERVICIOS = [];
  ESPECIALISTA_CALIFICACION :number;


  // FILTROS
  filtroServiciosSeleccionados = [];
  filtroFechaInicio = "";
  filtroFechaFin = "";
  filtroPrecioInicio = "";
  filtroPrecioFin = "";
  ordenPor = "";
  todosSeleccionados = true;

  ORDENAR_SELECCION = [
    {"order_code": "", "order_text": "Seleccionar"},
    {"order_code": "FECH_ASC", "order_text": "Fecha (ascendente)"},
    {"order_code": "FECH_DES", "order_text": "Fecha (descendente)"},
    {"order_code": "PREC_ASC", "order_text": "Menor precio"},
    {"order_code": "PREC_DES", "order_text": "Mayor precio"},
  ]

  /***** MODALES CON VIEWCHILD  ***/
  @ViewChild('modalCroquis') elementModalCroquis: ElementRef;
  @ViewChild('modalFiltro') elementModalFiltro: ElementRef;
  @ViewChild('modalImagenes') elementModalImagenes: ElementRef;
  @ViewChild('modalModificarPrecio') elementModalModificarPrecio: ElementRef;

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
  isBloqueoGeolocalización = false;
  solicitud: any;

  formattedaddress = ' ';
  options = {
    componentRestrictions: {
      country: ['PE'] // solo mostrará lugares del Perú.
    }
  };

  // Pagination
  currentPage = 1;
  itemsPerPage = 6;

  cargando: boolean;
  mostrarAlerta = false;
  mostrarAlertaGoogle = false; // es para mostrar la alerta del estado que nos arroja google maps.
  tipoAlerta: string;
  mensaje: string;

  eliminar_filtro = false;
  SOL_ID: number;
  SOLICITUDES_IMAGENES:any [] = [];


  cargaDeDato: boolean;
  mensajeModal: string = '';
  mostrarMensajeModal: boolean = false;

  nuevoPrecioSolicitud: number = null;
  precioBaseSolicitud:number;
  solicitudObject = null;
  CONFIGURACIONES: any = [];
  precioMinimo : string = null;
  precioMaximo: string = null;
  contador:number = 0;
  claveConfiguracion:number;
  claveComisiones = 0;

  DOMINIO = environment.domain_url;
  cantidadSol = 1;
  cantidadRem = 1;

  public precioForm: FormGroup;
  marcadores = [];
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  
  isDesktopDevice:boolean;
  IS_CONFIRMACION: boolean = false;
  intervalSol;
  dominio = environment.domain_url;
  bFiltrado:boolean=false;
  private _config: Subject<any> = new Subject<any>();

  constructor(
    private signalService: SignalService,
    private solicitudService: SolicitudesService,
    private formBuilder: FormBuilder ,
    private configuracionService: ConfiguracionesService,
    private servicioService: ServiciosService,
    private deviceService: DeviceDetectorService,
    public modal: NgbModal,
    private routeActive: ActivatedRoute,
    private notificacionesService:NotificacionesService,
    private serviceWorkerService:ServiceWorkerService,
    private storageService: StorageService) {
      this.obtenerConfiguraciones();
    }

  ngOnInit(): void {
    // this.signalService.localStorage$.subscribe((value: string) => {
    //   console.log('aquii value',value);
    // });
    if (localStorage.getItem('USE_SERV_ACTIVO') == '1')
      this.intervalSol.unsubscribe();
    this.isDesktopDevice = this.deviceService.isDesktop();
    this.inicializarForm();
    this.solicitudService.updateHeaders();
    this.servicioService.updateHeaders();

    //validar si es movil
    if(this.storageService.getString('MOVIL') === '1'){// 1 movil , 0 web

      const latitud = localStorage.getItem('LATITUD');
      const longitud = localStorage.getItem('LONGITUD');

      if (latitud && longitud) {
        // console.log(`[---MOVIL---] Ubicación recibida: LAT ${latitud}, LONG ${longitud}`);
        this.origin = {
          lat: latitud,
          lng: longitud
        };
        this.obtenerSolicitudesZip(); 
      } 
      else {
        this.cargando = false;
        this.isBloqueoGeolocalización = true;
        this.mostrarAlerta = true;
        this.tipoAlerta = 'warning';
        this.mensaje = ' Advertencia: El servicio de geolocalización no se puede realizar, debido que bloqueo la ubicación.  ';
        this.cerrarAlerta();
      }
    }else{
      this.obtenerSolicitudesUbicacion();
    }
    this.getTodosServicios();
    this.checkUncheckAll();
  }

  ngOnDestroy() {
    if (this.intervalSol) {
      clearInterval(this.intervalSol);
    }
  }

  obtenerSolicitudesUbicacion():void{
    this.obtenerUbicacion().then(() => {
      this.obtenerSolicitudesZip();
    }).catch(() => {
      this.cargando = false;
      this.mostrarAlerta = true;
      this.tipoAlerta = 'danger';
      this.mensaje = ' Error: Ocurrió un problema al intentar obtener la ubicación.';
      this.cerrarAlerta();
    });
  }

  obtenerSolicitudesZip(){
    this.SOLICITUDES = [];
    this.cargando = true;
    this.modal.dismissAll();
    console.log('this.origin',this.origin);
    const observables =zip(
      this.solicitudService.getSolicitudesRemotasDeEspecialista(localStorage.getItem('USE_ID'),"", (this.bFiltrado ? this.filtroFechaInicio : ""), (this.bFiltrado ? this.filtroFechaFin : ""), (this.bFiltrado ? this.filtroPrecioInicio : ""), (this.bFiltrado ?this.filtroPrecioFin : ""), this.ordenPor),
    this.solicitudService.getSolicitudesDeEspecialista(localStorage.getItem('USE_ID'), this.origin.lat, this.origin.lng, "",  (this.bFiltrado ? this.filtroFechaInicio : ""), (this.bFiltrado ? this.filtroFechaFin : ""), (this.bFiltrado ? this.filtroPrecioInicio : ""), (this.bFiltrado ? this.filtroPrecioFin : ""), this.ordenPor));
    observables.subscribe(resp => {
      let horaActual = new Date();
      resp[0]["resultado"].map(data =>{
         data['tipoSol']=1
         data['NUEVO_PRECIO'] = null;
        if ( horaActual<=this.retornarFecha(data)) {
          this.SOLICITUDES.push(data);
        }
      });
      resp[1]["resultado"].map(data =>{ 
        data['tipoSol']=2;
        data['NUEVO_PRECIO'] = null;
        if ( horaActual<=this.retornarFecha(data)) {
          this.SOLICITUDES.push(data);
        }
      });
      this.cargando = false;
      this.ordenarSolicitudes(resp);
      this.setCollapsed(this.SOLICITUDES);
      // this.intervalSol = setInterval(() => {
      // this.obtenerSolicitudesUbicacion();
      // }, 10000); //tiempo para que se recargue la lista de solicitudes
    });
  }

  listarSolicitudesInterval(){
    let horaActual = new Date();
    zip(
      this.solicitudService.getSolicitudesRemotasDeEspecialista(localStorage.getItem('USE_ID'),"", (this.bFiltrado ? this.filtroFechaInicio : ""), (this.bFiltrado ? this.filtroFechaFin : ""), (this.bFiltrado ? this.filtroPrecioInicio : ""), (this.bFiltrado ?this.filtroPrecioFin : ""), this.ordenPor),
      this.solicitudService.getSolicitudesDeEspecialista(localStorage.getItem('USE_ID'), this.origin.lat, this.origin.lng, "",  (this.bFiltrado ? this.filtroFechaInicio : ""), (this.bFiltrado ? this.filtroFechaFin : ""), (this.bFiltrado ? this.filtroPrecioInicio : ""), (this.bFiltrado ? this.filtroPrecioFin : ""), this.ordenPor)).subscribe(resp => {
      
      resp[0]["resultado"].map(data => data['tipoSol']=1);
      resp[1]["resultado"].map(data => data['tipoSol']=2);

      resp[0]["resultado"].map(data =>{
        data['tipoSol']=1
        data['NUEVO_PRECIO'] = null;
      });
      resp[1]["resultado"].map(data =>{ 
        data['tipoSol']=2;
        data['NUEVO_PRECIO'] = null;
      });


      let solicitudes = [...resp[0].resultado,...resp[1].resultado];
      if(solicitudes.length==0 || (this.filtroServiciosSeleccionados.length==0 && this.bFiltrado)){
        this.SOLICITUDES = [];
        return;
      }

      if(this.bFiltrado)
        this.SOLICITUDES =solicitudes;

      solicitudes.forEach(data => {
        if ( horaActual<=this.retornarFecha(data)) {
          if (this.SOLICITUDES.filter(sol=> sol.SOL_ID ==data.SOL_ID).length<=0) {
            this.SOLICITUDES.push(data)
          }
        }
      });

      if(this.filtroServiciosSeleccionados.length>0){
        this.SOLICITUDES = this.SOLICITUDES.filter(sol => this.filtroServiciosSeleccionados.find(serv=> serv == sol.SER_ID));
      }
      
      this.ordenarSolicitudes(this.SOLICITUDES);
    });
  }

  filtrarServicios(){

  }
  
  ordenarSolicitudes(resp){
    this.SOLICITUDES = this.ordenerSolcitudes(this.SOLICITUDES);
    this.SOLICITUDES.map(dat => {
      let precio = dat['NUEVO_PRECIO'] ?Number(dat['NUEVO_PRECIO'])  : Number(dat.SER_PRECIO_BASE) ;
      dat['comisiones'] = precio * (this.claveComisiones/100);
      dat['montoRecibir'] = precio - dat['comisiones'];
    });
    this.configuracionSolRem(resp[0]);
    this.configuracionSolPresencial(resp[1]);
  }

  configuracionSolPresencial(resp){
   if (resp) {
    if (resp.error) {
      this.cargando = false;
      this.mostrarAlerta = true;
      this.tipoAlerta = 'danger';
      if (resp.error['error']['error'] !== undefined) {
        if (resp.error['error']['error'] === 'error_noExistenciaDeIdSol') {
          this.mensaje = 'Ocurrió un problema al obtener las solicitudes. Por favor, vuelva a iniciar sesión e inténtelo de nuevo';
          this.obtenerSolicitudesZip();
        }
        else if (resp.error['error']['error'] === 'error_deCampo') {
          this.mensaje = 'Los valores de los parámetros enviados para obtener las solicitudes disponibles deben respetar los formatos permitidos. Por favor, intente de nuevo.';
        } 
        else if (resp.error['error']['error'] === 'error_deBD') {
          this.mensaje = 'No se pudo realizar la comunicación interna para obtener las solicitudes. Por favor, intente de nuevo.';
        }
      } else {
        this.mensaje = 'Hubo un error al intentar obtener la solicitud. Por favor, intente de nuevo';
      }
      this.cerrarAlerta();
    }
   }
  }

  configuracionSolRem(resp){
   if (resp) {
    if (resp.error) {
      this.cargando = false;
      this.mostrarAlerta = true;
      this.tipoAlerta = 'danger';
      if (resp.error['error']['error'] !== undefined) {
        if (resp.error['error']['error'] === 'error_noExistenciaDeIdSol') {
          this.mensaje = 'Ocurrió un problema al obtener las solicitudes remotas. Por favor, vuelva a iniciar sesión e inténtelo de nuevo';
          this.obtenerSolicitudesZip();
        }
        else if (resp.error['error']['error'] === 'error_deCampo') {
          this.mensaje = 'Los valores de los parámetros enviados para obtener las solicitudes remotas disponibles deben respetar los formatos permitidos. Por favor, intente de nuevo.';
        } 
        else if (resp.error['error']['error'] === 'error_deBD') {
          this.mensaje = 'No se pudo realizar la comunicación interna para obtener las solicitudes. Por favor, intente de nuevo.';
        }
      } else {
        this.mensaje = 'Hubo un error al intentar obtener la solicitud. Por favor, intente de nuevo';
      }
      this.cerrarAlerta();
    }
   }
  }

  ordenerSolcitudes(array){
    array.sort(function(a, b) {
      const arrayFechaA = a.FECHA.split('-');
      const arrayHorasA = (a.HORA.slice(0,a.HORA.length-3)).split(':');
      const timeA = a.HORA.slice(a.HORA.length-3,a.HORA.length).trim();
      const arrayFechaB = b.FECHA.split('-');
      const arrayHorasB = (b.HORA.slice(0,b.HORA.length-3)).split(':');
      const timeB = b.HORA.slice(b.HORA.length-3,b.HORA.length).trim();

      let fechaTotalA =new Date(Number(arrayFechaA[0]),(Number(arrayFechaA[1])-1),Number(arrayFechaA[2]), arrayHorasA[0],arrayHorasA[1],arrayHorasA[2]);
      let fechaTotalB =new Date(Number(arrayFechaB[0]),(Number(arrayFechaB[1])-1),Number(arrayFechaB[2]), arrayHorasB[0],arrayHorasB[1],arrayHorasB[2]);
      if (timeA=='PM')
        fechaTotalA.setHours(fechaTotalA.getHours()+12);
      if (timeB=='PM')
        fechaTotalB.setHours(fechaTotalB.getHours()+12);
      if (fechaTotalA > fechaTotalB) {
        return 1;
      }
      if (fechaTotalA < fechaTotalB) {
        return -1;
      }
      return 0;
    });
    return array;
  }

  obtenerConfiguraciones(){
    this.configuracionService.configuraciones$
    .pipe(takeUntil(this._config))
    .subscribe((configuraciones: any) => {
      this.claveConfiguracion = Number(configuraciones.filter(data => data['CONF_CLAVE'] =='LIM_INI_SERE')[0]['CONF_VALOR']);
      this.CONFIGURACIONES = configuraciones;
      configuraciones.forEach(data =>{
        if (data['CONF_CLAVE'] =='COM_CULQI'  || data['CONF_CLAVE'] =='COM_BANK'  || data['CONF_CLAVE'] =='COM_MO' || data['CONF_CLAVE'] =='COM_IMP') {
          this.claveComisiones += Number(data['CONF_VALOR']);
        }
      });
    })
  }

  inicializarForm() {
    this.precioForm = this.formBuilder.group({
      precio: [null, [ Validators.required, Validators.pattern('[0-9]*(\.?)[0-9]+')]] 
    });
  }


  getTodosServicios() {    
    this.routeActive.data.subscribe((data:Data)=>{
      if (data['servicios']) {
       this.SERVICIOS = data['servicios'][1]["Resultado"];
        this.setCheckList();
     }
    });
  }

  obtenerUbicacion = () => { // Inicializar el mapa con la geocalización.
    this.cargando = true;
    // this.storageService.getString('MOVIL') === '1' // 1 movil , 0 web
    
    const ubicacionPromise = new Promise((resolve, reject) => {
      if (navigator.geolocation) { // Verifica si el usuario permitió la geocalización.
        navigator.geolocation.getCurrentPosition(
          (position) => {
            this.origin = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            // console.log('origin',this.origin);
            this.cargando = false;
            resolve(this.origin);
        } ,
        () => {
          this.cargando = false;
          this.isBloqueoGeolocalización = true;
          this.mostrarAlerta = true;
          this.tipoAlerta = 'warning';
          this.mensaje = ' Advertencia: El servicio de geolocalización no se puede realizar, debido que bloqueó la ubicación.  ';
          this.cerrarAlerta();
        }  );
  
      }
      else {
        this.cargando = false;
        this.isBloqueoGeolocalización = true;
        this.mostrarAlerta = true;
        this.tipoAlerta = 'danger';
        this.mensaje = ' Error: El navegador no soporta la geolocalización.  ';
        this.cerrarAlerta();
      }
    });
    return ubicacionPromise;
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

    google.maps.event.addListenerOnce(this.map, 'idle', (e) => {
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

  marcador(coordenadas, mapa){
    
    const map = mapa;
    const marcador = new google.maps.Marker({
      position: coordenadas,
      map,
    });
    
    this.marcadores.push(marcador); // Almacenamos los marcadores que se generarán. 
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

    if (this.isBloqueoGeolocalización === false ) {

      if(!trabajoConfirmado.IS_CONFIRMACION){
        this.mostrarAlertaGoogle = false;
        this.cliente = trabajoConfirmado;
        this.destinoCliente = {lat : Number(this.cliente.UBI_LATITUD) , lng : Number(this.cliente.UBI_LONGITUD)};
        this.modal.open(this.elementModalCroquis, {size: 'lg'});
        this.cargarMapa();
      }
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
        this.directionsRenderer.setDirections(response); // Dibujamos la ruta desde el punto A hacia el punto B.
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

  closeModal(): any {
    this.modal.dismissAll();
  }

  confirmarUbicacionEspecialista(){
    this.cliente.IS_CONFIRMACION = true;
    this.modal.dismissAll();
  }

  verificarTipoDeDispositivo(solicitud,idSolicitud, correoCliente, SER_PRECIO_BASE){
    if(this.isDesktopDevice === true){
      if(solicitud.IS_CONFIRMACION===true){
        this.aceptarSolicitud(solicitud, correoCliente, SER_PRECIO_BASE);
      }else{
        this.mostrarAlertaGoogle = true;
        this.tipoAlerta = 'warning';
        this.mensaje = 'Por favor, confirme su ubicación para continuar. ';
        this.cliente = solicitud;
        this.destinoCliente = {lat : Number(solicitud.UBI_LATITUD) , lng : Number(solicitud.UBI_LONGITUD)};
        this.modal.open(this.elementModalCroquis, {size: 'lg'});
        this.cargarMapa();        
        this.cerrarAlerta();
      }
    }else{
      this.aceptarSolicitud(solicitud, correoCliente, SER_PRECIO_BASE);
    }
  }

  
  retornarFecha(dat){
    let tiempo = dat.HORA.slice(dat.HORA.length-2,dat.HORA.length);
    const arrayFecha = dat.FECHA.split('-');
    const arrayHoras = (dat.HORA.slice(0,dat.HORA.length-3)).split(':');
    let fecha = new Date(Number(arrayFecha[0]),(Number(arrayFecha[1])-1),Number(arrayFecha[2]), tiempo == 'PM' ? (12+Number(arrayHoras[0])) : arrayHoras[0],arrayHoras[1],arrayHoras[2]);
    fecha.setMinutes(fecha.getMinutes()-Number(this.CONFIGURACIONES.filter(cof =>cof.CONF_CLAVE == 'TIME_ACEPT_SOL')[0].CONF_VALOR));
    return fecha;
  }


  aceptarSolicitud(solicitud, correoCliente, SER_PRECIO_BASE) {
    console.log('solicitud',solicitud);
    console.log('correoCliente',correoCliente);
    let horaActual = new Date();
    if ( horaActual<=this.retornarFecha(solicitud)) {
      this.cargando = true;
      let precio;
      (solicitud.NUEVO_PRECIO== null)? precio = solicitud.SER_PRECIO_BASE:precio = solicitud.NUEVO_PRECIO;
     zip( this.serviceWorkerService.sendNotification(solicitud.USU_ID,Number(this.storageService.getString('USE_ID')),solicitud.SER_NOMBRES,this.storageService.getString('USE_NAMES')),this.solicitudService.aceptarSolicitudEspecialista(solicitud.SOL_ID, correoCliente,solicitud.SER_PRECIO_BASE, precio)).subscribe(
        data => {
          console.log(data[0]);
          if (data[1].exito) 
            this.notificacionesService.insertarNotificacion(true);

          this.modal.dismissAll();
          this.cargando = false;
          this.mostrarAlerta = true;
          if(data[1]['error'] === 'error_deEmailNoEnviado') {
            this.tipoAlerta = 'warning';
            this.mensaje = 'Solicitud aceptada, pero ocurrió un error al enviar el correo. En breve se intentará volver a enviarlo.';
          }
          else {
            this.tipoAlerta = 'success';
            this.mensaje = 'Solicitud aceptada correctamente.';
          }
          this.obtenerSolicitudesZip();
          this.cerrarAlerta();
    
        }, error  => {
          this.cargando = false;
          this.mostrarAlerta = true;
          this.tipoAlerta = 'danger';
          if (error['error']['error'] !== undefined) {
            if (error['error']['error'] === 'error_solIdNoDisponible') {
              this.mensaje = 'La solicitud ya no se encuentra disponible.';
              this.obtenerSolicitudesZip();
            }
            else if (error['error']['error'] === 'error_cruce') {
              this.mensaje = 'No se puede aceptar la solicitud porque produce un cruce en el horario con una previamente aceptada';
            }
            else if (error['error']['error'] === 'error_solExp') {
              this.mensaje = 'No se puede aceptar la solicitud debido a que ya ha expirado';
              this.obtenerSolicitudesZip();
            }
            else if (error['error']['error'] === 'error_solYaAcept') {
              this.mensaje = 'No se puede aceptar la solicitud debido a que esta ya ha sido aceptada por otro especialista';
              this.obtenerSolicitudesZip();
            }
            else if (error['error']['error'] === 'error_noExistenciaDeEmail' || error['error']['error'] === 'error_deEmailValido') {
              this.mensaje = 'No se pudo aceptar la solicitud debido a que el cliente cambió su correo electrónico. Por favor, intente de nuevo';
            }
            else if (error['error']['error'] === 'error_deCampo') {
              this.mensaje = 'Los valores de los parámetros enviados deben respetar los formatos permitidos. Por favor, intente de nuevo';
            } 
            else if (error['error']['error'] === 'error_deBD') {
              this.mensaje = 'No se pudo realizar la comunicación interna para aceptar la solicitud. Por favor, intente de nuevo';
            }
            else if (error['error']['error'] === 'error_solicitudInvalida') {
              this.tipoAlerta = 'warning';
              this.mensaje = 'La solicitud ya no se encuentra disponible';
              this.obtenerSolicitudesZip();
            }else
            this.mensaje = 'Hubo un error al intentar aceptar la solicitud. Por favor, intente de nuevo';
          } else {
            this.mensaje = 'Hubo un error al intentar aceptar la solicitud. Por favor, intente de nuevo';
          }
          this.cerrarAlerta();
        }
      );
    } else {      
      clearInterval(this.intervalSol);
      this.mostrarAlerta = true;
      this.tipoAlerta = 'warning';
      this.mensaje = 'La solicitud no está dentro de la hora permitida, intente otra solicitud';
      this.obtenerSolicitudesZip();
      this.cerrarAlerta();
    }

   
  }

  setCollapsed(array) {
    for (let index = 0; index < array.length; index++) {
      array[index]['IS_COLLAPSED'] = true;
      if(this.isDesktopDevice){
        array[index]['IS_CONFIRMACION'] = false;
      }
    }
  }

  addRemoveServicio(event) {
    this.todosSeleccionados = this.SERVICIOS.every(objeto => objeto['isSelected'] === true);
  }

  setCheckList() {
    // for (var i = 0; i < this.SERVICIOS.length; i++) {
    //   this.SERVICIOS[i].isSelected = true;
    // }
  }

  getCheckedServicios() {
    this.filtroServiciosSeleccionados = this.SERVICIOS.filter(dat => dat.isSelected==true).map(serv => serv.SER_ID);
    this.bFiltrado = true;
    this.modal.dismissAll();
  }

  verificarFiltros() {
    if((Number(this.filtroPrecioInicio) > 0 && Number(this.filtroPrecioFin) > 0) && this.filtroPrecioInicio > this.filtroPrecioFin) {
      this.filtroPrecioFin = "";
    }
    if(Number(this.filtroPrecioFin) <= 0 && !this.eliminar_filtro) {
      this.filtroPrecioFin = "";
    }
    if(Number(this.filtroPrecioInicio) <= 0 && !this.eliminar_filtro) {
      this.filtroPrecioInicio = "";
    }
    this.eliminar_filtro = false;
  }

  eliminarFiltros() {
    this.filtroServiciosSeleccionados = [];
    this.filtroFechaInicio = "";
    this.filtroFechaFin = "";
    this.filtroPrecioInicio = "";
    this.filtroPrecioFin = "";
    this.ordenPor = "";
    this.setCheckList();
    this.bFiltrado = false;
    this.todosSeleccionados = true;
    this.checkUncheckAll();
    this.modal.dismissAll();
  }

  obtenerPrecioMinimo(precio, conf_valor) {
    this.precioMinimo = parseFloat(((precio * conf_valor) / 100).toString()).toFixed(2);
  }

  obtenerPrecioMaximo(precio, conf_valor) {
    this.precioMaximo = parseFloat(((precio * conf_valor) / 100).toString()).toFixed(2);
  }

  resetearFormulario(precio){
    this.precioForm.get('precio').setValue(precio);
  }
 
  abrirModalModificarPrecio(solicitud){
    this.solicitudObject = solicitud;
    this.precioBaseSolicitud = solicitud.SER_PRECIO_BASE;
    (solicitud.NUEVO_PRECIO===null)?this.resetearFormulario(this.precioBaseSolicitud):this.resetearFormulario(solicitud.NUEVO_PRECIO);
    this.obtenerPrecioMinimo(this.precioBaseSolicitud , this.obtenerConfiguracion("PRE_MIN"));
    this.obtenerPrecioMaximo(this.precioBaseSolicitud , this.obtenerConfiguracion("PRE_MAX"));
    if(this.mostrarMensajeModal) this.mostrarMensajeModal = false;
    this.modal.open(this.elementModalModificarPrecio);
  }

  obtenerConfiguracion(key:string):number{
    let CONF_VALOR: number = null;
    this.CONFIGURACIONES.forEach(element=> {
      if(element.CONF_CLAVE == key){
        CONF_VALOR = Number(element.CONF_VALOR);
      }
    });
    return CONF_VALOR;
  }

  esPrecioValido():boolean{
    let precio = this.precioForm.get('precio').value;

    let precioBase = parseInt(precio);
    let precioMax = parseInt(this.precioMaximo);
    let precioMin = parseInt(this.precioMinimo);
    
    if( isNaN(precioBase) ){
      this.mostrarMensajeModal = true;
      this.tipoAlerta = 'danger';
      this.mensajeModal = 'El campo solo acepta números.';
      this.cerrarAlerta();
      return false;
    } else{
      if( (precioBase < precioMin ) || (precioBase > precioMax) ){
        this.mostrarMensajeModal = true;
        this.tipoAlerta = 'danger';
        this.mensajeModal = 'El número ingresado debe cumplir con el precio mínimo y máximo.';
        this.cerrarAlerta();
        return false;
      }
    }
    return true;
  }

  preguntarPorRecargarPagina(): any{
    window.addEventListener("beforeunload", (event) => {
      event.preventDefault();
      event.returnValue = "Unsaved modifications";
      return event;})
  }


  modificarPrecioDeLaSolicitud(){
    if(this.esPrecioValido()){
      this.solicitudObject['NUEVO_PRECIO'] = (parseFloat(this.precioForm.get('precio').value)).toFixed(2);
      this.nuevoPrecioSolicitud = this.precioForm.get('precio').value;
      this.solicitudObject['comisiones'] = Number(this.solicitudObject.NUEVO_PRECIO) * (this.claveComisiones/100);
      this.solicitudObject['montoRecibir'] = Number(this.solicitudObject.NUEVO_PRECIO) - this.solicitudObject['comisiones'];
      this.closeModal();
      this.preguntarPorRecargarPagina();
    }
  }

  definirPrecioCard(solicitud): Number | string{

console.log(solicitud);    let precioAMostrar;
    (solicitud.NUEVO_PRECIO===null) ? precioAMostrar=solicitud.SER_PRECIO_BASE : precioAMostrar = solicitud.NUEVO_PRECIO;
    return Number(precioAMostrar).toFixed(2);
  }

  aumentarPrecioBase(){
    let precio = null;
    precio = (parseFloat(this.precioForm.get('precio').value) + 1).toFixed(2);
    let precioBase = parseInt(precio);
    let precioMax = parseInt(this.precioMaximo);
 
    if(precioBase === precioMax){
      this.precioForm.get('precio').setValue(this.precioMaximo );
    } else{
      if( precioBase <= precioMax ){
        this.precioForm.get('precio').setValue(precio);
      }
    }

  }

  disminuirPrecioBase(){
    let precio = null;
    precio = (parseFloat(this.precioForm.get('precio').value) - 1).toFixed(2);

    let precioBase = parseInt(precio);
    let precioMin = parseInt(this.precioMinimo);

    if(precioBase === precioMin){
      this.precioForm.get('precio').setValue(this.precioMinimo );
    } else{
      if( precioBase >= precioMin ){
        this.precioForm.get('precio').setValue(precio);
      }
    }
  }

  abrirModalImagenes(sol_id: number){
    this.SOL_ID = sol_id;
    this.cargaDeDato = true;
    this.SOLICITUDES_IMAGENES.length = 0;
    this.modal.open(this.elementModalImagenes, {size: 'lg'});
    this.obtenerImagenes();
  }

  obtenerImagenes(){
    this.SOLICITUDES_IMAGENES = [];
    this.solicitudService.getObtenerImagenes(this.SOL_ID).subscribe( data => {
      this.cargaDeDato = false;
      data.resultado.map(data => {
        this.SOLICITUDES_IMAGENES.push(environment.domain_url+data);
      })
    }, error => {
      this.cargaDeDato = false;
      this.tipoAlerta = 'danger';
      this.mostrarMensajeModal = true;

      if (error['error']['error'] !== undefined) {
        if (error['error']['error'] === 'error_BD') {
          this.mensajeModal = 'No se pudo realizar la comunicación interna .Por favor, intente de nuevo.';
        } else if (error['error']['error'] === 'error_deCampo') {
          this.mensajeModal = 'Los valores de los parámetros enviados deben respetar los formatos permitidos. Por favor, intente de nuevo.';
        } else if (error['error']['error'] === 'error_noExistenciaDeImgPorSol') {
          this.mensajeModal = 'La solicitud solicitada no posee imágenes.';
        } else if (error['error']['error'] === 'error_noExistenciaDeIdSol') {
          this.mensajeModal = 'No existe la solicitud solicitada. Por favor, intente con otra solicitud.';
        }
      } else {
        this.mensajeModal = 'Hubo un error al intentar rescatar los datos. Por favor, intente de nuevo ';
      }
      this.cerrarAlerta();
    });
  }

  get precio() {
    return this.precioForm.get('precio');
  }

  prueba(event){
   if (this.itemsPerPage>9) {
     this.currentPage=1;
   }
  }

  checkUncheckAll(){
    this.SERVICIOS.map(serv => serv.isSelected = this.todosSeleccionados)
  }

  cerrarAlerta(){
    setTimeout(() => {
      this.mostrarAlerta=false;
      this.mostrarMensajeModal=false;
      this.mostrarAlertaGoogle=false;
      this.mensaje="";
    }, 5000);
  }
  
}
