import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, ViewEncapsulation  } from '@angular/core';
import { NgbModal, NgbModalConfig, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ServicioRealizadoService } from '../../servicios/servicios-realizados/servicio-realizado.service'; // TEMPORAL
import { SolicitudImagenService } from '../../solicitudes-imagenes/solicitud-imagen.service';
import { StorageService } from '../../../helpers/storage.service';
import { FormBuilder, Validators } from '@angular/forms';
import { ClienteService } from '../cliente.service';
import { BonificacionService } from '../../bonificaciones/bonificacion.service';
import { EspecialistasService } from '../../especialistas/especialistas.service';
import { SolicitudesService } from '../../solicitudes/solicitudes.service';
import { TipoTarjetaService } from '../../tipo-tarjeta/tipo-tarjeta.service';
import { TarjetaService } from '../../tarjetas/tarjeta.service';
import { TipoTarjeta } from '../../tipo-tarjeta/tipo-tarjeta';
import { Tarjeta } from '../../tarjetas/tarjeta.model';
import { CulqiServiceService } from '../../culqi/culqi-service.service';
import { Router } from '@angular/router';
import {NgbAlert} from '@ng-bootstrap/ng-bootstrap';
import {NavbarService} from '../../../shared/navbar/navbar.service';
import { DatePipe } from '@angular/common';
import { environment } from 'src/environments/environment';
import { ConfiguracionesService } from '../../configuraciones/configuraciones.service';
import * as moment from 'moment'
import 'moment/locale/es';
import { ServiceWorkerService } from 'src/app/shared/services/service-worker.service';
moment.locale('es');

