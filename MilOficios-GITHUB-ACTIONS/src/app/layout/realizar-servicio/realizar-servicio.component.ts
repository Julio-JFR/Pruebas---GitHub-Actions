import {StorageService} from '../../helpers/storage.service';
import {  Component, OnInit, ViewChild, ElementRef  } from '@angular/core';
import {RealizarServicioService} from './realizar-servicio.service';
import { ActivatedRoute, Data, Router} from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { interval} from 'rxjs';
import { FormBuilder, Validators } from '@angular/forms';
import {Calificaciones} from '../calificaciones/calificaciones.models';
import {CalificacionesService} from '../calificaciones/calificaciones.service';
import { environment } from 'src/environments/environment';
import { ConfiguracionesService } from '../configuraciones/configuraciones.service';

@Component({
  selector: 'app-realizar-servicio',
  templateUrl: './realizar-servicio.component.html',
  styleUrls: ['./realizar-servicio.component.scss']
})
export class RealizarServicioComponent implements OnInit {

  USU_ID: number;
  SERVICIOAREALIZAR = [];
  CALIFICACION = new Calificaciones();
  CalificacionesArray: Calificaciones[]  ;
  cal: number; // CALIFICACION

  
  @ViewChild('modalCliente') elementCliente: ElementRef;
  @ViewChild('modalFinalizar') elementConfirmacionDeTerminarServicio: ElementRef;

  idInterval: any; // obtengo el id del metodo interval().
  tiempo: any;
  horaT: any;
  minutoT: any;
  segundoT: any;
  source = interval(1000);
  enviarServicio = false;
  isEmpezarCronometro = false;

  disabledFinalizarCronometro:boolean = false;
  cargaDato:boolean = false;


  mensaje: string;
  tipoAlerta: string;
  mostrarAlerta = false;
  isInicioTemporizarCronometro = true;
  invalid = false;
  mostrarResumen = false;
  emailCliente: string;
  idUsuarioCalificado: number;
  resumenForm: any;
  temporizarCronometro = true;

  formularioInvalido = false;
  DOMINIO = environment.domain_url;
  isLoadingAbstract:boolean = false;
  claveComisiones=0;

  constructor(private servicio: RealizarServicioService,
    private router: Router,
    public storage: StorageService,
    private route: ActivatedRoute,
    private calificacionService: CalificacionesService,
    private formBuilder: FormBuilder,
    private configuracionService: ConfiguracionesService,
    public modal: NgbModal) {

    }

  ngOnInit(): void {

    if (localStorage.getItem('USE_SERV_ACTIVO')=='0') {
      // this.storage.storeString('USE_CRO', 'H2aUzWe$nDjVZji1b5Z&8Y^h!FUJ5m!$I');
      // this.storage.storeString('USE_CRONIX', '1');
      // // this.idInterval.unsubscribe();
      // this.tiempo = -1;
      // this.cargaDato = false;
      // this.disabledFinalizarCronometro = false;
      // this.enviarServicio = false;
      // this.mostrarResumen = true;
      // this.storage.storeString('MR', '1'); /****/
      // this.invalid = false;
      // this.storage.remove('USER_FEL');
      // this.modal.dismissAll();
      // localStorage.removeItem('USE_SERV_ACTIVO');
    }   
    if (this.storage.getString('USE_CRONIX') === '1') {
      this.storage.storeString('USE_CRO', 'H2aUzWe$nDjVZji1b5Z&8Y^h!FUJ5m!$I');
      this.mostrarResumen = true;
      this.storage.storeString('MR', '1'); /****/
    }
    if(Number(this.storage.getString('USER_FEL'))> 0){
      this.tiempo = this.storage.getString('USER_FEL'); 
      this.storage.storeString('USE_CRO', 'H2aUzWe$nDjVZji1b5Z&8Y^h!FUJ5m!$I');
    }
    this.servicio.updateHeaders();
    this.calificacionService.updateHeaders();

    this.obtenerConfiguraciones();
    if (this.storage.getString('USER_CRO') === '1' && this.mostrarResumen === false ) {
      this.tiempo = this.storage.getString('USER_FEL'); 
      this.storage.storeString('USE_CRO', 'H2aUzWe$nDjVZji1b5Z&8Y^h!FUJ5m!$I'); /** */
      this.invalid = true;
      this.temporizarCronometro = false;
      this.contarServicioRealizado(true);
    } else if ( (this.storage.getString('USER_CRO') === '1' && this.mostrarResumen === true) ) { // Es la segunda interfaz(Resumen).
      this.tiempo = this.storage.getString('USER_FEL');
      this.contarServicioRealizado(false);
    } else if (!this.storage.hasKey('MR')  && this.storage.hasKey('USER_FEL') && this.storage.hasKey('TRA_CNF')  ) {
      this.tiempo = this.storage.getString('USER_FEL');
      this.invalid = true;
      this.temporizarCronometro = false;
      this.contarServicioRealizado(true);
    } else if ( this.storage.hasKey('MR') && this.storage.getString('MR') === '1' ) { // entra a la interfaz del resumen.
      this.mostrarResumen = true;
      this.tiempo = this.storage.getString('USER_FEL');
      this.contarServicioRealizado(false);
    } else {
      this.inicializarContadorCronometro();
    }
    this.obtenerData();
    this.inicializarForm();
  }

