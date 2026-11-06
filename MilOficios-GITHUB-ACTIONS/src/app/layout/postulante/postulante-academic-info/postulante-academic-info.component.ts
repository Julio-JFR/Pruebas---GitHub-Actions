import { DatePipe } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { StorageService } from 'src/app/helpers/storage.service';
import { AuthService } from 'src/app/shared/guard/auth.service';
import { PostulacionService } from '../postulacion/postulacion.service';
import { PostulanteService } from '../postulante.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Estudio } from '../../estudios/estudio.model';
import { EstudiosService } from '../../estudios/estudios.service';


@Component({
  selector: 'app-postulante-academic-info',
  templateUrl: './postulante-academic-info.component.html',
  styleUrls: ['./postulante-academic-info.component.scss']
})
export class PostulanteAcademicInfoComponent implements OnInit {

  postulanteForm:FormGroup;
  maxFecha: string;
  id_postulante: number;
  postulante;

  tipoAlerta:string;
  alertaPostulacion:boolean;
  mensajeAlerta:string;
  estado_postulacion:number;
  alertaGeneral:boolean;
  deshabilitarPost:boolean;
  deshabilitarCuenta:boolean;

  errorModal:boolean;
  loadingModal:boolean;
  mensajeModal:string;
  loadingCuenta:boolean;

  loadingPost: boolean;
  estudios: Estudio[] = [];
  loadingEst:boolean;

  //Variables para errores
  errorCuenta: boolean;
  errorFoto: boolean;
  errorPost: boolean;
  errorCv: boolean;
  errorCvM: boolean; //es un error que aparecerá como mensaje abajo de la interfaz del cv
  errorEstudio: boolean;
  errorExperiencia: boolean;
  mensajeErrorCuenta: string;
  mensajeErrorFoto: string;
  mensajeErrorPostulante: string;
  mensajeErrorCv: string;
  mensajeErrorEstudio: string;
  mensajeErrorExperiencia: string
  estudioForm: FormGroup;

  opacarDateFechaInicioEstudio = true;
  opacarDateFechaFinEstudio = true;
  isCheckEstudio = false;// el checkbox de "en curso" para las fechas de fin estará true por defecto

  //Variables para los estudios
  estudio: Estudio;//para añadir o actualizar un estudio
  id_estudio: number;
  @ViewChild('contentPostulacion') contentPostulacion: ElementRef;
  

  constructor(config: NgbModalConfig, private formBuilder:FormBuilder,
    private storageService: StorageService,private postulanteService:PostulanteService,private modalService: NgbModal, private router: Router,
    private postulacionService: PostulacionService, private estudioService: EstudiosService, 
    private route: ActivatedRoute) { 

    this.id_postulante = parseInt(this.storageService.getString('POST_ID'));
    this.deshabilitarPost = true;//deshabilitar los inputs de los datos del postulante
    this.deshabilitarCuenta = true;// deshabilitar los inputs de los datos de la cuenta del postulante
    config.backdrop = 'static';
    config.keyboard = false;
  }

  ngOnInit(): void {
    this.obtenerDetallesPostulante();
    this.listarEstudios();
    this.estudioForm = this.formBuilder.group({
      est_tipo:['', [Validators.required, Validators.pattern('([a-zA-ZñÑáéíóúÁÉÍÓÚ\s][ ]*)+'), Validators.maxLength(20)]],
      est_descripcion:['', [Validators.required, Validators.maxLength(60)],],
      est_institucion:['', [Validators.required, Validators.maxLength(20)],],
      est_fech_ini: ['', Validators.required],
      est_fech_fin: ['', Validators.required]
    });
  }

  obtenerDetallesPostulante(){
    this.loadingCuenta=true;

    this.route.data.subscribe( (data: any) => {
      this.loadingPost = false;
      if (data.postulanteSidebar.exito) {
        this.estado_postulacion = data.postulanteSidebar['Resultado']['POST_ESTADO'];// estado del postulante
        this.postulante = data.postulanteSidebar['Resultado'];
        this.loadingCuenta=false;

        if (this.estado_postulacion == 2){
          this.tipoAlerta = "warning";
          this.alertaPostulacion = true;
          this.mensajeAlerta = "Tienes una postulación pendiente. Por favor, espera a que esta sea evaluada para que actualices tus datos.";
        }
      } else{
        this.tipoAlerta = "danger";
        this.alertaGeneral = true;
        this.mensajeAlerta = "Hubo un error en la conexión del servidor. Por favor, intente más tarde.";
      }
    });
  }

