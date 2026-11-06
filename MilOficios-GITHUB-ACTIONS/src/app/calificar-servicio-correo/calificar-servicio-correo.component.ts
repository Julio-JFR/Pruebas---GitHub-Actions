import { Component, OnInit ,ViewChild,ElementRef} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Calificaciones} from '../layout/calificaciones/calificaciones.models';
import {CalificacionesService} from '../layout/calificaciones/calificaciones.service';
import { NgbModal, NgbModalConfig, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder,  Validators } from '@angular/forms';
import { ServicioRealizadoService } from '../layout/servicios/servicios-realizados/servicio-realizado.service';

@Component({
  selector: 'app-calificar-servicio-correo',
  templateUrl: './calificar-servicio-correo.component.html',
  styleUrls: ['./calificar-servicio-correo.component.scss']
})
export class CalificarServicioCorreoComponent implements OnInit {

  constructor(public modal: NgbModal,private activatedRoute: ActivatedRoute,
    private router: Router,private formBuilder: FormBuilder,
    private servicioRealizadoService: ServicioRealizadoService,
    private calificacionService: CalificacionesService,
    configModal: NgbModalConfig
  ) {
     configModal.backdrop = 'static';
    configModal.keyboard = false;
 }

 @ViewChild('confirmacionCancelacion') confirmacionCancelacion1: ElementRef;
 @ViewChild('confirmacionCancelacion2') confirmacionCancelacion2: ElementRef;

  carga: boolean;
  CalificacionesArray: Calificaciones[]  ;
  idServicio:number;
  servicio:any;
  selectedApp = 0 ;
  hoveredApp = 0 ;
  selectedEsp = 0 ;
  hoveredEsp = 0 ;
  noCalificacion =  true;
  mostrarAlerta = false;
  tipoAlerta: string;
  mensaje: string;
  cargaSolicitud = false;
 horas:Date;
  public calificacionForm: FormGroup;



  ngOnInit(): void {
    this.activatedRoute.params.subscribe( data => {
      this.idServicio = data['idServicio'];
    });

    this.obtenerServicio();
    this.inicializarUsuarioForm();
  }

  inicializarUsuarioForm() {
    this.calificacionForm =  this.formBuilder.group({
      comentarioAplicacion: ['' , [Validators.required , Validators.maxLength(60) ]],
      comentarioEspecialista: ['' , [Validators.required, Validators.maxLength(60) ]]
    });
  }

  confirmarCalificacion() {
    this.cargaSolicitud = true;
    this.calificacionService.insertarCalificacion(this.CalificacionesArray, 5, this.servicio.USU_ID).subscribe( () => { // insertarCalificacion( obj calificacion , id usuario a calificar , tipo de usuario a calificar)
      this.cargaSolicitud = true;
      this.tipoAlerta = 'success';
      this.mostrarAlerta = true;
      this.mensaje = 'Se envió la calificación de manera correcta, será redirigido a la página principal';
      this.modal.dismissAll();
      this.borrarDatos();
      setTimeout(() => {
        this.cargaSolicitud = false;
        this.router.navigate(['/home']);
        
        }, 10000);
        
        this.cerrarAlerta();
    }, error => {
      this.cargaSolicitud = true;
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
      this.cargaSolicitud = false;
      this.cerrarAlerta();
    });
    this.borrarDatos();
    
  }

  closeModal(): any {
    this.modal.dismissAll();
  }

  obtenerServicio(){
    this.servicioRealizadoService.obtenerServicioCalificaciónCorreo(this.idServicio).subscribe(data =>{
      this.servicio = data['resultado'];
      this.carga = false;
      this.horas = new Date(this.servicio.SERE_HORA_IN_REAL)
     
    },error =>{
      this.carga = false;
      this.tipoAlerta = 'danger';
    });
  }

  validarCalificacion() {
    if (!this.calificacionForm.invalid) {
      if (!this.selectedApp) {
        this.mostrarAlerta = true;
        this.tipoAlerta = 'danger';
        this.mensaje = 'Por favor, no olvide calificar nuestra aplicación.';
      }
      if (!this.selectedEsp) {
        this.mostrarAlerta = true;
        this.tipoAlerta = 'danger';
        this.mensaje = 'Por favor, no olvide calificar al especialista.';
      }if (this.selectedApp && this.selectedEsp ) {
      this.modal.open(this.confirmacionCancelacion1, {size: 'sm'});
      this.CalificacionesArray = [
        {
          CA_CALIFICACION : this.selectedEsp,
          CA_COMENTARIO: this.comentarioEspecialista.value,
          CA_TIPO: 0,
          SERE_ID: +this.idServicio
        },
        {
          CA_CALIFICACION : this.selectedApp,
          CA_COMENTARIO: this.comentarioAplicacion.value,
          CA_TIPO: 2,
          SERE_ID: +this.idServicio
        }
      ];
      }
    } else {
      this.mostrarAlerta = true;
        this.tipoAlerta = 'danger';
        this.mensaje = 'Por favor, llene todos los campos.';
    }
    // this.cerrarAlerta();
  }

  borrarDatos() {
    this.calificacionForm.reset();
    this.selectedApp = 0 ;
    this.selectedEsp = 0 ;
    this.hoveredApp = 0 ;
    this.hoveredEsp =  0 ;
  }
  calificacionAplicacion() {
    return this.calificacionForm.get('calificacionAplicacion');
  }
  noHayCalificacion() {
    this.noCalificacion = false;
  }
  get comentarioEspecialista() {
    return this.calificacionForm.get('comentarioEspecialista');
  }
  get comentarioAplicacion() {
    return this.calificacionForm.get('comentarioAplicacion');
  }
  cerrarAlerta(){
    setTimeout(() => {
      this.mostrarAlerta=false;
    }, 5000);
  }
}
