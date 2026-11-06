import { Component, ElementRef, OnInit , ViewChild} from '@angular/core';
import { NgbModal, NgbModalConfig, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import {ActivatedRoute, Router} from '@angular/router';
import { FormGroup, FormBuilder,  Validators } from '@angular/forms';
import { ServicioRealizadoService } from '../../../servicios/servicios-realizados/servicio-realizado.service';
import { StorageService } from '../../../../helpers/storage.service';
import {Calificaciones} from '../../../calificaciones/calificaciones.models';
import {CalificacionesService} from '../../../calificaciones/calificaciones.service';
import {NgbAlert} from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment'
import 'moment/locale/es';
moment.locale('es');

@Component({
  selector: 'app-calificar-servicio',
  templateUrl: './calificar-servicio.component.html',
  styleUrls: ['./calificar-servicio.component.scss']
})
export class CalificarServicioComponent implements OnInit {
  constructor(public modal: NgbModal,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private servicioRealizadoService: ServicioRealizadoService,
    private calificacionService: CalificacionesService,
    private storageService: StorageService,
    configModal: NgbModalConfig
  ) {
     configModal.backdrop = 'static';
    configModal.keyboard = false;
 }
  carga: boolean;
  CalificacionesArray: Calificaciones[]  ;
  idServicio: string;
  selectedApp = 0 ;
  hoveredApp = 0 ;
  selectedEsp = 0 ;
  hoveredEsp = 0 ;
  horas: number;
  minutos: number;
  segundos: number;
  horasM: string;
  minutosM: string;
  segundosM: string;
  noCalificacion =  true;
  mostrarAlerta = false;
  tipoAlerta: string;
  mensaje: string;
  servicios: any[] = [] ;
  servicioCalificar: any;
  duracionServicio: string ;
  dateInicio: Date ;
  dateFin: Date ;
  public calificacionForm: FormGroup;
  @ViewChild('selfClosingAlert', {static: false}) selfClosingAlert: NgbAlert;
  @ViewChild('confirmacionCancelacion') confirmacionCancelacion1: ElementRef;

  get;
  ngOnInit(): void {
    this.activatedRoute.params.subscribe( data => {
      this.idServicio = data['idServicio'];
    });
    this.carga = true;
    this.cargarServicioACalificar();
    this.inicializarUsuarioForm();
     setTimeout(()=>{
      if (this.servicioCalificar.CA_CALIFICACION !== null) {
      this.goToMisSolicitudes();
    }
    },3000)  
  }
  inicializarUsuarioForm() {
    this.calificacionForm =  this.formBuilder.group({
      comentarioAplicacion: ['' , [Validators.required , Validators.maxLength(60) ]],
      comentarioEspecialista: ['' , [Validators.required, Validators.maxLength(60) ]]
    });
  }
  cargarServicioACalificar() {
    this.servicioRealizadoService.listarServiciosRealizadosPorCliente(parseInt(this.storageService.getString('USE_ID'))).
    subscribe(data => {
      this.servicios = data['resultado'];
      let compare;
        this.servicios.forEach(element => {
          compare = this.idServicio.localeCompare(element.SERE_ID);
          if (compare === 0) {
            this.servicioCalificar = element;
           
            let fin=moment(this.servicioCalificar['SERE_FECH_FIN_REAL']);
            let ini=moment(this.servicioCalificar['SERE_FECH_INI_REAL']);
            
            let diferencia = fin.subtract(moment.duration(ini.format('hh:mm:ss')));
            let hora = diferencia.format('hh');
            this.duracionServicio = (hora=='12'? '00' : hora) + ' h '+ diferencia.format('mm') + ' m '+ diferencia.format('ss')+ ' s';
          }
        });
        this.carga = false;
      }, error => {
        this.carga = false;
        this.mostrarAlerta = true;
        this.tipoAlerta = 'danger';
        this.mensaje = 'Hubo un error al intentar cargar el servicio. Por favor, intente de nuevo';
        this.cerrarAlerta();
      }
    );
  }
  cerrarAlerta(){
    setTimeout(() => {
      this.mostrarAlerta=false;
      this.mensaje="";
    }, 5000);
  }
  
  calificacionAplicacion() {
    return this.calificacionForm.get('calificacionAplicacion');
  }
  noHayCalificacion() {
    this.noCalificacion = false;
  }

  validarCalificacion() {
    if (!this.calificacionForm.invalid) {
      if (!this.selectedApp) {
        this.mostrarAlerta = true;
        this.tipoAlerta = 'danger';
        this.mensaje = 'Por favor, no olvide calificar nuestra aplicación.';
        this.cerrarAlerta();
      }
      if (!this.selectedEsp) {
        this.mostrarAlerta = true;
        this.tipoAlerta = 'danger';
        this.mensaje = 'Por favor, no olvide calificar al especialista.';
        this.cerrarAlerta();
      }if (this.selectedApp && this.selectedEsp ) {
      this.modal.open(this.confirmacionCancelacion1, {size: 'sm'});
      this.CalificacionesArray = [
        {
          CA_CALIFICACION : this.selectedEsp,
          CA_COMENTARIO: this.comentarioEspecialista.value,
          CA_TIPO: 0,
          SERE_ID: this.servicioCalificar.SERE_ID
        },
        {
          CA_CALIFICACION : this.selectedApp,
          CA_COMENTARIO: this.comentarioAplicacion.value,
          CA_TIPO: 2,
          SERE_ID: this.servicioCalificar.SERE_ID
        }
      ];
      }
    } else {
      this.mostrarAlerta = true;
        this.tipoAlerta = 'danger';
        this.mensaje = 'Por favor, llene todos los campos.';
    }
    this.cerrarAlerta();
  }
  confirmarCalificacion() {
    this.calificacionService.insertarCalificacion(this.CalificacionesArray, 5, this.servicioCalificar.USU_ID).subscribe( () => { // insertarCalificacion( obj calificacion , id usuario a calificar , tipo de usuario a calificar)
      this.modal.dismissAll();
      this.tipoAlerta = 'success';
      this.mostrarAlerta = true;
      this.mensaje = 'Se envió la calificación de manera correcta';
      this.cerrarAlerta();
      setTimeout(() => {
        this.goToMisSolicitudes();
      }, 1500);
    }, error => {
      this.modal.dismissAll();
      this.tipoAlerta = 'danger';
      this.mostrarAlerta = true;
      this.goToMisSolicitudes();
      if (error['error']['error'] !== undefined) {
        if (error['error']['error'] === 'error_BD') {
          this.mensaje = 'Hubo un error al intentar ejecutar su solicitud. Por favor, intente de nuevo';
        } else if (error['error']['error'] === 'error_deCampo') {
          this.mensaje = 'Los datos ingresados deben respetar los formatos permitidos. Por favor, intente de nuevo.';
        }
      } else {
        this.mensaje = 'Hubo un error al intentar añadir la calificación. Por favor, intente de nuevo';
      }
      this.cerrarAlerta();
    });
    this.borrarDatos();
  }
  goToMisSolicitudes() {
    this.router.navigate(['mis-solicitudes']);
    this.modal.dismissAll();
  }
  borrarDatos() {
    this.calificacionForm.reset();
    this.selectedApp = 0 ;
    this.selectedEsp = 0 ;
    this.hoveredApp = 0 ;
    this.hoveredEsp =  0 ;
  }
  closeModal(): any {
    this.modal.dismissAll();
  }
  get comentarioEspecialista() {
    return this.calificacionForm.get('comentarioEspecialista');
  }
  get comentarioAplicacion() {
    return this.calificacionForm.get('comentarioAplicacion');
  }
}