  inicializarContadorCronometro() {
    this.tiempo = 0;
    this.horaT = '00';
    this.minutoT = '00';
    this.segundoT = '00';
  }

  obtenerData() {
    this.route.data.subscribe( (data: Data) => {
      if (data['realizarServicio']['Resultado'] !== null) {
        this.SERVICIOAREALIZAR  = data['realizarServicio']['Resultado'];
        this.emailCliente = this.SERVICIOAREALIZAR[0]['USU_EMAIL'];
        this.idUsuarioCalificado = this.SERVICIOAREALIZAR[0]['USU_ID'];
        this.setCollapsed();
      } else {
        this.mostrarAlerta = true;
        this.tipoAlerta = 'danger';
        this.mensaje = 'No hay datos obtenidos con la solicitud. Por favor, intente con otro. ';
        this.cerrarAlerta();
      }
    }, error => {
        this.mostrarAlerta = true;
        this.tipoAlerta = 'danger';
        if (error['error']['error'] !== undefined) {
          if (error['error']['error'] === 'error_BD') {
            this.mensaje = 'No se pudo realizar la comunicación interna .Por favor, intente de nuevo.';
          } else if (error['error']['error'] === 'error_deCampo') {
            this.mensaje = 'Los valores de los parámetros enviados deben respetar los formatos permitidos. Por favor, intente de nuevo.';
          }
        } else {
          this.mensaje = 'Hubo un error al intentar obtener el trabajo a realizar. Por favor, intente de nuevo. ';
        }
        this.cerrarAlerta();
    }

    );
  }


  abrirModalCliente() {
    this.modal.open(this.elementCliente);
  }

  closeModal(): any {
    this.modal.dismissAll();
  }

  abrirModalTerminarServicio() {
    this.modal.open(this.elementConfirmacionDeTerminarServicio);
  }

  inicializarForm() {
    this.resumenForm =  this.formBuilder.group({
      comentario: ['', [Validators.required, Validators.pattern('[a-zñáéíóú., A-ZÑÁÉÍÓÚ 0-9 ]+'), Validators.maxLength(60)]],
      puntuacion: ['', [Validators.required]]
    });
  }