@Component({
  selector: 'app-cliente-mis-solicitudes',
  templateUrl: './cliente-mis-solicitudes.component.html',
  styleUrls: ['./cliente-mis-solicitudes.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ClienteMisSolicitudesComponent implements OnInit,AfterViewInit {

  active = 1 ; // controla navs generales
  activeSolicitudes = 1 ; // controla navs modal solicitudes
  activeServicios = 1 ; // controla navs modal servicios

  isCheckSolicitud = false;

  /********************************** Variables para elegir los bonos ***********************/
  BONOS: any[];
  BONOSBD : any[] = [];
  BONOS_DISPONIBLES: any[];
  id_bonos_seleccionados = [];// son los id de los bonos que ya se eligieron para pagar
  bonosElegidos: {id:number, saldo: number}[];
  montoServicio = 0;
  saldoBonosUtilizados = 0;

  // Paginacion para los bonos
  currentPage = 1;
  itemsPerPage = 10;
  claveComisiones = 0;
  claveConfiguracion = 0;


  //Alerta de notificaciones
  mostrarAlertaNotification = false;
  tipoAlertaNotification = "";
  mensajeNotification = "";

  constructor(public modal: NgbModal, private storageService: StorageService,
    private formBuilder: FormBuilder,
    private servicioRealizadoService: ServicioRealizadoService,
    private solicitudImagenService: SolicitudImagenService,
    private clienteServicio: ClienteService,
    private solicitudService: SolicitudesService,
    private especialistaService: EspecialistasService,
    private tarjetaService: TarjetaService,
    private culqiService: CulqiServiceService,
    private bonificacionService: BonificacionService,
    private tipoTarjeta: TipoTarjetaService,
    private datePipe: DatePipe,
    private navbarService :NavbarService,
    private router: Router,
    private configuracionesService:ConfiguracionesService,
    configModal: NgbModalConfig,
    private serviceWorker:ServiceWorkerService
    ) {
      configModal.backdrop = 'static';
      configModal.keyboard = false;
    }
  usu_name: string; // nombre del usuario
  idCancelar: any;
  activeSliderId: string;
  carga: boolean; // controla la barra de 
  cargaModal: boolean; // controla la carga de los modales al ser seleccionados
  cargandoImagen: boolean = false; // controla la carga de los modales al ser seleccionados
  haySolicitudes = true; // verifica si hay solicitudes
  hayServiciosProgramados = true ; // verifica si hay servicios programdos
  hayServiciosRealizados = true; // verifica si hay servicios realizados
  haySolicitudesCanceladas = true;
  hayServiciosCancelados = true ;

  @ViewChild('selfClosingAlert', {static: false}) selfClosingAlert: NgbAlert; 
  // referencia al las artetas que se cierran solas despues de 30 segundos.    
  exitoCacelar: boolean;
  @ViewChild('masDetallesSolicitudes') masDetallesSolicitudes: ElementRef;
  // referencia al modal de solicitudes donde se muestra más informacion de la solicitud seleccionada
  @ViewChild('masDetallesServicios') masDetallesServicios: ElementRef;

  @ViewChild('confirmacionCancelacion') confirmacionCancelacion: ElementRef;
  // referencia al modal de rechazo a la solicitud asignada al especialista X
  @ViewChild('rechazoEspec') rechazoEspec: ElementRef;

  // referencia al modal del mensaje fugaz de pago exitoso
  @ViewChild('modalAvisoFugaz') modalAvisoFugaz: ElementRef;

  page = 1 ;
  pageSize = 6;
  isCollapsed = true; // para que inicialmente esté collapsado
  simboloMonedaPeruana: string;
  anioSeleccionado: number;
  anios: number[] = [];
  duracionServicio:string;
  
  mostrarAlerta = false;
  tipoAlerta: string;
  mensaje: string;

  solicitudesCliente: any[] = []; // acá van las solicitudes del cliente que no son servicios
  solicitudSeleccionada: any; // Solicitud de la cual se mostrará mas informacion en el modal al seleccionar un card de solicitud

  serviciosCliente: any[] = []; // acá van los servicios del cliente
  serviciosClienteProg: any[] = [];
  serviciosClienteReal: any[] = [];
  solicitudCancelada: any[] = [];
  solicitudes: any[] = [];
  servicioCancelado: any[] = [];
  servicioSeleccionado: any; // Solicitud que se encuentra en
  // la tabla de servicios realizados la cual se mostrará más informacion en el modal al seleccionar un card de servicio realizado
  serviciosRealizados: any[] = []; // temporal
  servicioRealizadoModal: any; // es el servicio realizado aceptado por el especialista que se mostrará en el modal
  imagenesSolicitud: any = '';

  /******************Variable para los progressbar y alertas para aceptar o rechazar el servicio con el especialista***************/
  loadingAceRech: boolean;
  errorAceRech: boolean;
  mensajeAceRech: string;
  mensajeModalSerPro: string; // es el mensaje que saldrá en la alerta del modal de los servicios programados
  tipoAlertaSerPro: string; // tipo de alerta que saldrá dependiendo si fue exitoso o no

  /**************** Variables para el modal donde se ve los servicios y los botones para aceptar o rechazarlo *******************/
  errorModalDetalleSer: boolean;
  mensajeModalDetalleSer: string;
  loadingModalDetalleSer: boolean;

  /**************** Variables para el modal de confirmación para rechazar el servicio *******************/
  loadingModalConfirRe: boolean;
  errorModalConfirRe: boolean;
  mensajeModalConfirRe: string;

  /**************** Variables para el modal del resumen *******************/
  tarjetaForm: any;
  tarjetas: Tarjeta[];
  tarjetaModal;
  tarjetaSeleccionada: Tarjeta;
  tiposTarjetas: TipoTarjeta [];
  idTarjetaSeleccionada: number = null;
  guardarTarjeta = false;
  isCheckGuardarTarjeta = false; // el checkbox "guardar tarjeta" estará en false por defecto
  anuncioModalTar: boolean;
  tipoAnuncioTar: string;
  mensajeAnuncio: string;

  /************** Variables para el modal del pago(tarjeta) ***************/
  anuncioModalPago: boolean;
  tipoAlertaModalPago: string;
  loadingModalPago: boolean;
  mensajeModalPago: string;
  contsPro=0;
  /************** Variables para el modal de aviso al rechazar o aceptar el servicio ***************/
  mensajeModalAviso: string;

  /************** Variables para el modal de aviso al rechazar o aceptar el servicio ***************/
  mensajeModalFugaz: string;

  TIPOS_TARJETAS = [
    {'id': 1, 'nombre': 'Visa'},
    {'id': 2, 'nombre': 'MasterCard'},
    {'id': 3, 'nombre': 'Amex'},
    {'id': 4, 'nombre': 'Diners'}
  ];

  MESES = [
    {'valor': '01', 'mes': 'Enero'},
    {'valor': '02', 'mes': 'Febrero'},
    {'valor': '03', 'mes': 'Marzo'},
    {'valor': '04', 'mes': 'Abril'},
    {'valor': '05', 'mes': 'Mayo'},
    {'valor': '06', 'mes': 'Junio'},
    {'valor': '07', 'mes': 'Julio'},
    {'valor': '08', 'mes': 'Agosto'},
    {'valor': '09', 'mes': 'Septiembre'},
    {'valor': '10', 'mes': 'Octubre'},
    {'valor': '11', 'mes': 'Noviembre'},
    {'valor': '12', 'mes': 'Diciembre'}
  ];

  DOMINIO = environment.domain_url;
  precioMinimo = 0;
  precioMaximo = 0;
  loading=false;
  
  ngOnInit(): void {
    this.obtenerConfiguraciones();
    this.usu_name = this.storageService.getString('USE_NAMES');
    this.carga = true;
    this.clienteServicio.updateHeaders();
    this.listarSolicitudesPorCliente();
    this.listarServiciosPorCliente();
    this.inicializarTarjetaForm();
    this.generarAnios();
    this.navbarService.disparadorNavbar.subscribe(resp => {
      this.active = resp['data']; 
    })
    this.estaRedireccionado();
    if (sessionStorage.getItem('validacionSuccess')) {
      this.mostrarAlerta = true;
      this.tipoAlerta='success';
      this.mensaje='En los próximos minutos  un especialista estará aceptando tu solicitud y te indicará el precio del servicio. Para ver el estado de su solicitud ir a *Servicios programados* y confirmar.';
      this.cerrarAlerta();
      sessionStorage.clear();
    }


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

  ngAfterViewInit() {
    // ...
    this.prueba();
  }
  // Esta función genera los años desde el actual hasta 5 años mayores
  generarAnios() {
    const currentYear = parseInt(moment(new Date()).format('YYYY'));

    for (let i = 0; i < 5; i++) {
      this.anios[i] = currentYear + i;
    }
    this.tar_anio_expiracion.setValue(this.anios[0]);
  }

  /********* Esta función es para iniciar el formulario de la tarjeta*********/
  inicializarTarjetaForm() {
    const emailFormat = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

    this.tarjetaForm = this.formBuilder.group({
      tar_nombre_titular: ['', [Validators.required, Validators.pattern('^[a-zñáéíóú A-ZÑÁÉÍÓÚ]+$'), Validators.maxLength(100)]],
      tar_numero: ['', [Validators.required, Validators.pattern('[0-9]+'), Validators.minLength(13), Validators.maxLength(16)]],
      tar_cvv: ['', [Validators.required, Validators.pattern('[0-9]+'), Validators.minLength(3), Validators.maxLength(4)]],
      tar_mes_expiracion: [null, [Validators.required, Validators.maxLength(2)]],
      tar_anio_expiracion: [null, [Validators.required, Validators.pattern('[0-9]+'), Validators.minLength(4), Validators.maxLength(4)]]
    });

  }

  estaRedireccionado(){
    this.navbarService.obtenerBanderaAlerta().subscribe(x =>{
      if(x===0){
        this.active = 3;
        this.navbarService.enviarBanderaAlerta(2);
      }
      else{
        this.active = 1 ;
      }
  },error =>{

  });
  }

  listarSolicitudesPorCliente() {
    this.clienteServicio.listarSolicitudesPorCliente(parseInt(this.storageService.getString('USE_ID'))).
    subscribe(data => {
      let contS = 0  ;
      let contC = 0 ;
      this.solicitudesCliente = data['resultado'];
      if (this.solicitudesCliente.length < 1 ) {
        this.haySolicitudes = false;
        this.haySolicitudesCanceladas = false;
      } else {
        this.solicitudesCliente.forEach(element => {
          if (element.SOL_ESTADO === 3) {
            contC++;
            this.solicitudCancelada.push(element);
          }else{
            let aux = new Date(element['SOL_FECHA_SERVICIO']);
            let fechaActual = new Date();
            if (aux < fechaActual) {
              if (element['SOL_ESTADO'] == 0 || element['SOL_ESTADO'] == 5 || element['SOL_ESTADO'] == 4) {
                element['SOL_ESTADO'] = 4;
                element['sol']= true;
                contS++;
                this.solicitudes.push(element);
              } else {
                if (element['SOL_ESTADO'] == 2 || element['SOL_ESTADO'] == 1) {
                  this.contsPro++;
                  this.serviciosClienteReal.push(element);
                }
              }
            }else{
              contS++;
              this.solicitudes.push(element);
            }
            
          }
        });
        if (contS === 0 ) {
          this.haySolicitudes = false;
        }
        if (contC  === 0 ) {
          this.haySolicitudesCanceladas = false;
        }
        if (this.contsPro  === 0 ) {
          this.hayServiciosProgramados = false;
        }
       
      }
      this.loading=true;
      }, error => {
         this.carga = false;
      this.mostrarAlerta = true;
      this.tipoAlerta = 'danger';
      this.mensaje = 'Hubo un error al intentar listar las solicitudes. Por favor, intente de nuevo';
    }
    );
  }

  listarServiciosPorCliente() {
    this.servicioRealizadoService.listarServiciosRealizadosPorCliente(parseInt(this.storageService.getString('USE_ID'))).
    subscribe(data => {
      this.hayServiciosProgramados = true;
      let contSR = 0;
      let constCan = 0;
        this.serviciosCliente = data['resultado'];
        if (this.serviciosCliente.length < 1 ) {
          this.hayServiciosProgramados = false;
          this.hayServiciosRealizados = false;
          this.hayServiciosCancelados = false;
          this.carga = false;

        } else {
          this.serviciosCliente.forEach(element => {
              if (element.SERE_ESTADO === 5 || element.SERE_ESTADO === 6) {
                contSR ++  ;
                this.serviciosClienteProg.push(element);
              } else {
                if (element.SERE_ESTADO === 3 || element.SERE_ESTADO === 7 || element.SERE_ESTADO == 8 || element['SERE_ESTADO'] === 2) {
                  constCan++;
                  this.servicioCancelado.push(element);
                } else {
                  let aux = new Date(element['SOL_FECHA_SERVICIO']);
                  let fechaActual = new Date();
                  // fechaActual.setMinutes(fechaActual.getMinutes() + this.claveConfiguracion);
                  if (aux < fechaActual) {
                    if (element['SERE_ESTADO'] === 0 || element['SERE_ESTADO'] === 4){
                      this.contsPro ++;
                      element['SERE_ESTADO'] = 4;
                      this.serviciosClienteReal.push(element);
                    }else{
                      this.contsPro ++;
                      this.serviciosClienteReal.push(element);
                    }
                  }else{
                    this.contsPro ++;
                    this.serviciosClienteReal.push(element);
                  }
                }
              }
          });
          if (contSR === 0 ) {
            this.hayServiciosRealizados = false;
          }
          if (this.contsPro  === 0 ) {
            this.hayServiciosProgramados = false;
          }
          if (constCan  === 0 ) {
            this.hayServiciosCancelados = false;
          }
          this.carga = false;

        }
      }, error => {
        this.carga = false;
        this.mostrarAlerta = true;
        this.tipoAlerta = 'danger';
        this.mensaje = 'Hubo un error al intentar listar las solicitudes. Por favor, intente de nuevo';
      }
    );
  }

  /************************* Funcion para listar las imagenes de la solicitud ****************************/
  listarImagenesPorSolicitud(SOL_ID) {
    this.solicitudImagenService.listarImagenesPorSolicitud(SOL_ID)
    .subscribe(data => {
      this.cargaModal = false;
      this.imagenesSolicitud = data['resultado'];
    },
    error => {
      this.cargaModal = false;
      this.mostrarAlerta = true;
      this.tipoAlerta = 'danger';
      this.mensaje = 'Hubo un error al intentar listar las imágenes. Por favor, intente de nuevo';
    });
  }
  /******************************* calificar el servicio  *********************************/
  calificarServicio(selectedService) {
    this.modal.dismissAll();
    this.goToCalificarServicio(selectedService);
    // '/calificar-servicio/' + selectedService.SERE_ID + '/' + selectedService.ESP_ID
  }
    /******************************* redireccion a calificar el servicio  *********************************/
  goToCalificarServicio(selectedService) {
    console.log(selectedService.SERE_ID)
    this.router.navigate(['mis-solicitudes/calificar-servicio/', selectedService.SERE_ID]);
  }

  /************************* Función que me actualizará el estado del SERVICIO_REALIZADO y de la SOLICITUD  al momento de aceptar o rechazar al especialista****************************/
  actualizarServicio(OPCION, modalAviso) {
    if (OPCION === false) {
      this.loadingModalConfirRe = true;
      this.errorModalConfirRe = false;
    } else {
      this.loadingModalPago = true;
      this.anuncioModalPago = false;
    }
    this.servicioRealizadoService.actualizar(this.servicioSeleccionado.SERE_ID, OPCION, this.servicioSeleccionado.USU_EMAIL, this.idTarjetaSeleccionada)
    .subscribe(data => {
      this.idTarjetaSeleccionada = 0;
      // this.mostrarAlerta = true;
      // this.tipoAlerta = 'success'; // la alerta será de éxito
      // this.mensajeModalAviso = `Se ha ${OPCION ? 'aceptado' : 'rechazado'} el servicio con éxito.`;
      // los loading no los pongo en una condición, porque seria un gasto innecesario de recursos
      this.loadingModalConfirRe = false; // es la carga cuando se le rechaza el servicio
      this.loadingModalPago = false; // es la carga cuando se le acepta al servicio;
      this.idTarjetaSeleccionada = null;
      this.modal.dismissAll();
      this.open(modalAviso);
      this.serviciosClienteReal = [];
      this.servicioCancelado = [];
      this.serviciosClienteProg = [];
      this.habilitarCamposTarjeta();
      this.listarServiciosPorCliente();
      this.listarSolicitudesPorCliente();
    }, error => {
      if (OPCION) {// errores para el modal de pago
        this.loadingModalPago = false;
        this.anuncioModalPago = true;
        this.tipoAlertaModalPago = 'danger';
      } else {// errores para el modal de servicio
        this.loadingModalConfirRe = false;
        this.errorModalConfirRe = true;
      }
      if (error['error']['error'] !== undefined) {
        if (error['error']['error'] === 'error_deBD') {
          if (OPCION) {
            this.mensajeModalPago = 'Hubo un error al intentar ejecutar su solicitud. Por favor, intente de nuevo.';
          } else {
            this.mensajeModalConfirRe = 'Hubo un error al intentar ejecutar su solicitud. Por favor, intente de nuevo.';
          }
        } else if (error['error']['error'] === 'error_deCampo') {
          if (OPCION) {
            this.mensajeModalPago = 'Los datos ingresados deben respetar los formatos permitidos. Por favor, intente de nuevo.';
          } else {
            this.mensajeModalConfirRe = 'Los datos ingresados deben respetar los formatos permitidos. Por favor, intente de nuevo.';
          }
        } else {
          if (OPCION) {
            this.mensajeModalPago = 'No se pudo ejecutar su solicitud debido a un fallo en el sistema. Por favor, intente más tarde.';
          } else {
            this.mensajeModalConfirRe = 'No se pudo ejecutar su solicitud debido a un fallo en el sistema. Por favor, intente más tarde.'; // debido a la complejidad en los manejos de errores del api, se optó por dar un mensaje general ya que para que ocurra esos errores es demasiado dificil que ocurra desde el front
          }
        }
      } else {
        if (OPCION) {
          this.mensajeModalPago = 'Hubo error de conexión al momento de aceptar el servicio. Por favor, intente de nuevo.';
        } else {
          this.mensajeModalConfirRe = 'Hubo error de conexión al momento de rechazar el servicio. Por favor, intente de nuevo.';
        }
      }
    });
  }

  decidirRechazoServicio(modalAviso){
    if(this.isCheckSolicitud){
      this.rechazarServicio(modalAviso);
    }else{
      this.rechazarServicioSinSolicitud(modalAviso);
    }
  }

  //rechaza el servicio confirmado creando de nuevo la solicitud
  rechazarServicio(modalAviso){
    this.loadingModalConfirRe = true;
    this.errorModalConfirRe = false;
    this.servicioRealizadoService.rechazarServicio(this.servicioSeleccionado.SERE_ID,this.servicioSeleccionado.USU_EMAIL).
    subscribe(data =>{
      this.idTarjetaSeleccionada = 0;
      this.mensajeModalAviso = "Se ha rechazado el servicio con éxito.";
      this.loadingModalConfirRe = false; // es la carga cuando se le rechaza el servicio
      this.idTarjetaSeleccionada = null;
      this.open(modalAviso);
      setTimeout(() => {
        this.modal.dismissAll();
        }, 2000);
      this.serviciosClienteReal = [];
      this.servicioCancelado = [];
      this.serviciosClienteProg = [];
      this.habilitarCamposTarjeta();
      this.listarServiciosPorCliente();
      this.listarSolicitudesPorCliente();
    }, error => {
      this.loadingModalConfirRe = false;
      this.errorModalConfirRe = true;
      if (error['error']['error'] !== undefined) {
        if (error['error']['error'] === 'error_deBD') 
          this.mensajeModalConfirRe = 'Hubo un error al intentar ejecutar su solicitud. Por favor, intente de nuevo.';
        else if (error['error']['error'] === 'error_deCampo')
          this.mensajeModalConfirRe = 'Los datos ingresados deben respetar los formatos permitidos. Por favor, intente de nuevo.';
        else if (error['error']['error'] === "error_noExistenciaDeImgPorSol")
          this.mensajeModalConfirRe = "No se pudo rechazar el servicio debido a que no tiene imagenes existentes. Por favor, intente de nuevo";
        else if (error['error']['error'] === "error_existenciaEmail")
          this.mensajeModalConfirRe = "No se pudo rechazar el servicio debido a no existe el email del especialista. Por favor, intente de nuevo";
        else if (error['error']['error'] === "error_noExistenciaDeId")
          this.mensajeModalConfirRe = "No se encontró el servicio en la base de datos. Por favor, intente de nuevo";
      }else{
        this.mensajeModalConfirRe = 'Hubo error de conexión al momento de rechazar el servicio. Por favor, intente de nuevo.';
      }
    });
  }

  //rechaza el servicio confirmado sin crear una nueva solicitud
  rechazarServicioSinSolicitud(modalAviso){
    this.loadingModalConfirRe = true;
    this.errorModalConfirRe = false;
    this.servicioRealizadoService.rechazarServicioSinSolicitud(this.servicioSeleccionado.SERE_ID,this.servicioSeleccionado.USU_EMAIL).
    subscribe(data =>{
      this.idTarjetaSeleccionada = 0;
      this.mensajeModalAviso = "Se ha rechazado el servicio con éxito.";
      this.loadingModalConfirRe = false; // es la carga cuando se le rechaza el servicio
      this.idTarjetaSeleccionada = null;
      this.open(modalAviso);
      setTimeout(() => {
        this.modal.dismissAll();
        }, 2000);
      this.serviciosClienteReal = [];
      this.servicioCancelado = [];
      this.serviciosClienteProg = [];
      this.habilitarCamposTarjeta();
      this.listarServiciosPorCliente();
      this.listarSolicitudesPorCliente();
    }, error => {
      this.loadingModalConfirRe = false;
      this.errorModalConfirRe = true;
      if (error['error']['error'] !== undefined) {
        if (error['error']['error'] === 'error_deBD') 
          this.mensajeModalConfirRe = 'Hubo un error al intentar ejecutar su solicitud. Por favor, intente de nuevo.';
        else if (error['error']['error'] === 'error_deCampo')
          this.mensajeModalConfirRe = 'Los datos ingresados deben respetar los formatos permitidos. Por favor, intente de nuevo.';
        else if (error['error']['error'] === "error_noExistenciaDeImgPorSol")
          this.mensajeModalConfirRe = "No se pudo rechazar el servicio debido a que no tiene imagenes existentes. Por favor, intente de nuevo";
        else if (error['error']['error'] === "error_existenciaEmail")
          this.mensajeModalConfirRe = "No se pudo rechazar el servicio debido a no existe el email del especialista. Por favor, intente de nuevo";
        else if (error['error']['error'] === "error_noExistenciaDeId")
          this.mensajeModalConfirRe = "No se encontró el servicio en la base de datos. Por favor, intente de nuevo";
      }else{
        this.mensajeModalConfirRe = 'Hubo error de conexión al momento de rechazar el servicio. Por favor, intente de nuevo.';
      }
    });
  }
  
  //funcion que cierra las alertas #selClosingAlert pasado 30 segundos 
  cerrarAlerta(){
    setTimeout(() => {
      this.mostrarAlerta=false;
      this.mensaje="";
    }, 5000);
  }
  
  obtenerTarjetaModal() {
    this.tarjetaSeleccionada = new Tarjeta();
    this.tarjetaSeleccionada.TAR_TITULAR = this.tar_nombre_titular.value;
    this.tarjetaSeleccionada.TAR_NUMERO = this.tar_numero.value;
    this.tarjetaSeleccionada.TAR_CVV = this.tar_cvv.value;
    this.tarjetaSeleccionada.TAR_MES = this.tar_mes_expiracion.value;
    this.tarjetaSeleccionada.TAR_ANIO = this.tar_anio_expiracion.value;
    this.idTarjetaSeleccionada = 0;
  }

  // Esta función envia el id de la tarjeta y el api de mil oficios se encarga de hacer la conexión con los servidores de culqi
  aceptarServicio(modalAviso){
    this.loadingModalPago = true;
    this.anuncioModalPago = false;
    this.servicioRealizadoService.aceptarServicio(this.servicioSeleccionado.SERE_ID,this.servicioSeleccionado.USU_EMAIL,parseInt(this.storageService.getString('USE_ID')),parseFloat(this.servicioSeleccionado.SERE_TARIFA),this.idTarjetaSeleccionada,this.id_bonos_seleccionados)
    .subscribe( data => {
      this.idTarjetaSeleccionada = 0;
     
      this.mostrarAlerta = true;
      this.tipoAlerta = 'success'; // la alerta será de éxito
      this.mensaje = 'Se ha aceptado el servicio con éxito.';
      this.cerrarAlerta();
      this.loadingModalPago = false; // es la carga cuando se le acepta al servicio;
      this.idTarjetaSeleccionada = null;
      this.modal.dismissAll();
      // this.open(modalAviso);
      setTimeout(() => {
        this.modal.dismissAll();
        }, 2000);
      this.serviciosClienteReal = [];
      this.servicioCancelado = [];
      this.serviciosClienteProg = [];
      this.habilitarCamposTarjeta();
      this.listarServiciosPorCliente();
      this.listarSolicitudesPorCliente();
    }, error => {
      this.mensajeModalFugaz = 'El pago no se procesó correctamente';
      // this.open(this.modalAvisoFugaz);
      this.loadingModalPago = false;
      this.anuncioModalPago = true;
      this.tipoAlertaModalPago = 'danger';
      if (error['error']['error'] !== undefined) {
        if (error['error']['error'] === 'error_servicioInvalido') {
          this.mensajeModalPago = 'El servicio ha expirado.';
        }else if (error['error']['error'] === 'error_DeBono') {
          this.mensajeModalPago = 'El saldo de los bonos es menor al precio del servicio.';
        }else if (error['error']['mensajeUser']){
          this.mensajeModalPago = error['error']['mensajeUser'];
        }else{
          this.mensajeModalPago = 'Hubo un error en la conexión al intentar realizar el pago. Por favor, intente de nuevo.';
        }
      } else {
          this.mensajeModalPago = 'Hubo un error en la conexión al intentar realizar el pago. Por favor, intente de nuevo.';
      }
    });
  }
  
  aceptarServicioTarjeta(modalAviso){
    if (this.tarjetaForm.invalid) {
      this.tipoAlertaModalPago = 'warning';
      this.anuncioModalPago = true;
      this.mensajeModalPago = 'Debe ingresar correctamente los datos de la tarjeta en el formulario';
    }else{
      this.obtenerTarjetaModal();
      this.loadingModalPago = true;
      this.anuncioModalPago = false;
      this.deshabilitarCamposTarjeta();
      this.servicioRealizadoService.aceptarServicioTarjeta(this.servicioSeleccionado.SERE_ID,this.servicioSeleccionado.USU_EMAIL,this.storageService.getString("USE_EMAIL"),parseInt(this.storageService.getString('USE_ID')),
      this.servicioSeleccionado.SERE_TARIFA,this.guardarTarjeta,this.tarjetaSeleccionada,this.id_bonos_seleccionados)
      .subscribe( data => {
        if(data.exito){
          this.loadingModalPago = false;
          this.mostrarAlerta = true;
          this.tipoAlerta = 'success'; // la alerta será de éxito
          this.mensaje = 'Se ha aceptado el servicio con éxito.';
          this.cerrarAlerta();
  
          this.loadingModalPago = false; // es la carga cuando se le acepta al servicio;
          this.idTarjetaSeleccionada = null;
          this.modal.dismissAll();
          // this.open(modalAviso);
          setTimeout(() => {
            this.modal.dismissAll();
            }, 2000);
          this.serviciosClienteReal = [];
          this.servicioCancelado = [];
          this.serviciosClienteProg = [];
          this.habilitarCamposTarjeta();
          this.listarServiciosPorCliente();
          this.listarSolicitudesPorCliente();
        }else{
          this.mensajeModalFugaz = 'El pago no se procesó correctamente';
          this.loadingModalPago = false;
          this.anuncioModalPago = true;
          this.tipoAlertaModalPago = 'danger';
          this.mensajeModalPago = data.mensajeUser;
        }
      }, error => {
        this.habilitarCamposTarjeta();
        this.mensajeModalFugaz = 'El pago no se procesó correctamente';
        this.loadingModalPago = false;
        this.anuncioModalPago = true;
        this.tipoAlertaModalPago = 'danger';
        if (error['error']['error'] !== undefined) {
          this.mensajeModalPago = error['error']['mensajeUser'];
        } else {
            this.mensajeModalPago = 'Hubo un error en la conexión al intentar realizar el pago. Por favor, intente de nuevo.';
        }
      });
    }
  }

  aceptarPagoCliente(){

  }


  getBonos(content) {
    this.anuncioModalPago = false;
    this.loadingModalPago = true;
    this.bonificacionService.listarBonos(Number(localStorage.getItem("USE_ID"))).subscribe(
      (BONOS) => {
        this.anuncioModalPago = false;
        this.loadingModalPago = false;
        this.BONOSBD = BONOS['Resultado'];
        this.BONOS = this.BONOSBD;
        this.currentPage = 1;//para que aparezca la primera paginación de la tabla de bonos
        this.verificarValidez();
        this.seleccionarBonosValidos();
        this.openLg(content);
      },
      (error) => {
        this.loadingModalPago = false;
        this.anuncioModalPago = false;
        this.tipoAlertaModalPago = 'danger';

        if (error['error']['error'] !== undefined) {
          if (error['error']['error'] === 'error_noExistenciaDeIdCli') {
            this.mensajeModalPago = 'No se pudo obtener las bonificaciones debido a que el cliente ya no se encuentra registrado. Por favor, intente de nuevo.';
          }
          else if (error['error']['error'] === 'error_deBD') {
            this.mensajeModalPago = 'Hubo un error al intentar ejecutar su solicitud. Por favor, intente de nuevo.';
          }
          else if (error['error']['error'] === 'error_deCampo') {
            this.mensajeModalPago = 'Hubo un error al intentar obtener las bonificaciones. Por favor, intente de nuevo.';
          }
        } 
        else {
            this.mensajeModalPago = 'Hubo un error al intentar obtener las bonificaciones. Por favor, intente de nuevo.';
        }
      }
    );
  }

  seleccionarBonos(bono){
    let bonoActual = JSON.parse(JSON.stringify(bono));
    if(bonoActual['ISCHECK']){
      this.id_bonos_seleccionados.push(parseInt(bonoActual['BON_ID']));
      this.saldoBonosUtilizados += parseFloat(bonoActual['BON_SALDO']);
      this.montoServicio -= parseFloat(bonoActual['BON_SALDO']);
    }else{
      this.id_bonos_seleccionados = this.id_bonos_seleccionados.filter( id => id != parseInt(bonoActual['BON_ID']));
      this.saldoBonosUtilizados -= parseFloat(bonoActual['BON_SALDO']);
      this.montoServicio += parseFloat(bonoActual['BON_SALDO']);
    }
  }

  verificarValidez() {
    for (let index = 0; index < this.BONOS.length; index++) {
      const fechaActual = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
      if (this.BONOS[index]['BON_FECH_FIN'] > fechaActual && this.BONOS[index]['BON_SALDO'] > 0 && this.BONOS[index]['BON_FECH_INI'] <= fechaActual) {
        this.BONOS[index]['IS_VALID'] = true;
        this.BONOS[index]['STATUS'] = 'Activo';
        this.BONOS[index]['ISCHECK'] = (this.BONOS[index]['ISCHECK'])?true:false;
      } else {
        this.BONOS[index]['IS_VALID'] = false;
        this.BONOS[index]['STATUS'] = 'Inactivo';
        this.BONOS[index]['ISCHECK'] = (this.BONOS[index]['ISCHECK'])?true:false;
      }
    }
    this.BONOS_DISPONIBLES = this.BONOS.filter( bono => bono['IS_VALID']).slice();
  }

  seleccionarBonosValidos(){
    for (let index = 0; index < this.BONOS_DISPONIBLES.length; index++) {
      if(this.id_bonos_seleccionados.find(data => data == parseInt(this.BONOS_DISPONIBLES[index]['BON_ID'])) != undefined)//busca dentro del arreglo de id's (this.arreglo) todos los id's existentes rescatados del api (this.BONOS)
        this.BONOS_DISPONIBLES[index]['ISCHECK'] = true;
    }
  }

  // esta función solo rescata el simbolo de la moneda peruana para mostrarlo en el resumen del servicio
  rescatarSimboloMonedaPeruana(content) {
    this.loadingModalDetalleSer = true;
    this.clienteServicio.rescatarSimboloMonedaPeru()
    .subscribe((data) => {
      this.loadingModalDetalleSer = false;
      this.simboloMonedaPeruana = data['Resultado'];
      this.openLg(content);
    }, error => {
      this.loadingModalDetalleSer = false;
      this.anuncioModalTar = true;
      this.tipoAnuncioTar = 'warning';
      if (error['error']['error'] !== undefined) {
        this.mensajeAnuncio = 'No se pudo rescatar el símbolo de la moneda peruana. Intente de nuevo, por favor.';
      } else {
        this.mensajeAnuncio = 'Hubo problemas de conexión al intentar rescatar el símbolo de la moneda peruana. Intente de nuevo, por favor.';
      }
      this.openLg(content);
    });
  }

  // crea el token (verifica su validez) al momento de guardar y pagar una tarjeta
  verificarTarjetaPromise = () => {
    const tarjetaPromise = new Promise((resolve, rejects) => {
      this.tarjetaService.verificacionTarjeta(this.tarjetaSeleccionada).
      subscribe( (data) => {
        resolve(data);
      },
        error => {
          rejects(error);
      });
    });

    return tarjetaPromise;
  }

  habilitarCamposTarjeta() {
    this.tarjetaForm.controls.tar_nombre_titular.enable();
    this.tarjetaForm.controls.tar_numero.enable();
    this.tarjetaForm.controls.tar_cvv.enable();
    this.tarjetaForm.controls.tar_mes_expiracion.enable();
    this.tarjetaForm.controls.tar_anio_expiracion.enable();
  }

  deshabilitarCamposTarjeta() {
    this.tarjetaForm.controls.tar_nombre_titular.disable();
    this.tarjetaForm.controls.tar_numero.disable();
    this.tarjetaForm.controls.tar_cvv.disable();
    this.tarjetaForm.controls.tar_mes_expiracion.disable();
    this.tarjetaForm.controls.tar_anio_expiracion.disable();
  }

  /************* ACTUALIZAR TARJETA, TEMPORALMENTE INHABILITADO*****************/
  /* actualizarTarjeta() {
    this.tarjetaService.actualizarTarjeta(this.tarjetaSeleccionada, Number(this.storageService.getString('USE_ID'))).subscribe(data => {
      this.anuncioModalTar = true;
      this.tipoAnuncioTar = 'success';
      this.mensajeAceRech = 'Se ha actualizado su tarjeta de manera exitosa.';
      this.listarTarjetasPromise()
      .then(good => {
        this.loadingAceRech = false;
      });
    }, error => {
      this.loadingAceRech = false;
      this.anuncioModalTar = true;
      this.tipoAnuncioTar = 'danger';
      if (error['error']['error'] !== undefined) {
        if (error['error']['error'] === 'error_noExistenciaDeIdCli') {
          this.mensajeAceRech = 'El cliente enviado no existe. Por favor, intente con otro.';
        } else if (error['error']['error'] === 'error_deBD') {
          this.mensajeAceRech = 'Hubo un error al intentar ejecutar su solicitud. Por favor, intente de nuevo.';
        } else if (error['error']['error'] === 'error_deCampo') {
          this.mensajeAceRech = 'Los datos ingresados deben respetar los formatos permitidos. Por favor, intente de nuevo.';
        }
      } else  {
        this.mensajeAceRech = 'Hubo un error al intentar obtener los datos de usuario. Por favor, intente de nuevo';
      }
      });
  } */

  eliminarTarjeta(tar_id: number) {
    this.anuncioModalPago = false;
    this.loadingModalPago = true;
    this.tarjetaService.eliminarTarjeta(Number(localStorage.getItem('USE_ID')), tar_id).subscribe( data => {
      this.tipoAlertaModalPago = 'success';
      this.listarTarjetasPromise()
      .then(good => {
        this.loadingModalPago = false;
        this.anuncioModalPago = true;
        this.mensajeModalPago = 'Se ha eliminado la tarjeta de manera exitosa.';
      }).catch(bad => {
        this.loadingModalPago = false;
        this.anuncioModalPago = true;
        this.tipoAlertaModalPago = 'danger';
        if (bad['error']['error'] !== undefined) {
          if (bad['error']['error'] === 'error_deBD') {
            this.mensajeModalPago = 'Hubo un error al intentar ejecutar su solicitud. Por favor, intente de nuevo.';
          } else if (bad['error']['error'] === 'error_deCampo') {
            this.mensajeModalPago = 'Los datos ingresados deben respetar los formatos permitidos. Por favor, intente de nuevo.';
               } else if (bad['error']['error'] === 'error_noExistenciaDeIdCli') {
            this.mensajeModalPago = 'No se puede listar tarjetas de crédito de un cliente no existente.';
               }
        } else {
          this.mensajeModalPago = 'Hubo un error de conexión al momento de mostrar las tarjetas.';
        }
      });
    }, error => {
      this.loadingModalPago = false;
      this.anuncioModalPago = true;
      this.tipoAlertaModalPago = 'danger';
      if (error['error']['error'] !== undefined) {
        if (error['error']['error'] === 'error_noExistenciaDeIdCli') {
          this.mensajeModalPago = 'El cliente enviado no existe. Por favor, intente con otro.';
        } else if (error['error']['error'] === 'error_noExistenciaDeIdTarj') {
          this.mensajeModalPago = 'La tarjeta enviada no existe. Por favor, intente con otro.';
        } else if (error['error']['error'] === 'error_deBD') {
          this.mensajeModalPago = 'Hubo un error al intentar ejecutar su solicitud. Por favor, intente de nuevo.';
        } else if (error['error']['error'] === 'error_deCampo') {
          this.mensajeModalPago = 'Los datos ingresados deben respetar los formatos permitidos. Por favor, intente de nuevo.';
        }
      } else  {
        this.mensajeModalPago = 'Hubo en la conexión al intentar eliminar la tarjeta. Por favor, intente de nuevo';
      }
    });
  }

  // función que determinará el comportamiendo del input de la fecha final de estudio cuando se selecciona el checkbox
  procesoDatosCheckGuardarTarjeta() {
    this.isCheckGuardarTarjeta = !this.isCheckGuardarTarjeta; // se cambia el valor de la variable a su opuesto
    // si el checkbox esta seleccionado se inhabilitado sino se habilita el input de la fecha de fin
    if (this.isCheckGuardarTarjeta) {
      this.guardarTarjeta = true;
    } else {
      this.guardarTarjeta = false;
    }

  }

  resetCheck() {
    this.isCheckGuardarTarjeta = false;
    this.guardarTarjeta = false;
  }

  // actualiza las solicitudes luego de cancelar
  actualizarSolicitudes() {

    this.listarSolicitudesPorCliente();
  }

  listarTarjetasPromise = () => {
    this.anuncioModalPago=false;//para no mostrar inicialmente la alerta del modal que se mostrará al final
    // razón de "this.errorInsertTar = false"dificil de explicar, en el modal de pago hay 2 alertas para 2 peticiones, si las 2 peticiones fallan se mostraran las 2 alertas, pero si la peticion aceptar servicio funciona
    // entonces todos los modales se cierran, y si el insertar tarjeta falla entonces la alerta queda al "aire" debido a que los modales se cerraron, entonces al momento de listar elimino la alerta
    const tarjetaPromise = new Promise((resolve, reject) => {
      this.tarjetaService.listarTarjetas(parseInt(this.storageService.getString('USE_ID')))
      .subscribe(data => {
        if (data['Resultado'].length > 0) {
          this.tarjetas = data['Resultado'];
          this.idTarjetaSeleccionada = this.tarjetas[0].TAR_ID;
        }
        resolve(data);
      }, error => {
        reject(error);
      });
    });
    return tarjetaPromise;
  }

  cancelarSolicitudPromise = () => {
    const cancelarPromise = new Promise((resolve, reject) => {
      this.solicitudService.cancelarSolicitud(this.idCancelar).subscribe(
        data => {
          this.exitoCacelar = data['exito'];
          this.carga = false;
          resolve(this.exitoCacelar);
          this.mostrarAlerta = true;
          this.tipoAlerta = 'success'; // la alerta será de éxito
          this.mensaje = `Se ha cancelado la solicitud con éxito.`;
          this.cerrarAlerta();
        }, error => {
        reject(error);
      }
      );
    });
    return cancelarPromise;
  }

  abrirModalResumen(content) {
    this.errorModalDetalleSer = false;
    this.loadingModalDetalleSer = true;
    this.listarTarjetasPromise()
    .then(good => {
      this.rescatarSimboloMonedaPeruana(content);
    })
    .catch(bad => {
      this.loadingModalDetalleSer = false;
      this.errorModalDetalleSer = true;
      if (bad['error']['error'] !== undefined) {
        if (bad['error']['error'] === 'error_deBD') {
          this.mensajeModalDetalleSer = 'Hubo un error al intentar ejecutar su solicitud. Por favor, intente de nuevo.';
        } else if (bad['error']['error'] === 'error_deCampo') {
          this.mensajeModalDetalleSer = 'Los datos ingresados deben respetar los formatos permitidos. Por favor, intente de nuevo.';
             } else if (bad['error']['error'] === 'error_noExistenciaDeIdCli') {
          this.mensajeModalDetalleSer = 'No se puede listar tarjetas de crédito de un cliente no existente.';
             }
      } else {
        this.mensajeModalDetalleSer = 'Hubo un error de conexión al momento de mostrar las tarjetas.';
      }
    });
  }

  get tar_nombre_titular() {
    return this.tarjetaForm.get('tar_nombre_titular');
  }

  get tar_numero() {
    return this.tarjetaForm.get('tar_numero');
  }

  get tar_cvv() {
    return this.tarjetaForm.get('tar_cvv');
  }

  get tar_mes_expiracion() {
    return this.tarjetaForm.get('tar_mes_expiracion');
  }

  get tar_anio_expiracion() {
    return this.tarjetaForm.get('tar_anio_expiracion');
  }

  /**************************** Función para modales ***************************************/

  masDetallesSol(solicitud) {
    if (this.cargandoImagen) {
      return;
    }
    this.cargandoImagen=true;
    this.clienteServicio.listarSolicitudesImagenes(solicitud.SOL_ID).subscribe({
      next:(value) =>{
        solicitud['imagenes'] = value.resultado;
        this.abrirModalDetalleSol(solicitud);
      },
      error:(err) =>{
        solicitud['imagenes'] = [];
        this.abrirModalDetalleSol(solicitud);
      },
    })
  }
  masDetallesSer(servicio) {
    if (this.cargandoImagen) {
      return;
    }
    this.cargandoImagen=true;
    this.clienteServicio.listarSolicitudesImagenes(servicio.SOL_ID).subscribe({
      next:(value) =>{
        servicio['imagenes'] = value.resultado;
        this.abrirModalDetalleSer(servicio);
      },
      error:(err) =>{
        servicio['imagenes'] = [];
        this.abrirModalDetalleSer(servicio);
      },
    });
  }

  abrirModalDetalleSer(servicio){
    this.cargaModal = true;
    this.servicioSeleccionado = JSON.parse(JSON.stringify(servicio));
    let fin=moment(this.servicioSeleccionado['SERE_FECH_FIN_REAL']);
    let ini=moment(this.servicioSeleccionado['SERE_FECH_INI_REAL']);
    
    let diferencia = fin.subtract(moment.duration(ini.format('hh:mm:ss')));
    let hora = diferencia.format('hh');
    this.duracionServicio = (hora=='12'? '00' : hora) + ' h '+ diferencia.format('mm') + ' m '+ diferencia.format('ss')+ ' s';

    this.listarImagenesPorSolicitud(this.servicioSeleccionado.SOL_ID);
    this.modal.open(this.masDetallesServicios, {size: 'lg'});
    this.cargandoImagen=false;
  }

  abrirModalDetalleSol(solicitud){
    this.cargaModal = true;
    this.solicitudSeleccionada = JSON.parse(JSON.stringify(solicitud));
    this.listarImagenesPorSolicitud(this.solicitudSeleccionada.SOL_ID);
    this.modal.open(this.masDetallesSolicitudes, {size: 'lg'});
    this.cargandoImagen=false;
  }
  
  cancelacion(SOL_ID) {
    this.idCancelar = SOL_ID;
    this.modal.open(this.confirmacionCancelacion, {size: 'sm'});
  }
  
  confirmarCancelacion() {
    this.carga = true;
    this.cancelarSolicitudPromise().then(res => {
      this.solicitudCancelada = [];
      this.solicitudesCliente.length = 0;
      this.solicitudes = [] ;
      this.listarSolicitudesPorCliente();
    }).catch(reject => {
      this.carga = false;
      this.mostrarAlerta = true;
      this.tipoAlerta = 'danger';
      this.mensaje = 'Hubo un error al cancelar la solicitud. Por favor, intente de nuevo';
    });
    this.modal.dismissAll();
  }

  obtenerConfiguraciones(){
    this.configuracionesService.listar().subscribe(data=> {
      this.claveConfiguracion = Number(data['Resultado'].filter(data => data['CONF_CLAVE'] =='LIM_INI_SERE')[0]['CONF_VALOR']);
      data['Resultado'].forEach(data =>{
        if (data['CONF_CLAVE'] =='COM_CULQI'  || data['CONF_CLAVE'] =='COM_BANK'  || data['CONF_CLAVE'] =='COM_MO' || data['CONF_CLAVE'] =='COM_IMP') {
          this.claveComisiones += Number(data['CONF_VALOR']);
        }
        if (data['CONF_CLAVE'] == 'PRE_MIN') {
          this.precioMinimo = Number(data['CONF_VALOR'])/100;
        } else if (data['CONF_CLAVE'] == 'PRE_MAX'){
          this.precioMaximo = Number(data['CONF_VALOR'])/100;
        }
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
    });
  }

  abrirModalRechazoEsp() {
    this.isCheckSolicitud = false;
    this.modal.open(this.rechazoEspec);
  }

  closeModal(): any {
    this.modal.dismissAll();
    this.idCancelar = '';
  }

  open(content) {
    this.modal.open(content, { centered: true});
  }

  openLg(content) {
    this.modal.open(content, { size: 'lg'});
  }

  onNavChange():void{
    this.haySolicitudes = true;
    this.hayServiciosProgramados=true;
    this.hayServiciosRealizados=true;
    this.haySolicitudesCanceladas=true;
    this.hayServiciosCancelados=true;
    this.solicitudes = [] ;
    this.listarSolicitudesPorCliente();
    this.listarServiciosPorCliente();
  }

  prueba(){
//     const testPosRaton = document.getElementById('testPosRaton');
// 		const output = document.getElementById("output");
// console.log(testPosRaton)
//     testPosRaton.addEventListener("mousemove", function(evt) {
// 		  var mousePos = oMousePos(testPosRaton, evt);
// 		  marcarCoords(output, mousePos.x, mousePos.y)
// 		}, false);


//     function marcarCoords(output, x, y) {
// 		  output.innerHTML = ("x: " + x + ", y: " + y);
// 		  var cssString = "";
// 		  // http://www.quirksmode.org/dom/w3c_css.html#t30
// 		  cssString += "top:" + (y + 10) + "px;";
// 		  cssString += "left:" + (x + 10) + "px;";
// 		  cssString += "visibility:visible;";
// 		  output.style.cssText = cssString;

// 		  testPosRaton.style.cursor = "pointer";
// 		}

// 		function limpiarCoords(output) {
// 		  output.style.cssText = "";
// 		  testPosRaton.style.cursor = "default";
// 		}

// 		function oMousePos(element, evt) {
// 		  var ClientRect = element.getBoundingClientRect();
// 		  return { //objeto
// 		    x: Math.round(evt.clientX - ClientRect.left),
// 		    y: Math.round(evt.clientY - ClientRect.top)
// 		  }
// 		}
  }

  reenviarSolicitud(solicitud){
    // this.clienteServicio.listarSolicitudPorCliente(parseInt(this.storageService.getString('USE_ID')), solicitud.SOL_ID).
    // subscribe(data => {
    //   console.log(data)
    //   if (data.exito) {
    //     let fecha = new Date(data['resultado'][0]['SOL_FECHA_SERVICIO']);
    //     let longitud = (fecha.toLocaleTimeString('en-US')).length;
    //     console.log((fecha.toLocaleTimeString('en-US')).slice(0,longitud-3))
        
    //     if (data['resultado'][0].UBI_DIRECCION == "Servicio remoto") {
    //       let solicitudes = {
    //         SOL_DESCRIPCION: data['resultado'][0]['SOL_DESCRIPCION'],
    //         SOL_FECHA_SERVICIO: new Date(data['resultado'][0]['SOL_FECHA_SERVICIO']).toISOString().split('T')[0],
    //         SOL_HORA_SERVICIO: (fecha.toLocaleTimeString('en-US')).slice(0,longitud-3),
    //         CLI_ID: data['resultado'][0]['CLI_ID'],
    //         CAT_SER_ID: data['resultado'][0]['CAT_SER_ID'],
    //         SOL_NOMBRE_CONTACTO: data['resultado'][0]['SOL_NOMBRE_CONTACTO'],
    //         SOL_CELULAR_CONTACTO: data['resultado'][0]['SOL_CELULAR_CONTACTO'],
    //       }
    //       let ubicacion = {
    //         UBI_DIRECCION:data['resultado'][0]['UBI_DIRECCION'], 
    //         UBI_LATITUD:data['resultado'][0]['UBI_LATITUD'], 
    //         UBI_LONGITUD:data['resultado'][0]['UBI_LONGITUD']
    //       }
    //       this.solicitudService.insertarRemoto(solicitudes,ubicacion,[]).subscribe(resp => {
    //         if (resp.exito) {
    //           this.carga = false;
    //           this.mostrarAlerta = true;
    //           this.tipoAlerta = 'success';
    //           this.mensaje = 'Solicitud creada correctamente';
    //         }
    //       }, error => {
    //         this.carga = false;
    //         this.mostrarAlerta = true;
    //         this.tipoAlerta = 'danger';
    //         this.mensaje = 'Hubo un error al intentar listar las solicitudes. Por favor, intente de nuevo';
    //     });
    //     }else{
    //       let solicitudes = {
    //         SOL_DESCRIPCION: data['resultado'][0]['SOL_DESCRIPCION'],
    //         SOL_FECHA_SERVICIO: new Date(data['resultado'][0]['SOL_FECHA_SERVICIO']).toISOString().split('T')[0],
    //         SOL_HORA_SERVICIO: (fecha.toLocaleTimeString('en-US')).slice(0,longitud-3),
    //         CLI_ID: data['resultado'][0]['CLI_ID'],
    //         CAT_SER_ID: data['resultado'][0]['CAT_SER_ID'],
    //         SOL_NOMBRE_CONTACTO: data['resultado'][0]['SOL_NOMBRE_CONTACTO'],
    //         SOL_CELULAR_CONTACTO: data['resultado'][0]['SOL_CELULAR_CONTACTO']
    //       }
    //       let ubicacion = {
    //         UBI_DIRECCION:data['resultado'][0]['UBI_DIRECCION'], 
    //         UBI_LATITUD:data['resultado'][0]['UBI_LATITUD'], 
    //         UBI_LONGITUD:data['resultado'][0]['UBI_LONGITUD']
    //       }
    //       this.solicitudService.insertar(solicitudes,ubicacion,[]).subscribe(resp => {

    //       }, error => {
    //         this.carga = false;
    //      this.mostrarAlerta = true;
    //      this.tipoAlerta = 'danger';
    //      this.mensaje = 'Hubo un error al intentar listar las solicitudes. Por favor, intente de nuevo';
    //     });
    //     }
    //   }
    //   }, error => {
    //      this.carga = false;
    //   this.mostrarAlerta = true;
    //   this.tipoAlerta = 'danger';
    //   this.mensaje = 'Hubo un error al intentar listar las solicitudes. Por favor, intente de nuevo';
    // }
    // );
  }
}