  listarEstudios(){
    this.alertaGeneral = false;
    this.errorEstudio = false;
    this.loadingEst = true;
    this.estudioService.listarEstudiosPostulante(this.id_postulante)
    .subscribe((data)=>{
      this.loadingEst = false;
      this.estudios= data['Resultado'];
    }, error => {
      if(error['error']['error'] !== undefined){
        this.errorEstudio = true;
        if(error['error']['error'] === "error_deBD")
          this.mensajeErrorEstudio = "Hubo un error al intentar ejecutar su solicitud para obtener los estudios del postulante. Por favor, intente de nuevo";
        else if(error['error']['error'] === "error_deCampo")
          this.mensajeErrorEstudio = "Los datos ingresados deben respetar los formatos permitidos. Por favor, intente de nuevo.";  
        else if(error['error']['error'] === "error_noExistenciaDeId")
          this.mensajeErrorEstudio = "No se encontró registro del postulante para obtener sus estudios. Por favor, intente de nuevo.";
      }else{
        this.tipoAlerta = "danger";
        this.alertaGeneral = true;
        this.mensajeAlerta = "Hubo un error en la conexión del servidor. Por favor, intente más tarde.";
      }
      this.loadingEst = false;
    });
  }

  
  nuevoEstudio(){
    this.estudio = new Estudio();
    this.estudio.EST_ID = 0;
    this.estudioForm.reset();// para limpiar todos los campos del modal
  }


  // ***************************** FUNCION PARA EL MODAL ************************** */
  open(content) {
    this.modalService.open(content);
  }

   //funciones para eliminar los estudios
  obtenerIdEstudio(id_estudio){//se obtiene el id del estudio para eliminarlo después
    this.id_estudio = id_estudio;
  }

  eliminarEstudio(){
    this.errorModal = false;
    this.loadingModal = true;
    this.estaBloqueado()
    .then(good => {
      if(good['error'] === null){
        this.estudioService.eliminarEstudio(this.id_estudio)
        .subscribe((data)=>{
          this.loadingModal = false;
          this.modalService.dismissAll();
          this.listarEstudios();
          /* Alerta al momento de eliminar el estudio del postulante */
          this.alertaGeneral = true;
          this.tipoAlerta = 'success';
          this.mensajeAlerta = "Estudio eliminado con éxito.";
        }, error=>{
          this.errorModal = true;
          this.loadingModal = false;
          if(error['error']['error'] !== undefined){
            if(error['error']['error'] === "error_deBD")
              this.mensajeModal = "Hubo un error al intentar ejecutar su solicitud para eliminar el estudio del postulante. Por favor, intente de nuevo";
            else if(error['error']['error'] === "error_deCampo")
              this.mensajeModal = "Los datos ingresados deben respetar los formatos permitidos. Por favor, intente de nuevo.";  
            else if(error['error']['error'] === "error_noExistenciaDeId")
              this.mensajeModal = "No se encontró registro del postulante para eliminar su estudio. Por favor, intente de nuevo.";
          }else{
            this.mensajeModal = "Hubo un error al intentar eliminar el estudio del postulante. Por favor, intente de nuevo";
          }
        });
      }else if(good['error'] === "error_deEstadoNoValidoBloqueo"){
        this.loadingModal = false;
        this.estado_postulacion = 3;//para indicar que es un postulante bloqueado, ya que si no se recarga la pagina no se actualiza dicha variable
        this.modalService.open(this.contentPostulacion);
      }
    })
    .catch(bad =>{
      this.loadingModal = false;
      this.errorModal = true;
      if(bad['error']['error'] !== undefined){
        if(bad['error']['error'] === "error_deBD"){
          this.mensajeModal = "Hubo un error al intentar ejecutar su solicitud. Por favor, intente de nuevo.";
        }
      }else{
        this.mensajeModal = "Hubo un error de conexión al intentar eliminar el estudio del postulante. Por favor, intente de nuevo";
      }
    });
  }

  estaBloqueado = () => {
    const promiseBloqueo = new Promise((resolve,reject) => {
      this.postulanteService.estaBloqueado(this.id_postulante)
      .subscribe(data => {
        resolve(data);
      }, error =>{
        reject(error);
      });
    });
    return promiseBloqueo;
  }

  getToday(): string { // Devuelve 4 formatos de fechas, y solo escogemos el primero [0], hasta donde termine en 'T'.
    return new Date().toISOString().split('T')[0];
  }

  cambiarDeStyleDateInicioEstudio() {
    this.opacarDateFechaInicioEstudio = false;
  }

  cambiarDeStyleDateFinEstudio(){
    this.opacarDateFechaFinEstudio = false;
  }

  agregarActualizar(){
    if(this.estudioForm.invalid){
      this.errorModal = true;
      this.mensajeModal = "Los datos ingresados son inválidos. Por favor, respete los formatos solicitados e intente de nuevo";
    }else{
      this.obtenerEstudioForm(this.estudioForm.value);
      if(this.estudio['EST_ID']!=0){
        this.actualizarEstudio();
      }else{
        this.insertarEstudio();
      }
    }
  }