  iniciarCronometro(): any {
    if (this.enviarServicio === false) {
      this.servicio.iniciarServicioRealizado( Number(this.route.snapshot.paramMap.get('id')), this.SERVICIOAREALIZAR[0]['ESP_ID'],this.emailCliente ).subscribe( data => {
        console.log('data',data);
        let fechaActual = new Date();
        console.log('fechaActual',fechaActual);
        this.invalid = true;
        this.storage.storeString('USER_CRO', '1');
        this.storage.storeString('USE_CRO ', 'H2aUzWe$nDjVZji1b5Z&8Y^h!FUJ5m!$I'); /* */
        this.temporizarCronometro = false;
        this.enviarServicio = true;
        let fechaFin = new Date(data.fechaServicio);
        localStorage.setItem('FECHA_INI', data.fechaServicio);
        let dif = fechaActual.getTime() - fechaFin.getTime();
        localStorage.setItem('USER_FEL', (dif/1000).toFixed());
        this.tiempo = this.storage.getString('USER_FEL'); 
        localStorage.setItem('USE_SERV_ACTIVO', '1');
        const navegadores = window.navigator['userAgentData']?.brands;
        let navegadoresDisponibles = navegadores ? navegadores.filter(dat => dat['brand']!='Not_A Brand') : [];
        this.storage.storeString('navegador',navegadoresDisponibles[1]?.brand??'' +navegadoresDisponibles[1]?.version??'');
        this.contarServicioRealizado(true);
      }, error => {
        this.tipoAlerta = 'danger';
        this.mostrarAlerta = true;
        this.isInicioTemporizarCronometro = false;
        if (error['error']['error'] !== undefined) {
          if (error['error']['error'] === 'error_BD') {
            this.mensaje = 'Hubo un error al intentar ejecutar su solicitud. Por favor, intente de nuevo';
          } else if (error['error']['error'] === 'error_deCampo') {
            this.mensaje = 'Los datos ingresados deben respetar los formatos permitidos. Por favor, intente de nuevo.';
          }
        } else {
          this.mensaje = 'Hubo un error al intentar iniciar el cronómetro. Por favor, intente de nuevo';
        }
        this.cerrarAlerta();
      } 
      );
    }
  }

  contarServicioRealizado(esValidoContar: boolean) {
    this.horaT='';
    this.minutoT='';
    this.segundoT='';
      if (esValidoContar === false) {
        this.horaT = ('0' + Math.floor((this.tiempo / 3600))).toString().slice(-2);
        if ( Math.floor((this.tiempo / 3600)).toString().length > 2 ) {
          this.horaT = ( Math.floor((this.tiempo / 3600))).toString().slice(0, Math.floor((this.tiempo / 3600)).toString().length);
        }
        this.minutoT = ('0' + Math.floor((this.tiempo % 3600) / 60)).toString().slice(-2);
        this.segundoT = ('0' + (this.tiempo % 60)).toString().slice(-2);
      } else {
        this.idInterval = this.source.subscribe( () => {
          this.tiempo++;
          this.tiempo = Number(this.tiempo.toFixed())
          this.storage.storeString('USER_FEL', this.tiempo.toString()); // La variable USER_FEL es la que almacena el valor del cronometro.
          this.horaT = ('0' + Math.floor((this.tiempo / 3600))).toString().slice(-2);
          if ( Math.floor((this.tiempo / 3600)).toString().length > 2 ) {
            this.horaT = ( Math.floor((this.tiempo / 3600))).toString().slice(0, Math.floor((this.tiempo / 3600)).toString().length);
          }
          this.minutoT = ('0' + Math.floor((this.tiempo % 3600) / 60)).toString().slice(-2);
          this.segundoT = ('0' + (this.tiempo % 60)).toString().slice(-2);
        });
      }
  }

