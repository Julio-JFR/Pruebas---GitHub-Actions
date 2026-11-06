import { DatePipe } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbAlert, NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { StorageService } from 'src/app/helpers/storage.service';
import { AuthService } from 'src/app/shared/guard/auth.service';
import { PostulacionService } from '../postulacion/postulacion.service';
import { PostulanteService } from '../postulante.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Estudio } from '../../estudios/estudio.model';
import { EstudiosService } from '../../estudios/estudios.service';
import { ExperienciasLaboralesService } from '../../experiencias-laborales/experiencias-laborales.service';
import { ExperienciaLaboral } from '../../experiencias-laborales/experiencia-laboral.model';

@Component({
  selector: 'app-postulante-laboral-info',
  templateUrl: './postulante-laboral-info.component.html',
  styleUrls: ['./postulante-laboral-info.component.scss']
})
export class PostulanteLaboralInfoComponent implements OnInit {

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

  //Variables para errores
  errorExperiencia: boolean;
  mensajeErrorExperiencia: string
  loadingExp:boolean;
  //Variables para las experiencias laborales con sus contactos
  experienciasLaborales: ExperienciaLaboral[] = [];
  experienciaLaboral: ExperienciaLaboral;
  id_experiencia: number;

  //variables excepcionales para el checkbox para las fechas de fin en estudio y experiencia laboral
  isCheckExperiencia = false;// el checkbox de "en curso" para las fechas de fin estará true por defecto
  experienciaContactoForm:FormGroup;
    
  opacarDateFechaInicioExperiencia = true;
  opacarDateFechaFinExperiencia = true;
  
  @ViewChild('contentPostulacion') contentPostulacion: ElementRef;
  @ViewChild('selfClosingAlert', {static: false}) selfClosingAlert: NgbAlert; 

  constructor(config: NgbModalConfig, private formBuilder:FormBuilder,
    private storageService: StorageService,private postulanteService:PostulanteService,private modalService: NgbModal, private router: Router,
    private postulacionService: PostulacionService, private experienciaLaboralService: ExperienciasLaboralesService,
    private route: ActivatedRoute) { 

    this.id_postulante = parseInt(this.storageService.getString('POST_ID'));
    this.deshabilitarPost = true;//deshabilitar los inputs de los datos del postulante
    this.deshabilitarCuenta = true;// deshabilitar los inputs de los datos de la cuenta del postulante
    config.backdrop = 'static';
    config.keyboard = false;
  }

  ngOnInit(): void {
    this.cargarFormulario();
    this.obtenerDetallesPostulante();
    this.listarExperienciasContactos();
  }