  obtenerEstudioForm(estudioF){
    this.estudio.EST_TIPO = estudioF.est_tipo;
    this.estudio.EST_INSTITUCION = estudioF.est_institucion;
    this.estudio.EST_DESCRIPCION = estudioF.est_descripcion;
    this.estudio.EST_FECH_INI = estudioF.est_fech_ini;
    this.estudio.EST_FECH_FIN = estudioF.est_fech_fin;
  }

  procesoDatosCheckEstudio(){
    this.isCheckEstudio = !this.isCheckEstudio;//se cambia el valor de la variable a su opuesto
    //si el checkbox esta seleccionado se inhabilitado sino se habilita el input de la fecha de fin
    if(this.isCheckEstudio)
      this.estudioForm.controls.est_fech_fin.disable();
    else
      this.estudioForm.controls.est_fech_fin.enable(); 

    if(this.isCheckEstudio)
      this.est_fech_fin.setValue('');
  }

  obtenerEstudioActual(estudio: Estudio){
    this.estudio = JSON.parse(JSON.stringify(estudio));
    if(this.estudio.EST_FECH_FIN == null){
      // en teoría debe ser verdadero la variable porque se está cursando aún el estudio pero se coloca lo inverso porque la función this.procesoDatosCheckEstudio() invierte el valor de la variable y procesa los datos
      this.isCheckEstudio = false; 
    }else{
      // en teoría debe ser verdadero la variable porque no está cursando aún el estudio pero se coloca lo inverso porque la función this.procesoDatosCheckEstudio() invierte el valor de la variable y procesa los datos
      this.isCheckEstudio = true;
    }
    this.procesoDatosCheckEstudio();
    this.modificarEstudioModal();
  }

  modificarEstudioModal(){
    this.est_tipo.setValue(this.estudio.EST_TIPO);
    this.est_descripcion.setValue(this.estudio.EST_DESCRIPCION);
    this.est_institucion.setValue(this.estudio.EST_INSTITUCION);
    this.est_fech_ini.setValue(this.estudio.EST_FECH_INI);
    this.est_fech_fin.setValue(this.estudio.EST_FECH_FIN);
  }

  insertarEstudio(){
    let fechaInicioActual = this.estudio['EST_FECH_INI'];
    let fechaFinActual = this.estudio['EST_FECH_FIN'];
    this.estudio['EST_FECH_INI'] = fechaInicioActual;
    //si no es nulo (si el estudio tiene una fecha fin) entonces se cambia el formato
    if(fechaFinActual!=null)
      this.estudio['EST_FECH_FIN'] = fechaFinActual;
    else
      this.estudio['EST_FECH_FIN'] = "";  
    //la petición se hará si es que sigue cursando el estudio actualmente fechaFinActual==null o si la fecha de inicio es menor a la fecha fin
    if ( fechaFinActual==null || this.esValidoFechas(this.estudioForm.get('est_fech_ini').value , this.estudioForm.get('est_fech_fin').value) ) {
      this.loadingModal = true;
      this.errorModal = false;
      this.estudioService.insertarEstudioPorPostulante(this.estudio,this.id_postulante)
      .subscribe((data)=>{
        this.loadingModal = false;
        this.listarEstudios();
        this.modalService.dismissAll();
        /* Alerta al momento de agregar un estudio del postulante */
        this.alertaGeneral = true;
        this.tipoAlerta = 'success';
        this.mensajeAlerta = "Estudio agregado con éxito.";
      },error=>{
        this.errorModal = true;
        this.loadingModal = false;
        if(error['error']['error'] !== undefined){
          if(error['error']['error'] === "error_deEstadoNoValidoBloqueo"){
            this.estado_postulacion = 3;//para indicar que es un postulante bloqueado, ya que si no se recarga la pagina no se actualiza dicha variable
            this.modalService.open(this.contentPostulacion);
          }else if(error['error']['error'] === "error_deBD")
            this.mensajeModal = "Hubo un error al intentar ejecutar su solicitud para insertar estudio del postulante. Por favor, intente de nuevo";
          else if(error['error']['error'] === "error_deCampo")
            this.mensajeModal = "Los datos ingresados deben respetar los formatos permitidos. Por favor, intente de nuevo.";  
          else if(error['error']['error'] === "error_noExistenciaDeIdEsp")//este código está así en el api (posteriormente un posible cambio del código error_noExistenciaDeIdEsp a error_noExistenciaDeId)
            this.mensajeModal = "No se encontró registro del postulante para insertar su estudio. Por favor, intente de nuevo.";
        }else{
          this.tipoAlerta = "danger"
          this.alertaGeneral = true;
          this.mensajeAlerta = "Hubo un error en la conexión del servidor. Por favor, intente más tarde.";
        }
        this.estudio['EST_FECH_INI'] = fechaInicioActual;
        this.estudio['EST_FECH_FIN'] = fechaFinActual;
      });
    }else{
      this.errorModal = true;
      this.mensajeModal = "La fecha de inicio no debe ser mayor a la fecha de fin. Por favor, intente de nuevo";
    }
  }