  terminarCronometro() {
    this.mostrarAlerta = false;
    this.cargaDato = true;
    this.disabledFinalizarCronometro = true;
    this.servicio.finalizarServicioRealizado(Number(this.route.snapshot.paramMap.get('id')), this.emailCliente, parseInt(localStorage.getItem("USE_ID"))).subscribe( data => {
      this.idInterval.unsubscribe();
      this.storage.storeString('USE_CRO', 'H2aUzWe$nDjVZji1b5Z&8Y^h!FUJ5m!$I');
      this.storage.storeString('USE_CRONIX', '1');
      localStorage.setItem('USE_SERV_ACTIVO', '0');
      this.tiempo = -1;
      this.cargaDato = false;
      this.disabledFinalizarCronometro = false;
      this.enviarServicio = false;
      this.obtenerHoraFin(new Date(data.fechaServicio),new Date(localStorage.getItem('FECHA_INI')));
      
      this.mostrarResumen = true;
      localStorage.setItem('FECHA_FIN', data.fechaServicio);

      this.invalid = false;
      this.modal.dismissAll();
      this.storage.remove('USER_FEL');
      this.storage.remove('MR')
      // this.router.navigate(['/especialista/solicitudes']); 
    }, error => {
      // this.tiempo = -1;
      this.idInterval.unsubscribe();
      this.disabledFinalizarCronometro = false;
      this.cargaDato = false;
      this.modal.dismissAll();
      this.tipoAlerta = 'danger';
      this.mostrarAlerta = true;
      this.storage.remove('USER_FEL');
      this.invalid = false;
      if (error['error']['error'] !== undefined) {
        if (error['error']['error'] === 'error_BD') {
          this.mensaje = 'Hubo un error al intentar ejecutar su solicitud. Por favor, intente de nuevo';
        } else if (error['error']['error'] === 'error_deCampo') {
          this.mensaje = 'Los datos ingresados deben respetar los formatos permitidos. Por favor, intente de nuevo.';
        }
      } else {
        this.mensaje = 'Hubo un error al intentar finalizar el cronómetro. Por favor, intente de nuevo';
      }
      this.cerrarAlerta();
    } );
  }

  obtenerHoraFin(fecha1,fecha2) {
    // if ((fecha1.getSeconds() - fecha2.getSeconds())<0)
    //   fecha1.setMinutes(fecha1.getMinutes()-1);
    
    // if ((fecha1.getMinutes() - fecha2.getMinutes())<0)
    //   fecha1.setHours(fecha1.getHours()-1);
    const diferenciaMs = fecha1.getTime() - fecha2.getTime();
    const diferenciaSegundos = Math.floor(diferenciaMs / 1000);
    const horas = Math.floor(diferenciaSegundos / 3600);
    const minutos = Math.floor((diferenciaSegundos % 3600) / 60);
    const segundos = diferenciaSegundos % 60;
    
    this.segundoT = segundos.toString().padStart(2,'0');
    this.minutoT = minutos.toString().padStart(2,'0');
    this.horaT = horas.toString().padStart(2,'0');
  }

  obtenerCalificacion(calif) {
    this.cal = calif;
  }