  cargarFormulario(){
    const emailFormat = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    this.experienciaContactoForm = this.formBuilder.group({
      exp_empresa:['',[Validators.required, Validators.pattern('([a-zA-ZñÑáéíóúÁÉÍÓÚ\s][ ]*)+'), Validators.maxLength(20)]],
      exp_especialidad:['',[Validators.required, Validators.pattern('([a-zA-ZñÑáéíóúÁÉÍÓÚ\s][ ]*)+'), Validators.maxLength(20)]],
      exp_descripcion:['',[Validators.required, Validators.maxLength(60)]],
      exp_fech_ini:['',Validators.required],
      exp_fech_fin:['',Validators.required],
      cont_nombres:['',[Validators.required, Validators.pattern('([a-zA-ZñÑáéíóúÁÉÍÓÚ\s][ ]*)+'), Validators.maxLength(50)]],
      cont_apellidos:['',[Validators.required, Validators.pattern('([a-zA-ZñÑáéíóúÁÉÍÓÚ\s][ ]*)+'), Validators.maxLength(30)]],
      cont_email:['',[Validators.pattern(emailFormat), Validators.maxLength(60)]],
      cont_celular:['',[Validators.pattern('[+][0-9]+'), Validators.maxLength(20), Validators.minLength(12)]]
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

 /************************************* Funciones para las experiencias laborales ****************************************/

  //función que determinará el comportamiendo del input de la fecha final de estudio cuando se selecciona el checkbox
  procesoDatosCheckExperiencia(){
    this.isCheckExperiencia = !this.isCheckExperiencia;//se cambia el valor de la variable a su opuesto
    //si el checkbox esta seleccionado se inhabilitado sino se habilita el input de la fecha de fin
    if(this.isCheckExperiencia)
      this.experienciaContactoForm.controls.exp_fech_fin.disable();
    else
      this.experienciaContactoForm.controls.exp_fech_fin.enable(); 

    if(this.isCheckExperiencia)
      this.exp_fech_fin.setValue('');
  }

  listarExperienciasContactos(){
    this.alertaGeneral = false;
    this.errorExperiencia = false;
    this.loadingExp = true;
    this.experienciaLaboralService.listarExperienciasContactos(this.id_postulante)
    .subscribe((data)=>{
      this.loadingExp = false;
      this.experienciasLaborales = data['Resultado'];
    }, error => {
      if(error['error']['error'] !== undefined){
        this.errorExperiencia = true;
        if(error['error']['error'] === "error_deBD")
          this.mensajeErrorExperiencia = "Hubo un error al intentar ejecutar su solicitud para obtener las experiencias laborales del postulante. Por favor, intente de nuevo";
        else if(error['error']['error'] === "error_deCampo")
          this.mensajeErrorExperiencia = "Los datos ingresados deben respetar los formatos permitidos. Por favor, intente de nuevo.";  
        else if(error['error']['error'] === "error_noExistenciaDeId")
          this.mensajeErrorExperiencia = "No se encontró registro del postulante para obtener sus experiencias laborales. Por favor, intente de nuevo.";
      }else{
        this.tipoAlerta = "danger"
        this.alertaGeneral = true;
        this.mensajeAlerta = "Hubo un error en la conexión del servidor. Por favor, intente más tarde.";
      }
      this.loadingExp = false;
    });
  }

  obtenerExperienciaActual(experiencia_laboral){
    this.experienciaLaboral = JSON.parse(JSON.stringify(experiencia_laboral));
    if(this.experienciaLaboral.EXP_FECH_FIN == null){
      // en teoría debe ser verdadero la variable porque se está trabajando en un puesto actualmente pero se coloca lo inverso porque la función this.procesoDatosCheckExperiencia() invierte el valor de la variable y procesa los datos
      this.isCheckExperiencia = false; 
    }else{
      // en teoría debe ser verdadero la variable porque no está trabajando en un puesto actualmente (se registra una experiencia laboral) pero se coloca lo inverso porque la función this.procesoDatosCheckExperiencia() invierte el valor de la variable y procesa los datos
      this.isCheckExperiencia = true;
    }
    this.procesoDatosCheckExperiencia();
    this.modificarExperienciaModal();
  }

  modificarExperienciaModal(){
    this.exp_empresa.setValue(this.experienciaLaboral.EXP_EMPRESA);
    this.exp_especialidad.setValue(this.experienciaLaboral.EXP_ESPECIALIDAD);
    this.exp_descripcion.setValue(this.experienciaLaboral.EXP_DESCRIPCION);
    this.exp_fech_ini.setValue(this.experienciaLaboral.EXP_FECH_INI);
    this.exp_fech_fin.setValue(this.experienciaLaboral.EXP_FECH_FIN);
    this.cont_nombres.setValue(this.experienciaLaboral.CONT_NOMBRES);
    this.cont_apellidos.setValue(this.experienciaLaboral.CONT_APELLIDOS);
    this.cont_email.setValue(this.experienciaLaboral.CONT_EMAIL);
    this.cont_celular.setValue(this.experienciaLaboral.CONT_CELULAR);
  }


  // ***************************** FUNCION PARA EL MODAL ************************** */
  open(content) {
    this.modalService.open(content);
  }

  openExp(content) {
    this.modalService.open(content, { size: 'lg' });
  }
  
  getToday(): string { // Devuelve 4 formatos de fechas, y solo escogemos el primero [0], hasta donde termine en 'T'.
    return new Date().toISOString().split('T')[0];
  }
  
  /* GET PARA EL FORMULARIO DE EXPERIENCIAS CON CONTACTOS */
  get exp_empresa() {
    return this.experienciaContactoForm.get('exp_empresa');
  }
  get exp_especialidad() {
    return this.experienciaContactoForm.get('exp_especialidad');
  }
  get exp_descripcion() {
    return this.experienciaContactoForm.get('exp_descripcion');
  }
  get exp_fech_ini() {
    return this.experienciaContactoForm.get('exp_fech_ini');
  }
  get exp_fech_fin() {
    return this.experienciaContactoForm.get('exp_fech_fin');
  }
  get cont_nombres() {
    return this.experienciaContactoForm.get('cont_nombres');
  }
  get cont_apellidos() {
    return this.experienciaContactoForm.get('cont_apellidos');
  }
  get cont_email() {
    return this.experienciaContactoForm.get('cont_email');
  }
  get cont_celular() {
    return this.experienciaContactoForm.get('cont_celular');
  }

  nuevaExperiencia(){
    this.experienciaLaboral = new ExperienciaLaboral();
    this.experienciaLaboral.EXP_ID = 0;
    this.experienciaContactoForm.reset();// para limpiar todos los campos del modal
  }

  agregarActualizarExperiencia(){
    if(this.experienciaContactoForm.invalid){
      this.errorModal = true;
      this.mensajeModal = "Los datos ingresados son inválidos. Por favor, respete los formatos solicitados e intente de nuevo";
    }else{
      this.obtenerExperienciaForm(this.experienciaContactoForm.value);
      if(this.experienciaLaboral['EXP_ID']==0){
        this.insertarExperiencia();
      }else{
        this.actualizarExperienciaContacto();
      }
    }
  }
  
  obtenerExperienciaForm(experienciaF){
    this.experienciaLaboral.EXP_EMPRESA = experienciaF.exp_empresa;
    this.experienciaLaboral.EXP_ESPECIALIDAD = experienciaF.exp_especialidad;
    this.experienciaLaboral.EXP_DESCRIPCION = experienciaF.exp_descripcion;
    this.experienciaLaboral.EXP_FECH_INI = experienciaF.exp_fech_ini;
    this.experienciaLaboral.EXP_FECH_FIN = experienciaF.exp_fech_fin;
    this.experienciaLaboral.CONT_NOMBRES = experienciaF.cont_nombres;
    this.experienciaLaboral.CONT_APELLIDOS = experienciaF.cont_apellidos;
    this.experienciaLaboral.CONT_EMAIL = experienciaF.cont_email;
    this.experienciaLaboral.CONT_CELULAR = experienciaF.cont_celular;
  }
  
  insertarExperiencia(){
    this.errorModal = false;
    this.loadingModal = true;
    this.estaBloqueado()
    .then(good => {
      if(good['error'] === null){
        let fechaInicioActual = this.experienciaLaboral['EXP_FECH_INI'];
        let fechaFinActual = this.experienciaLaboral['EXP_FECH_FIN'];
        this.experienciaLaboral['EXP_FECH_INI'] = fechaInicioActual;
        //si la fecha fin no es nullo (hay una fecha fin de la experiencia) entonces se cambia el formato
        if(fechaFinActual!=null)
          this.experienciaLaboral['EXP_FECH_FIN'] = fechaFinActual;
        else
          this.experienciaLaboral['EXP_FECH_FIN'] = "";
        //la petición se hará si es que sigue trabajando en un puesto (en la seccion de experiencia laboral) actualmente fechaFinActual==null o si la fecha de inicio es menor a la fecha fin
        if ( fechaFinActual==null || this.esValidoFechas(this.experienciaContactoForm.get('exp_fech_ini').value , this.experienciaContactoForm.get('exp_fech_fin').value) ) {
          this.errorModal = false;
          this.loadingModal = true;
          this.experienciaLaboralService.insertExperienciaConContactoPorPostulante(this.experienciaLaboral,this.id_postulante)
          .subscribe((data)=>{
            this.loadingModal = false;
            this.modalService.dismissAll();
            this.listarExperienciasContactos();
            /* Alerta al momento de agregar una experiencia laboral del postulante */
            this.alertaGeneral = true;
            this.tipoAlerta = 'success';
            this.mensajeAlerta = "Experiencia laboral agregado con éxito.";
            this.cerrarAlerta();
          },error=>{
            this.errorModal = true;
            this.loadingModal = false;
            if(error['error']['error'] !== undefined){
              if(error['error']['error'] === "error_deBD")
                this.mensajeModal = "Hubo un error al intentar ejecutar su solicitud para insertar una experiencia laboral del postulante. Por favor, intente de nuevo";
              else if(error['error']['error'] === "error_deCampo")
                this.mensajeModal = "Los datos ingresados deben respetar los formatos permitidos. Por favor, intente de nuevo.";  
              else if(error['error']['error'] === "error_noExistenciaDeIdEsp")//este código está así en el api (posteriormente un posible cambio del código error_noExistenciaDeIdEsp a error_noExistenciaDeId)
                this.mensajeModal = "No se encontró registro del postulante para insertar su experiencia laboral. Por favor, intente de nuevo.";
            }else{
              this.mensajeModal = "Hubo un error al intentar insertar la experiencia laboral del postulante. Por favor, intente de nuevo";
            }
            this.experienciaLaboral['EXP_FECH_INI'] = fechaInicioActual;
            this.experienciaLaboral['EXP_FECH_FIN'] = fechaFinActual;
            this.cerrarAlerta();
          });
        }else{
          this.errorModal = true;
          this.mensajeModal = "La fecha de inicio no debe ser mayor a la fecha de fin. Por favor, intente de nuevo";
          this.loadingModal=false;
          this.cerrarAlerta();
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
        this.mensajeModal = "Hubo un error de conexión al intentar eliminar el estudio del postulante. Por favor, intente de nuevo";
      }
      this.cerrarAlerta();
    });
  }

  actualizarExperienciaContacto(){
    this.errorModal = false;
    this.loadingModal = true;
    this.estaBloqueado()
    .then(good => {
      if(good['error'] === null){
        let fechaInicioActual = this.experienciaLaboral['EXP_FECH_INI'];
        let fechaFinActual = this.experienciaLaboral['EXP_FECH_FIN'];
        this.experienciaLaboral['EXP_FECH_INI'] = fechaInicioActual;
        //si la fecha fin no es nullo (hay una fecha fin de la experiencia) entonces se cambia el formato
        if(fechaFinActual!=null)
          this.experienciaLaboral['EXP_FECH_FIN'] = fechaFinActual;
        else
          this.experienciaLaboral['EXP_FECH_FIN'] = "";
        //la petición se hará si es que sigue trabajando en un puesto (en la seccion de experiencia laboral) actualmente fechaFinActual==null o si la fecha de inicio es menor a la fecha fin
        if ( fechaFinActual==null || this.esValidoFechas(this.experienciaContactoForm.get('exp_fech_ini').value , this.experienciaContactoForm.get('exp_fech_fin').value) ) {
          this.errorModal = false;
          this.loadingModal = true;
          this.experienciaLaboralService.updateExperienciaLaboralConContactos(this.experienciaLaboral)
          .subscribe((data)=>{
            this.errorModal = false;
            this.loadingModal = false;
            this.modalService.dismissAll();
            /* Alerta al momento de actualizar una experiencia laboral del postulante */
            this.alertaGeneral = true;
            this.tipoAlerta = 'success';
            this.mensajeAlerta = "Experiencia laboral actualizado con éxito.";
            this.listarExperienciasContactos();
            this.cerrarAlerta();
          }, error=>{
            this.errorModal = true;
            this.loadingModal = false;
            if(error['error']['error'] !== undefined){
              if(error['error']['error'] === "error_deBD")
                this.mensajeModal = "Hubo un error al intentar ejecutar su solicitud para actualizar una experiencia laboral del postulante. Por favor, intente de nuevo";
              else if(error['error']['error'] === "error_deCampo")
                this.mensajeModal = "Los datos ingresados deben respetar los formatos permitidos. Por favor, intente de nuevo.";  
              else if(error['error']['error'] === "error_noExistenciaDeIdExp")
                this.mensajeModal = "No se encontró registro de la experiencia laboral para actualizar sus datos. Por favor, intente de nuevo.";
            }else{
              this.mensajeModal = "Hubo un error al intentar inserta la experiencia laboral del postulante. Por favor, intente de nuevo";
            }
            this.cerrarAlerta();
            this.experienciaLaboral['EXP_FECH_INI'] = fechaInicioActual;
            this.experienciaLaboral['EXP_FECH_FIN'] = fechaFinActual;
          });
        }else{
          this.errorModal = true;
          this.mensajeModal = "La fecha de inicio no debe ser mayor a la fecha de fin. Por favor, intente de nuevo";
          this.cerrarAlerta();
        }
      }else if(good['error'] === "error_deEstadoNoValidoBloqueo"){
        this.loadingModal = false;
        this.estado_postulacion = 3;//para indicar que es un postulante bloqueado, ya que si no se recarga la pagina no se actualiza dicha variable
        this.modalService.open(this.contentPostulacion);
      }
      this.cerrarAlerta();
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
      this.cerrarAlerta();
    });
    
  }

  obtenerIdExperiencia(id_experiencia){
    this.id_experiencia = id_experiencia;
  }

  eliminarExperienciaContacto(){
    this.errorModal = false;
    this.loadingModal = true;
    this.estaBloqueado()
    .then(good => {
      if(good['error'] === null){
        this.experienciaLaboralService.eliminarExperienciaContacto(this.id_experiencia)
        .subscribe((data)=>{
          this.loadingModal = false;
          this.modalService.dismissAll();
          this.listarExperienciasContactos();
          /* Alerta al momento de eliminar una experiencia laboral del postulante */
          this.alertaGeneral = true;
          this.tipoAlerta = 'success';
          this.mensajeAlerta = "Experiencia laboral eliminado con éxito.";
          this.cerrarAlerta();
        }, error=>{
        this.cerrarAlerta();
          this.errorModal = true;
          this.loadingModal = false;
          if(error['error']['error'] !== undefined){
            if(error['error']['error'] === "error_deBD")
              this.mensajeModal = "Hubo un error al intentar ejecutar su solicitud para eliminar la experiencia laboral del postulante. Por favor, intente de nuevo";
            else if(error['error']['error'] === "error_deCampo")
              this.mensajeModal = "Los datos ingresados deben respetar los formatos permitidos. Por favor, intente de nuevo.";  
            else if(error['error']['error'] === "error_noExistenciaDeId")
              this.mensajeModal = "No se encontró registro de la experiencia laboral para actualizar sus datos. Por favor, intente de nuevo.";
          }else{
            this.mensajeModal = "Hubo un error al intentar eliminar la experiencia laboral del postulante. Por favor, intente de nuevo";
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

  esValidoFechas(dateInicio: any, dateFin: any): boolean {
    if (dateInicio < dateFin) {
      return true;
    }
    return false;
  }

  cambiarDeStyleDateInicioExperiencia() {
    this.opacarDateFechaInicioExperiencia = false;
  }

  cambiarDeStyleDateFinExperiencia(){
    this.opacarDateFechaFinExperiencia = false;
  }

    // ***************************** FUNCION PARA POSTULAR ************************** */
    insertarPostulacion(){
      this.loadingModal = true;
      this.errorModal = false;
      this.postulacionService.insertarPostulacion(this.id_postulante,this.postulante['POST_EMAIL'])
      .subscribe((data)=>{
        this.loadingModal = false;
        this.modalService.dismissAll();
        this.cerrarAlerta();
        this.router.navigate(['postulante/postulacion']);
      },error=>{
        this.cerrarAlerta()
        if(error['error']['error'] !== undefined){
          if(error['error']['error'] === "error_deEstadoNoValidoBloqueo"){
            this.mensajeModal = "Su cuenta ha sido bloqueada. Por favor, comuníquese con un administrador.";
            this.obtenerDetallesPostulante();
          }if(error['error']['error'] === "error_deBD")
            this.mensajeModal = "Hubo un error al intentar ejecutar su solicitud para realización la postulación. Por favor, intente de nuevo";
          else if(error['error']['error'] === "error_deCampo")
            this.mensajeModal = "Los datos ingresados deben respetar los formatos permitidos. Por favor, intente de nuevo.";  
          else if(error['error']['error'] === "error_noExistenciaDeId")
            this.mensajeModal = "No se encontró registro del postulante para realizar su postulación. Por favor, intente de nuevo.";
          else if(error['error']['error'] === "error_dePostulacionPendiente")
            this.mensajeModal = "No puede postular cuando se tiene una postulación pendiente. Por favor, espere a que un administrador analice su postulación.";
        }else{
          this.mensajeModal = "Hubo un error al intentar postular. Por favor, intente de nuevo";
        }
        this.errorModal = true;
        this.loadingModal = false;
      });
    }
    
  cerrarAlerta(){
    setTimeout(() => {
      if(this.selfClosingAlert) {
        this.selfClosingAlert.close();
      }
      }, 5000);
  }
}