  actualizarEstudio(){
    this.errorModal = false;
    this.loadingModal = true;
    this.estaBloqueado()
    .then(good => {
      this.loadingModal = false;
      if(good['error'] === null){
        let fechaInicioActual = this.estudio['EST_FECH_INI'];
        let fechaFinActual = this.estudio['EST_FECH_FIN'];
        this.estudio['EST_FECH_INI'] = fechaInicioActual;
        if(fechaFinActual!=null)
          this.estudio['EST_FECH_FIN'] = fechaFinActual;
        else
          this.estudio['EST_FECH_FIN'] = "";  
        //la petición se hará si es que sigue cursando el estudio actualmente fechaFinActual==null o si la fecha de inicio es menor a la fecha fin
        if ( fechaFinActual==null || this.esValidoFechas(this.estudioForm.get('est_fech_ini').value , this.estudioForm.get('est_fech_fin').value) ) {
          this.loadingModal = true;
          this.errorModal = false;
          this.estudioService.updateEstudios(this.estudio)
          .subscribe((data)=>{
            this.loadingModal = false;
            this.modalService.dismissAll();
            /* Alerta al momento de actualizar el estudio del postulante */
            this.alertaGeneral = true;
            this.tipoAlerta = 'success';
            this.mensajeAlerta = "Estudio actualizado con éxito.";
            this.listarEstudios();
          },error=>{
            this.loadingModal = false;
            this.errorModal = true;
            if(error['error']['error'] !== undefined){
              if(error['error']['error'] === "error_deBD")
                this.mensajeModal = "Hubo un error al intentar ejecutar su solicitud para actualizar el estudio del postulante. Por favor, intente de nuevo";
              else if(error['error']['error'] === "error_deCampo")
                this.mensajeModal = "Los datos ingresados deben respetar los formatos permitidos. Por favor, intente de nuevo.";  
              else if(error['error']['error'] === "error_noExistenciaDeIdEst")//este código está así en el api (posteriormente un posible cambio del código error_noExistenciaDeIdEsp a error_noExistenciaDeId)
                this.mensajeModal = "No se encontró registro del estudio para actualizarlo. Por favor, intente de nuevo.";
            }else{
              this.errorModal = true;
              this.mensajeModal = "Hubo un error al intentar actualizar el estudio del postulante. Por favor, intente de nuevo";
            }
            this.estudio['EST_FECH_INI'] = fechaInicioActual;
            this.estudio['EST_FECH_FIN'] = fechaFinActual;
          });
        }else{
          this.errorModal = true;
          this.mensajeModal = "La fecha de inicio no debe ser mayor a la fecha de fin. Por favor, intente de nuevo";
        }
      }else if(good['error'] === "error_deEstadoNoValidoBloqueo"){
        this.loadingModal = false;
        this.estado_postulacion = 3;//para indicar que es un postulante bloqueado, ya que si no se recarga la pagina no se actualiza dicha variable
        this.modalService.open(this.contentPostulacion);
      }
    })
    .catch(bad =>{
      this.loadingModal = false;
      this.errorModal = true;
      if(bad['error']['error'] !== undefined){
        if(bad['error']['error'] === "error_deBD"){
          this.mensajeModal = "Hubo un error al intentar ejecutar su solicitud. Por favor, intente de nuevo.";
        }
      }else{
        this.mensajeModal = "Hubo un error de conexión al intentar actualizar el estudio del postulante. Por favor, intente de nuevo";
      }
    });
  }

  esValidoFechas(dateInicio: any, dateFin: any): boolean {
    if (dateInicio < dateFin) {
      return true;
    }
    return false;
  }

  /* GET PARA EL FORMULARIO DE ESTUDIOS */
  get est_tipo (){
    return this.estudioForm.get('est_tipo');
  } 
  get est_descripcion (){
    return this.estudioForm.get('est_descripcion');
  }
  get est_institucion (){
    return this.estudioForm.get('est_institucion');
  }
  get est_fech_ini (){
    return this.estudioForm.get('est_fech_ini');
  }
  get est_fech_fin (){
    return this.estudioForm.get('est_fech_fin');
  } 

  
}