  aceptarFichaDeResumen() {
    this.idUsuarioCalificado = this.SERVICIOAREALIZAR[0]['USU_ID'];
    if (this.resumenForm.get('comentario').value === '' || this.resumenForm.get('puntuacion').value === '' ) {
      this.formularioInvalido = true;
    } else {
      this.isLoadingAbstract = true;
      let estado = null;
      this.formularioInvalido = false;
      this.CALIFICACION.CA_CALIFICACION = this.cal;
      this.CALIFICACION.CA_COMENTARIO = this.resumenForm.get('comentario').value;
      this.CALIFICACION.CA_TIPO = 1;
      this.CALIFICACION.SERE_ID = Number(this.route.snapshot.paramMap.get('id')); // id es el cod de Serv.realizado.
      this.CalificacionesArray = [
        {
          CA_CALIFICACION: this.CALIFICACION.CA_CALIFICACION,
          CA_COMENTARIO: this.CALIFICACION.CA_COMENTARIO,
          CA_TIPO: this.CALIFICACION.CA_TIPO,
          SERE_ID: this.CALIFICACION.SERE_ID
        }
      ];
      if (!this.storage.hasKey('SEG')) {
        estado = 5;
      } else {
        estado = 6;
      }
      
      this.calificacionService.insertarCalificacion(this.CalificacionesArray, estado, this.idUsuarioCalificado).subscribe( () => { // insertarCalificacion( obj calificacion , id usuario a calificar , tipo de usuario a calificar)
        this.storage.remove('SEG');
        this.storage.remove('USE_CRONIX');
        this.storage.remove('USER_FEL'); // Eliminamos el valor del tiempo.
        this.storage.remove('USER_CRO');
        this.storage.remove('AUX_USER_FEL');
        this.storage.remove('servRealizadoID');
        this.storage.remove('usuarioID');
        this.storage.remove('MR');
        this.storage.remove('TRA_CNF');
        
        this.storage.remove('USER_FEL');
        // this.storage.storeString('USE_CRO', 'H2aUzWe$nDjVRji1b5Z&8Y^h!FUJ5m!$I');
        this.goToTrabajosConfirmados();
        this.temporizarCronometro = false;
        this.mostrarResumen = false;
        this.calificacionService.enviarCalificarServicioAplicacion(this.CALIFICACION.SERE_ID).subscribe(
          data=>{
            this.isLoadingAbstract = false;
            
          },error=>{
            this.isLoadingAbstract = false;
            this.storage.remove('SEG');
            this.storage.remove('USE_CRONIX');
            this.storage.remove('USER_FEL'); // Eliminamos el valor del tiempo.
            this.storage.remove('USER_CRO');
            this.storage.remove('AUX_USER_FEL');
            this.storage.remove('servRealizadoID');
            this.storage.remove('usuarioID');
            this.storage.remove('MR');
            this.storage.remove('TRA_CNF');
          }
        );
      }, error => {
        this.tipoAlerta = 'danger';
        this.mostrarAlerta = true;
        if (error['error']['error'] !== undefined) {
          if (error['error']['error'] === 'error_BD') {
            // tslint:disable-next-line:max-line-length
            this.mensaje = 'Hubo un error al intentar ejecutar su solicitud. Por favor, intente de nuevo';
          } else if (error['error']['error'] === 'error_deCampo') {
            this.mensaje = 'Los datos ingresados deben respetar los formatos permitidos. Por favor, intente de nuevo.';
          }
        } else {
          this.mensaje = 'Hubo un error al intentar añadir la calificación. Por favor, intente de nuevo';
        }
        this.cerrarAlerta();
      });
    }
  }

  obtenerConfiguraciones(){
    this.configuracionService.listar().subscribe(data=> {
      data['Resultado'].forEach(data =>{
        if (data['CONF_CLAVE'] =='COM_CULQI'  || data['CONF_CLAVE'] =='COM_BANK'  || data['CONF_CLAVE'] =='COM_MO' || data['CONF_CLAVE'] =='COM_IMP') {
          this.claveComisiones += Number(data['CONF_VALOR']);
        }
      });
    }, error => {
        if (error['error']['error'] !== undefined) {
          if (error['error']['error'] === 'error_deBD') {
            this.mensaje = 'No se pudo realizar la comunicación interna para aceptar la solicitud. Por favor, intente de nuevo';
          }
        } else {
          this.mensaje = 'Hubo un error al intentar aceptar la solicitud. Por favor, intente de nuevo';
        }
    });
  }

  setCollapsed() {
    for (let index = 0; index < this.SERVICIOAREALIZAR.length; index++) {
      this.SERVICIOAREALIZAR[index]['IS_COLLAPSED'] = false;
    }
  }

  goToTrabajosConfirmados() {
    this.router.navigate(['trabajosConfirmados']);
  }

  get comentario() {
    return this.resumenForm.get('comentario');
  }

  get puntuacion() {
    return this.resumenForm.get('puntuacion');
  }

  cerrarAlerta(){
    setTimeout(() => {
      this.mostrarAlerta=false;
      this.mensaje="";
    }, 5000);
  }

}
