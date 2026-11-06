import { DatePipe } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { RoutingService } from 'src/app/helpers/routing.service';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { PostulanteService } from '../postulante.service';
import { PostulacionService } from '../postulacion/postulacion.service';
import { StorageService } from '../../../helpers/storage.service';
import { Pais } from '../../paises/pais.model';
import { Region } from '../../regiones/region.model';
import { Provincia } from '../../provincias/provincia.model';
import { Distrito } from '../../distritos/distrito.model';
import { Postulante } from '../postulante.models';
import { EstudiosService } from '../../estudios/estudios.service';
import { TipoEmpresaService } from '../../tipo-empresa/tipo-empresa.service'
import { Estudio } from '../../estudios/estudio.model';
import { ExperienciasLaboralesService } from '../../experiencias-laborales/experiencias-laborales.service';
import { PaisesService } from '../../paises/paises.service';
import { RegionesService } from '../../regiones/regiones.service';
import { ProvinciasService } from '../../provincias/provincias.service';
import { DistritosService } from '../../distritos/distritos.service';
import { UsuariosService } from '../../usuarios/usuarios.service';
import { ExperienciaLaboral } from '../../experiencias-laborales/experiencia-laboral.model';
import { AuthService } from '../../../shared/guard/auth.service';
import { passwordValidation } from 'src/app/shared/modules/password-validation/password-validation.directive';
import {NgbAlert} from '@ng-bootstrap/ng-bootstrap';
import { environment } from 'src/environments/environment';
import { TipoEmpresa } from '../../tipo-empresa/tipo-empresa.model';


//interfaz para la foto
interface HtmlInputEvent extends Event{
  target: HTMLInputElement & EventTarget;
}

@Component({
  selector: 'app-postulante',
  templateUrl: './postulante.component.html',
  styleUrls: ['./postulante.component.scss']
})
export class PostulanteComponent implements OnInit {
  

  @ViewChild('contentPostulacion') contentPostulacion: ElementRef;
  @ViewChild('selfClosingAlert', {static: false}) selfClosingAlert: NgbAlert; 
  // referencia al las artetas que se cierran solas despues de 30 segundos. 
  //Variables reactivos
  cuentaForm: FormGroup;
  postulanteForm: FormGroup;
  estudioForm: FormGroup;
  experienciaContactoForm: FormGroup;
  juridicoForm:FormGroup;
  actualizarJuridico :any; //guarda las variables de los datos juridicos que se van a actualizar

  //Variable para la contraseña
  PASSWORD_CURRENT_ICON = 'fa fa-eye-slash';
  PASSWORD_CURRENT_TYPE = 'password';
  PASSWORD_NEW_ICON = 'fa fa-eye-slash';
  PASSWORD_NEW_TYPE = 'password';

  //Variables para errores
  errorCuenta: boolean;
  errorFoto: boolean;
  errorPost: boolean;
  errorCv: boolean;
  errorCvM: boolean; //es un error que aparecerá como mensaje abajo de la interfaz del cv
  errorEstudio: boolean;
  errorExperiencia: boolean;
  errorModal: boolean;
  mensajeErrorCuenta: string;
  mensajeErrorFoto: string;
  mensajeErrorPostulante: string;
  mensajeErrorCv: string;
  mensajeErrorEstudio: string;
  mensajeErrorExperiencia: string
  mensajeModal: string;
  estado_postulacion: number;
  
  //variable para alertas generales
  alertaGeneral: boolean = false;
  alertaPostulacion: boolean = false;
  tipoAlerta: string;
  mensajeAlerta: string;
  
  //Variables para la cuenta del postulante
  deshabilitarCuenta: boolean;
  postUsu: string;
  postContra: string = "";
  nuevaContra: string = "";

  //Variables para los detalles del postulante
  nombre_postulante: string;
  id_postulante: number;
  postulante: any;
  paises: Pais[];
  regiones: Region[];
  provincias: Provincia[];
  distritos: Distrito[];
  TIPOS_EMPRESA:TipoEmpresa[];
  deshabilitarPost: boolean;
  file: File;
  photoSelected: string | ArrayBuffer;
  NOMBRE_CV: string;
  urlCv: string;
  verIconoUp: boolean;
  
  opacarDateFechaInicioEstudio = true;
  opacarDateFechaFinEstudio = true;
  opacarDateFechaInicioExperiencia = true;
  opacarDateFechaFinExperiencia = true;
  
  //variables excepcionales para el checkbox para las fechas de fin en estudio y experiencia laboral
  isCheckEstudio = false;// el checkbox de "en curso" para las fechas de fin estará true por defecto
  isCheckExperiencia = false;// el checkbox de "en curso" para las fechas de fin estará true por defecto
  
  //Variables para los estudios
  estudios: Estudio[] = [];
  estudio: Estudio;//para añadir o actualizar un estudio
  id_estudio: number;

  //Variables para las experiencias laborales con sus contactos
  experienciasLaborales: ExperienciaLaboral[] = [];
  experienciaLaboral: ExperienciaLaboral;
  visualizarBoton: boolean;
  id_experiencia: number;

  //Variables para los progressbar
  loadingPost: boolean;
  loadingEst: boolean;
  loadingExp: boolean;
  loadingModal: boolean;
  loadingCuenta: boolean;
  loadingCv: boolean;

  //Variables para subir foto
  imageChangedEvent: any = '';
  archivoBase64textString = null;
  imagen64 = null;
  MOSTRAR_FOTO : string;
  errorArchivo: boolean = false;
  croppedImage: any = '';
  isImagen: boolean;
  //datos juridicos
  M_POST_RUC:string;
  M_POST_EMPRESA:string;
  M_POST_RAZON:string;
      

  maxFecha: string;
  eliminacionEstudio: boolean;

  TituloCV:string;

  DOMINIO = environment.domain_url;
  
  @ViewChild('contentBloqueo') contentBloqueo: ElementRef;

  constructor( config: NgbModalConfig, private modalService: NgbModal, private formBuilder: FormBuilder,
          private route: ActivatedRoute, private datePipe: DatePipe,
          private paisService: PaisesService, private regionService: RegionesService,
          private provinciaService: ProvinciasService, private distritoService: DistritosService, 
          private router: Router, private experienciaLaboralService: ExperienciasLaboralesService,
          private estudioService: EstudiosService, private postulanteService: PostulanteService, 
          private postulacionService: PostulacionService, private storageService: StorageService,
          private usuarioService: UsuariosService, private authService: AuthService, private routingService: RoutingService,private tipoEmpresaServicio: TipoEmpresaService) {
    this.id_postulante = parseInt(this.storageService.getString('POST_ID'));
    this.deshabilitarPost = true;//deshabilitar los inputs de los datos del postulante
    this.deshabilitarCuenta = true;// deshabilitar los inputs de los datos de la cuenta del postulante
    config.backdrop = 'static';
    config.keyboard = false;
  }
  
  ngOnInit(): void {
    this.obtenerFechaMinima();
    this.obtenerCuenta();
    this.obtenerDetallesPostulante();
    this.obtenerTipoEmpresa();
    this.listarEstudios();
    this.listarExperienciasContactos();
    //this.obtenerPaises();Neph 
    this.validacionesFormularios();
    this.listarCv();
    this.cuenta_alias.setValue(this.storageService.getString('USE_USUARIO'));
  }

  validacionesFormularios(){
    const emailFormat = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    this.cuentaForm =  this.formBuilder.group({
      cuenta_alias: ['',[Validators.required, Validators.maxLength(15)]],
      cuenta_contra: ['',[Validators.minLength(8), Validators.maxLength(20)]],
      cuenta_contra_nueva: ['',[Validators.minLength(8), Validators.maxLength(20),passwordValidation()]]
    });
    
    this.postulanteForm = this.formBuilder.group({
      post_nombres: ['', [Validators.required, Validators.pattern('([a-zA-ZñÑáéíóúÁÉÍÓÚ\s][ ]*)+'), Validators.maxLength(50)]],
      post_ape_pat: ['', [Validators.required, Validators.pattern('([a-zA-ZñÑáéíóúÁÉÍÓÚ\s][ ]*)+'), Validators.maxLength(30)]],
      post_ape_mat: ['', [Validators.required, Validators.pattern('([a-zA-ZñÑáéíóúÁÉÍÓÚ\s][ ]*)+'), Validators.maxLength(30)]],
      post_email: ['', [Validators.required, Validators.pattern(emailFormat), Validators.maxLength(60)]],
      post_celular: ['',[Validators.required, Validators.pattern('[+][0-9]+'), Validators.maxLength(20), Validators.minLength(12)]],
      post_dni: ['', [Validators.required, Validators.pattern('[0-9]+'), Validators.minLength(8), Validators.maxLength(8)]],
      post_ruc: ['', [Validators.required, Validators.pattern(/^([0-9])*$/), Validators.maxLength(11), Validators.minLength(11)]],
      post_sexo: ['', Validators.required],
      post_nacimiento: ['', Validators.required],
      post_direccion: ['', [Validators.required,Validators.maxLength(100)]],
      post_pai_id: ['', Validators.required],
      post_reg_id: ['', Validators.required],
      post_pro_id: ['', Validators.required],
      post_dist_id: ['', Validators.required]
    });

    this.estudioForm = this.formBuilder.group({
      est_tipo:['', [Validators.required, Validators.pattern('([a-zA-ZñÑáéíóúÁÉÍÓÚ\s][ ]*)+'), Validators.maxLength(20)]],
      est_descripcion:['', [Validators.required, Validators.maxLength(60)],],
      est_institucion:['', [Validators.required, Validators.maxLength(20)],],
      est_fech_ini: ['', Validators.required],
      est_fech_fin: ['', Validators.required]
    });

    this.experienciaContactoForm = this.formBuilder.group({
      exp_empresa:['',[Validators.required, Validators.pattern('([a-zA-ZñÑáéíóúÁÉÍÓÚ\s][ ]*)+'), Validators.maxLength(20)]],
      exp_especialidad:['',[Validators.required, Validators.pattern('([a-zA-ZñÑáéíóúÁÉÍÓÚ\s][ ]*)+'), Validators.maxLength(20)]],
      exp_descripcion:['',[Validators.required, Validators.maxLength(60)]],
      exp_fech_ini:['',Validators.required],
      exp_fech_fin:['',Validators.required],
      cont_nombres:['',[Validators.required, Validators.pattern('([a-zA-ZñÑáéíóúÁÉÍÓÚ\s][ ]*)+'), Validators.maxLength(50)]],
      cont_apellidos:['',[Validators.required, Validators.pattern('([a-zA-ZñÑáéíóúÁÉÍÓÚ\s][ ]*)+'), Validators.maxLength(30)]],
      cont_email:['',[Validators.required,Validators.pattern(emailFormat), Validators.maxLength(60)]],
      cont_celular:['',[Validators.required,Validators.pattern('[+][0-9]+'), Validators.maxLength(20), Validators.minLength(12)]]
    });

    this.juridicoForm = this.formBuilder.group(
      {
        ruc: ['', [Validators.required, Validators.pattern(/^([0-9])*$/), Validators.maxLength(11), Validators.minLength(11)]],
        razonSocial: ['', [Validators.required, Validators.pattern('[a-zñáéíóú. A-ZÑÁÉÍÓÚ & 0-9]+'), Validators.maxLength(100)]],
        tipoEmpresa: ['', Validators.required]
      }
    );
  }
  
  /************************************* Funciones para los detalles del postulante ****************************************/
  mostrarFoto(event: HtmlInputEvent): void{
    if(event.target.files && event.target.files[0]){
      this.file = <File>event.target.files[0];
      //image preview
      const reader = new FileReader();
      reader.onload = e =>this.photoSelected = reader.result;
      reader.readAsDataURL(this.file);
    }
  }

  seleccionarArchivo(event): any {
    const files = event.target.files;
    const file = files[0];
    if (file != null || file !== undefined) {
      if (files && file) {
        const reader = new FileReader();
        reader.onload = this._handleReaderLoaded.bind(this);
        reader.readAsBinaryString(file);
      }
      this.errorArchivo = false;
    } else {
      this.archivoBase64textString = null;
      this.errorArchivo = true;
    }
  }

  _handleReaderLoaded(readerEvent): any {
    const binaryString = readerEvent.target.result;
    if (binaryString != null || binaryString !== undefined) {
      this.archivoBase64textString = btoa(binaryString);
      this.actualizarCvPostulante();
    } else {
      this.archivoBase64textString = null;
    }
  }
  /********************** Función para subir la foto*********************/
  //función para "convertir" a base64 la imagen
  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
    this.imagen64 = this.croppedImage.toString().slice(22);
  }

  subirImagen(event) {
    let files = event.target.files;
    let extensionArchivo;
    if(files.length !== 0){
      let file = files[0];
      extensionArchivo = file.name.slice((file.name.lastIndexOf(".") - 1 >>> 0) + 2).toUpperCase();
      if ( extensionArchivo === 'JPG' || extensionArchivo === 'JPEG' || extensionArchivo === 'PNG'  ) {
        this.errorFoto = false;
        this.imageChangedEvent = event;
        if (event.target.files && event.target.files[0]) {
          this.imageCropped(event);
        }
        this.isImagen = true;
      } else {
        this.imageChangedEvent = '';
        this.mensajeErrorFoto = 'Error! : solo se admite imágenes con extensiones .png, .jpeg, .jpg';
        this.errorFoto = true;
      }
    }else
      this.imageChangedEvent = ''; 
  }
  
  //rescatará el alias y la foto del postulante
  obtenerCuenta(){
    this.alertaGeneral = false;
    this.errorCuenta = false;
    this.loadingCuenta = true;
    this.postulanteService.obtenerCuentaPostulante(this.id_postulante)
    .subscribe((data)=>{
      this.loadingCuenta = false;
      this.cuenta_alias.setValue(data['Resultado']['POST_ALIAS']);
      this.MOSTRAR_FOTO = data['Resultado']['POST_FOTO'];
    }, error=>{
      this.MOSTRAR_FOTO = "";
      this.loadingCuenta = false;
      if(error['error']['error'] !== undefined){
        this.errorCuenta = true;
        if(error['error']['error'] === "error_deBD")
          this.mensajeErrorCuenta = "Hubo un error al intentar ejecutar su solicitud para obtener la cuenta del postulante. Por favor, intente de nuevo";
        else if(error['error']['error'] === "error_noExistenciaDeId")
          this.mensajeErrorCuenta = "No se encontró registro del postulante para obtener su cuenta. Por favor, intente de nuevo.";
        else if(error['error']['error'] === "error_deCampo")
          this.mensajeErrorCuenta = "Los datos ingresados deben respetar los formatos permitidos. Por favor, intente de nuevo.";
      }else{
        this.tipoAlerta = "danger";
        this.alertaGeneral = true;
        this.mensajeAlerta = "Hubo un error en la conexión del servidor. Por favor, intente más tarde.";
      }
    });
  }

  actualizarCuenta(){
    this.alertaGeneral = false;
    if(this.cuentaForm.invalid){
      this.errorCuenta = true;
      this.mensajeErrorCuenta = "Debe ingresar correctamente los datos. Por favor, intente de nuevo";
    }else{
      this.errorCuenta = false;
      this.loadingCuenta = true;
      let usuario = this.cuentaForm.value;
      this.postUsu = usuario.cuenta_alias;
      this.postContra = usuario.cuenta_contra;
      this.nuevaContra = usuario.cuenta_contra_nueva;
      this.postContra = (this.postContra == null)? '':this.postContra;//si es null despues de capturar el dato del html entonces se cambia a vacio
      this.nuevaContra = (this.nuevaContra == null)? '':this.nuevaContra;//si es null despues de capturar el dato del html entonces se cambia a vacio
      if((this.postContra != '' && this.nuevaContra != '') && this.postContra === this.nuevaContra){
        this.errorCuenta = true;
        this.loadingCuenta = false;
        this.mensajeErrorCuenta = "La nueva contraseña no debe ser igual a la actual. Por favor, intente de nuevo."
      }else{
        this.postulanteService.actualizarCuenta(this.postUsu,this.id_postulante,this.postContra,this.nuevaContra)
        .subscribe(data=>{
          this.alertaGeneral = true;
          this.tipoAlerta = "success";
          this.mensajeAlerta = "Se ha actualizado correctamente los datos de su cuenta.";
          this.deshabilitarCuenta = true;
          this.loadingCuenta = false;
          this.cerrarAlerta();
          this.usuarioService.usuarioUpdated(this.postUsu);
          //se verifica que se esté actualizando el alias y su contraseña o solamente el alias
          if(this.nuevaContra != ""){
            this.actualizarAutorizacion()
            .then(
              ()=>{
                this.obtenerCuenta();
              }
            );
          }else{
            this.obtenerCuenta();
          }
        }, error=>{
          this.loadingCuenta = false;
          if(error['error']['error'] !== undefined){
            this.errorCuenta = true;
            if(error['error']['error'] === "error_deEstadoNoValidoBloqueo"){
              this.errorCuenta = false;//se pone false para que no aparezca el elemento de alerta
              this.estado_postulacion = 3;//para indicar que es un postulante bloqueado, ya que si no se recarga la pagina no se actualiza dicha variable
              this.modalService.open(this.contentPostulacion);
            }else if(error['error']['error'] === "error_deBD")
              this.mensajeErrorCuenta = "Hubo un error al intentar ejecutar su solicitud. Por favor, intente de nuevo";
            else if(error['error']['error'] === "error_deCampo")
              this.mensajeErrorCuenta = "Los datos ingresados deben respetar los formatos permitidos. Por favor, intente de nuevo.";
            else if(error['error']['error'] === "error_noExistenciaDeId")
              this.mensajeErrorCuenta = "No se encontró registro del postulante para actualizar su cuenta. Por favor, intente de nuevo.";
            else if(error['error']['error'] === "error_deContraseniaActual")
              this.mensajeErrorCuenta = "Para actualizar su contraseña debe ingresar correctamente su contraseña actual. Por favor, intente de nuevo.";
            else if(error['error']['error'] === "error_deContraNoVacio")
              this.mensajeErrorCuenta = "Los campos contraseña actual y nueva contraseña tienen que tener datos para actualizar su contraseña. Por favor, intente de nuevo.";
            else if(error['error']['error'] === "error_deAliasNoValido")
              this.mensajeErrorCuenta = "No puede actualizar su alias con uno ya existente. Por favor, intente de nuveo"; 
            
          }else{
            this.tipoAlerta = "danger";
            this.alertaGeneral = true;
            this.mensajeAlerta = "Hubo un error en la conexión del servidor. Por favor, intente más tarde.";
          }
        }); 
      }
    }
    this.cuentaForm.reset();
  }

  cerrarAlerta(){
    setTimeout(() => {
      this.errorModal=false;
      this.mensajeModal="";
    }, 5000);
  }

  actualizarAutorizacion = () => {
    let autorizacionPromise = new Promise((resolve,reject)=>{
    let cantidad = this.postUsu.length;
    let firstMitad, secondMitad;
    let codigoAscii: string = '';
    let textoCompleto: string;
    let dividir;
    let postulante = new Postulante();
    postulante.POST_ALIAS = this.postUsu;
    postulante.POST_CONTRASENIA = this.nuevaContra;
    this.postulanteService.verificarCredenciales(postulante)
      .subscribe((respuesta)=>{
        if(respuesta.exito) //Credentials are correct
        {
            for ( let i=0; i< cantidad ; i++){
              codigoAscii = codigoAscii + this.postUsu[i].charCodeAt(0).toString();
            }
            cantidad = codigoAscii.length;
            dividir = cantidad/2;
            firstMitad = codigoAscii.substring(0,Math.round(dividir));
            secondMitad = codigoAscii.substring(Math.round(dividir),codigoAscii.length);
            textoCompleto = cantidad + "$$" + firstMitad + respuesta.autenticar + secondMitad;
            this.storageService.storeString('USE_SUB', textoCompleto);//todo el valor de la cabecera
            this.storageService.storeString('TIPO_SESION',"0");//si es 0 es postulante, si es 1 es un usuario (cliente o especialista)
            this.storageService.storeString('USE_USUARIO', this.postUsu);
            this.storageService.storeString('POST_ID',respuesta.id_postulante);
        }
      }, error=>{
        /* this.error = true;  
        if(error['error']['error'] !== undefined){
          if(error['error']['error'] === "error_deBD")
            this.mensajeError = "Hubo un error al intentar ejecutar su solicitud. Por favor, intente de nuevo";
          else if(error['error']['error'] === "error_deAlias")
            this.mensajeError = "No se puede iniciar sesión. Verifique sus credenciales, por favor.";
          else if(error['error']['error'] === "error_deContra")
            this.mensajeError = "No se puede iniciar sesión. Escriba correctamente su contraseña, por favor.";
          else if(error['error']['error'] === "error_deEstadoNoValido")
            this.mensajeError = "Su postulación ya ha sido aceptada. Ingrese como una cuenta especilista, por favor."
          else if(error['error']['error'] === "error_deCampo")
            this.mensajeError = "Los datos ingresados no son válidos. El alias no debe exceder los 15 caracteres y la contraseña no debe ser menor a 8 caracteres y exceder los 20 caracteres";
          }else{
          this.mensajeError = "Hubo un error al validar tus credenciales. Por favor, intenta nuevamente";
        } */
      });
    }); 
    return autorizacionPromise;
  }

  actualizarFoto(){
    this.alertaGeneral = false;
    if(this.errorFoto == false){
      this.loadingModal = true;
      this.postulanteService.actualizarFoto(this.id_postulante,this.imagen64)
      .subscribe(data=>{
        this.deshabilitarCuenta = true;
        this.loadingModal = false;
        this.modalService.dismissAll();
        this.obtenerCuenta();
      }, error=>{
        this.deshabilitarCuenta = true;
        this.loadingModal = false;
        if(error['error']['error'] !== undefined){
          if(error['error']['error'] === "error_deEstadoNoValidoBloqueo"){
            this.estado_postulacion = 3;//para indicar que es un postulante bloqueado, ya que si no se recarga la pagina no se actualiza dicha variable
            this.modalService.open(this.contentPostulacion);
          }else if(error['error']['error'] === "error_deBD")
            this.mensajeModal = "Hubo un error al intentar ejecutar su solicitud. Por favor, intente de nuevo";
          else if(error['error']['error'] === "error_deCampo")
            this.mensajeModal = "Los datos ingresados deben respetar los formatos permitidos. Por favor, intente de nuevo.";
          else if(error['error']['error'] === "error_noExistenciaDeId")
            this.mensajeModal = "No se encontró registro del postulante para actualizar su foto. Por favor, intente de nuevo.";
        }else{
          this.mensajeModal = "Hubo un error en la conexión del servidor. Por favor, intente más tarde.";
        }
      });
    }else{
      this.errorModal = true;
      this.mensajeModal = "La foto no tiene un formato permitido. Por favor, intente de nuevo.";
      this.cerrarAlerta();
    }
  }  

  //función para cambiar el ícono de la contraseña actual
  cambiarVistaContrasenaActual() {
    if (this.PASSWORD_CURRENT_ICON === 'fa fa-eye-slash') {
      this.PASSWORD_CURRENT_ICON = 'fa fa-eye';
      this.PASSWORD_CURRENT_TYPE = 'text';
    } else {
      this.PASSWORD_CURRENT_ICON = 'fa fa-eye-slash';
      this.PASSWORD_CURRENT_TYPE = 'password';
    }
  }

//función para cambiar el ícono de la contraseña nueva
  cambiarVistaContrasenaNueva() {
    if (this.PASSWORD_NEW_ICON === 'fa fa-eye-slash') {
      this.PASSWORD_NEW_ICON = 'fa fa-eye';
      this.PASSWORD_NEW_TYPE = 'text';
    } else {
      this.PASSWORD_NEW_ICON = 'fa fa-eye-slash';
      this.PASSWORD_NEW_TYPE = 'password';
    }
  }
  
  obtenerDetallesPostulante() {
    this.alertaGeneral = false;
    this.errorPost = false;
    this.loadingPost = true;
    this.postulanteService.obtenerPostulante(this.id_postulante)
    .subscribe((data) => {
      this.deshabilitarPost = true;
      this.loadingPost = false;
      this.postulante = data['Resultado'];
      this.estado_postulacion = this.postulante['POST_ESTADO'];// estado del postulante
      if (this.estado_postulacion == 2){
        this.tipoAlerta = "warning";
        this.alertaPostulacion = true;
        this.mensajeAlerta = "Tienes una postulación pendiente. Por favor, espera a que esta sea evaluada para que actualices tus datos.";
    }
      if(this.estado_postulacion == 3)
        this.open(this.contentBloqueo);
      this.nombre_postulante =  `${this.postulante['POST_NOMBRES']} ${this.postulante['POST_APE_PAT']} ${this.postulante['POST_APE_MAT']}`;
      if(this.postulante.POST_TIPO == 1){
        this.M_POST_RUC = data['Resultado']['JUR_RUC'];
        this.M_POST_EMPRESA = data['Resultado']['TIP_EMP_ID'];
        this.M_POST_RAZON = data['Resultado']['JUR_RAZ_SOCIAL'];
      }
      this.modificarPostulanteForm();
      this.obtenerPaises();
    },error => {
      if(error['error']['error'] !== undefined){
        this.errorPost = true;
        if(error['error']['error'] === "error_deBD"){
          this.mensajeErrorPostulante = "Hubo un error al intentar ejecutar su solicitud para obtener los datos del postulante. Por favor, intente de nuevo";
        }else if(error['error']['error'] === "error_noExistenciaDeId")
          this.mensajeErrorPostulante = "No se encontró registro del postulante para obtener sus datos. Por favor, intente de nuevo.";
        else if(error['error']['error'] === "error_deCampo")
          this.mensajeErrorPostulante = "Los datos ingresados deben respetar los formatos permitidos. Por favor, intente de nuevo.";
      }else{
        this.tipoAlerta = "danger";
        this.alertaGeneral = true;
        this.mensajeAlerta = "Hubo un error en la conexión del servidor. Por favor, intente más tarde.";
      }
      this.loadingPost = false;
    });
  }

  //Si bien esta función envia todo el objeto postulante, no todos sus campos se enviaran como json al api
  actualizarPostulante(){
    this.errorPost = false;
    let fechaNacimiento = this.postulante['POST_FECH_NACIMIENTO'];
    this.postulante['POST_FECH_NACIMIENTO'] = fechaNacimiento;
    this.loadingPost = true;
    this.postulanteService.actualizarPostulante(this.postulante)
    .subscribe((data)=>{
      this.alertaGeneral = true;
      this.tipoAlerta = "success";
      this.mensajeAlerta = "Se ha actualizado correctamente el postulante";
      this.loadingPost = false;
      this.cerrarAlerta();
      this.obtenerDetallesPostulante();
    }, error=>{
      if(error['error']['error'] !== undefined){
        this.errorPost = true;
        if(error['error']['error'] === "error_deEstadoNoValidoBloqueo"){
          this.errorPost = false;//se pone false para que no aparezca el elemento de alerta
          this.estado_postulacion = 3;//para indicar que es un postulante bloqueado, ya que si no se recarga la pagina no se actualiza dicha variable
          this.modalService.open(this.contentPostulacion);
        }else if(error['error']['error'] === "error_deBD")
          this.mensajeErrorPostulante = "Hubo un error al intentar ejecutar su solicitud para actualizar los datos del postulante. Por favor, intente de nuevo";
        else if(error['error']['error'] === "error_noExistenciaDeId")
          this.mensajeErrorPostulante = "No se encontró registro del postulante para actualizar sus datos. Por favor, intente de nuevo.";
        else if(error['error']['error'] === "error_deCampo")
          this.mensajeErrorPostulante = "Los datos ingresados deben respetar los formatos permitidos. Por favor, intente de nuevo.";
        else if(error['error']['error'] === "error_deExistenciaDeEmail"){
          this.mensajeErrorPostulante = "El email ya existe. Por favor , ingrese nuevamente";}
        else if(error['error']['error'] === "error_deExistenciaDeDNI")
          this.mensajeErrorPostulante = "El DNI ya existe. Por favor , ingrese nuevamente";
      }else{
        this.tipoAlerta = "danger"
        this.alertaGeneral = true;
        this.mensajeAlerta = "Hubo un error en la conexión del servidor. Por favor, intente más tarde.";
      }
      this.postulante['POST_FECH_NACIMIENTO'] = fechaNacimiento;
      this.loadingPost = false;
    });
  }
  
  //función que mostrará los datos del postulante al html
  modificarPostulanteForm(){
    this.post_nombres.setValue(this.postulante['POST_NOMBRES']);
    this.post_ape_pat.setValue(this.postulante['POST_APE_PAT']);
    this.post_ape_mat.setValue(this.postulante['POST_APE_MAT']);
    this.post_email.setValue(this.postulante['POST_EMAIL']);
    this.post_celular.setValue(this.postulante['POST_CELULAR']);
    this.post_dni.setValue(this.postulante['POST_DNI']);
    this.post_ruc.setValue(this.postulante['POST_RUC']);
    this.post_sexo.setValue(this.postulante['POST_SEXO']);
    this.post_nacimiento.setValue(this.postulante['POST_FECH_NACIMIENTO']);
    this.post_direccion.setValue(this.postulante['POST_DIRECCION']);
    this.post_pai_id.setValue(this.postulante['PAI_ID']);
    this.post_reg_id.setValue(this.postulante['REG_ID']);
    this.post_pro_id.setValue(this.postulante['PRO_ID']);
    this.post_dist_id.setValue(this.postulante['DIST_ID']);
    this.ruc.setValue(this.M_POST_RUC);
    this.razonSocial.setValue(this.M_POST_RAZON);
    this.tipoEmpresa.setValue(this.M_POST_EMPRESA);
  }

  guardarDatosPostulantes(postulanteF){
    this.postulante['POST_NOMBRES'] = postulanteF.post_nombres;
    this.postulante['POST_APE_PAT'] = postulanteF.post_ape_pat;
    this.postulante['POST_APE_MAT'] = postulanteF.post_ape_mat;
    this.postulante['POST_EMAIL'] = postulanteF.post_email;
    this.postulante['POST_CELULAR'] = postulanteF.post_celular;
    this.postulante['POST_DNI'] = postulanteF.post_dni;
    this.postulante['POST_RUC'] = postulanteF.post_ruc;
    this.postulante['POST_SEXO'] = postulanteF.post_sexo;
    this.postulante['POST_FECH_NACIMIENTO'] = postulanteF.post_nacimiento;
    this.postulante['POST_DIRECCION'] = postulanteF.post_direccion;
    this.postulante['PAI_ID'] = postulanteF.post_pai_id;
    this.postulante['REG_ID'] = postulanteF.post_reg_id;
    this.postulante['PRO_ID'] = postulanteF.post_pro_id;
    this.postulante['DIST_ID'] = postulanteF.post_dist_id;
    this.actualizarPostulante();
  }
  guardarDatosJuridicos(juridicosF){
    if (this.juridicoForm.invalid) {
      this.juridicoForm.markAllAsTouched();
      return;
    }
    this.actualizarJuridico = {
      'JUR_RUC':juridicosF.ruc,
      'JUR_RAZ_SOCIAL':juridicosF.razonSocial,
      'TIP_EMP_ID':juridicosF.tipoEmpresa,
      'POST_ID':this.id_postulante
    }
    this.actualizarJuridicoPostulante();
  }
  actualizarJuridicoPostulante(){
    this.errorPost = false;
    this.loadingPost = true;
    this.postulanteService.actualizarDatosJuridicosPostulante(this.actualizarJuridico)
    .subscribe((data)=>{
      this.alertaGeneral = true;
      this.tipoAlerta = "success";
      this.mensajeAlerta = "Se ha actualizado correctamente el postulante";
      this.loadingPost = false;
      this.cerrarAlerta();
      this.obtenerDetallesPostulante();
    }, error=>{
      if(error['error']['error'] !== undefined){
        this.errorPost = true;
        if(error['error']['error'] === "error_deEstadoNoValidoBloqueo"){
          this.errorPost = false;//se pone false para que no aparezca el elemento de alerta
          this.estado_postulacion = 3;//para indicar que es un postulante bloqueado, ya que si no se recarga la pagina no se actualiza dicha variable
          this.modalService.open(this.contentPostulacion);
        }else if(error['error']['error'] === "error_deBD")
          this.mensajeErrorPostulante = "Hubo un error al intentar ejecutar su solicitud para actualizar los datos del postulante. Por favor, intente de nuevo";
        else if(error['error']['error'] === "error_noExistenciaDeId")
          this.mensajeErrorPostulante = "No se encontró registro del postulante para actualizar sus datos. Por favor, intente de nuevo.";
        else if(error['error']['error'] === "error_deCampo")
          this.mensajeErrorPostulante = "Los datos ingresados deben respetar los formatos permitidos. Por favor, intente de nuevo.";
        else if(error['error']['error'] === "error_deRucExistente"){
          this.mensajeErrorPostulante = "El RUC ya existe. Por favor , ingrese nuevamente";}
        else if(error['error']['error'] === "error_deIdEmpresaNoExistente")
          this.mensajeErrorPostulante = "La empresa seleccionada no existe. Por favor , seleccione nuevamente";
      }else{
        this.tipoAlerta = "danger"
        this.alertaGeneral = true;
        this.mensajeAlerta = "Hubo un error en la conexión del servidor. Por favor, intente más tarde.";
      }
      this.loadingPost = false;
    });
  }
  obtenerTipoEmpresa() {
    this.tipoEmpresaServicio.getTipoEmpresa().subscribe( data => {
      this.TIPOS_EMPRESA = data['Resultado'];
    }, error => {
      this.tipoAlerta = 'danger';
      this.loadingPost = false;
      this.alertaGeneral = true;
      if (error['error']['error'] !== undefined) {
        if (error['error']['error'] === 'error_deBD') {
            this.mensajeAlerta = 'No se pudo obtener los datos, debido a una falla de conexión. Por favor, intente otra vez.';
        }
      } else {
        this.mensajeAlerta = 'Hubo un error al intentar rescatar los tipos de empresa. Por favor, intente de nuevo';
      }
    } );
  }

  obtenerPaises(){
    this.alertaGeneral = false;
    this.paisService.getPaises()
    .subscribe((data)=>{
      this.paises = data['Resultado'];
      this.obtenerRegiones();
    }, error=>{
    });
  }

  obtenerRegiones(){
    this.alertaGeneral = false;
    if(this.post_pai_id.value==null){
      this.regiones = []; this.provincias = []; this.distritos = [];
      this.post_reg_id.setValue(null); this.post_pro_id.setValue(null);
      this.post_dist_id.setValue(null);
    }else{
      this.regionService.getRegiones(this.post_pai_id.value)
      .subscribe((data)=>{
        this.regiones = data['Resultado'];
        if(this.post_reg_id.value!=null)
          this.obtenerProvincias();
        else{
          
        }
      });
    }
  }

  obtenerProvincias(){
    this.alertaGeneral = false;
    if(this.post_reg_id.value==null){
      this.provincias = []; this.distritos = [];
      this.post_pro_id.setValue(null);
      this.post_dist_id.setValue(null);
    }else{
      this.provinciaService.getProvincias(this.post_reg_id.value)
      .subscribe((data)=>{
        this.provincias = data['Resultado'];
        if(this.post_pro_id.value!=null)
          this.obtenerDistritos();
      },error=>{});
    }
  }

  obtenerDistritos(){
    this.alertaGeneral = false;
    if(this.post_pro_id.value==null){
      this.distritos = [];
      this.post_dist_id.setValue(null);
    }else{
      this.distritoService.getDistrito(this.post_pro_id.value)
      .subscribe((data)=>{
        this.distritos = data['Resultado'];
      },error=>{});
    }
  }

  obtenerCv(event){
    let files = event.target.files;
    let extensionArchivo;
    if(files.length !== 0){
      let file = files[0];
      extensionArchivo = file.name.slice((file.name.lastIndexOf(".") - 1 >>> 0) + 2).toUpperCase();
      if(extensionArchivo === "PDF"){
        this.errorCvM = false;
        this.NOMBRE_CV = file.name;
        this.verIconoUp = true;
        this.seleccionarArchivo(event);
      }else{
        this.errorCvM = true;
        this.mensajeErrorCv = "El formato solo permite archivos con extensión .pdf";
      }
    }
  }

  listarCv(){
    this.alertaGeneral = false;
    this.errorCv = false;
    this.loadingCv = true;
    this.postulanteService.listarCv(this.id_postulante).
    subscribe((data)=>{
      this.loadingCv = false;
      this.urlCv = data['Resultado'];
      let separadores = this.urlCv.split("/");
      this.NOMBRE_CV = separadores[separadores.length-1];
    },error=>{
      if(error['error']['error'] !== undefined){
        this.errorCv = true;
        if(error['error']['error'] === "error_deBD")
          this.mensajeErrorCv = "Hubo un error al intentar ejecutar su solicitud para obtener el cv del postulante. Por favor, intente de nuevo";
        else if(error['error']['error'] === "error_noExistenciaDeId")
          this.mensajeErrorCv = "No se encontró registro del postulante para obtener su cv. Por favor, intente de nuevo.";
        else if(error['error']['error'] === "error_deCampo")
          this.mensajeErrorCv = "Los datos ingresados deben respetar los formatos permitidos. Por favor, intente de nuevo.";  
        else if(error['error']['error'] === "error_deEstadoNoValidoBloqueo"){
          this.errorCv = false;
          this.alertaGeneral = true;
          this.tipoAlerta = "danger"
          this.mensajeErrorCv = "No se puede obtener el cv de un postulante bloqueado. Por favor, intente de nuevo.";
        }
      }else{
        this.tipoAlerta = "danger"
        this.alertaGeneral = true;
        this.mensajeAlerta = "Hubo un error en la conexión del servidor. Por favor, intente más tarde.";
      }
      this.loadingCv = false;
    });
  }

  actualizarCvPostulante(){
    this.alertaGeneral = false;
    this.errorCv = false;
    this.loadingCv = true;
    this.postulanteService.actualizarCvPostulante(this.id_postulante,this.archivoBase64textString)
    .subscribe((data)=>{
      this.loadingCv = false;
      this.verIconoUp = false;
      this.NOMBRE_CV = "se subió correctamente";
      this.listarCv();
      this.alertaGeneral = true;
      this.tipoAlerta = "success";
      this.mensajeAlerta = "Se ha actualizado correctamente su cv.";
      this.cerrarAlerta();
    },error=>{
      if(error['error']['error'] !== undefined){
        this.errorCv = true;
        if(error['error']['error'] === "error_deEstadoNoValidoBloqueo"){
          this.errorCv = false;// se pone falso porque no se mostrará una alerta aca, sino se abrirá un modal
          this.estado_postulacion = 3;//para indicar que es un postulante bloqueado, ya que si no se recarga la pagina no se actualiza dicha variable
          this.modalService.open(this.contentPostulacion);
        }else if(error['error']['error'] === "error_deBD")
          this.mensajeErrorCv = "Hubo un error al intentar ejecutar su solicitud para actualizar el cv del postulante. Por favor, intente de nuevo";
        else if(error['error']['error'] === "error_noExistenciaDeId")
          this.mensajeErrorCv = "No se encontró registro del postulante para actualizar su cv. Por favor, intente de nuevo.";
        else if(error['error']['error'] === "error_deCampo")
          this.mensajeErrorCv = "Los datos ingresados deben respetar los formatos permitidos. Por favor, intente de nuevo."; 
      }else{
        this.tipoAlerta = "danger"
        this.alertaGeneral = true;
        this.mensajeAlerta = "Hubo un error en la conexión del servidor. Por favor, intente más tarde.";
      }
      this.loadingCv = false;
    });
  }

  /************************************* Funciones para los estudios ****************************************/

  //función que determinará el comportamiendo del input de la fecha final de estudio cuando se selecciona el checkbox
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

  agregarActualizar(){
    if(this.estudioForm.invalid){
      this.errorModal = true;
      this.mensajeModal = "Los datos ingresados son inválidos. Por favor, respete los formatos solicitados e intente de nuevo";
      this.cerrarAlerta();
    }else{
      this.obtenerEstudioForm(this.estudioForm.value);
      if(this.estudio['EST_ID']!=0){
        this.actualizarEstudio();
      }else{
        this.insertarEstudio();
      }
    }
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
        this.cerrarAlerta();
      });
    }else{
      this.errorModal = true;
      this.mensajeModal = "La fecha de inicio no debe ser mayor a la fecha de fin. Por favor, intente de nuevo";
      this.cerrarAlerta();
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
            this.cerrarAlerta();
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
      this.cerrarAlerta();
    });
  }

  nuevoEstudio(){
    this.estudio = new Estudio();
    this.estudio.EST_ID = 0;
    this.estudioForm.reset();// para limpiar todos los campos del modal
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

  obtenerEstudioForm(estudioF){
    this.estudio.EST_TIPO = estudioF.est_tipo;
    this.estudio.EST_INSTITUCION = estudioF.est_institucion;
    this.estudio.EST_DESCRIPCION = estudioF.est_descripcion;
    this.estudio.EST_FECH_INI = estudioF.est_fech_ini;
    this.estudio.EST_FECH_FIN = estudioF.est_fech_fin;
  }

  modificarEstudioModal(){
    this.est_tipo.setValue(this.estudio.EST_TIPO);
    this.est_descripcion.setValue(this.estudio.EST_DESCRIPCION);
    this.est_institucion.setValue(this.estudio.EST_INSTITUCION);
    this.est_fech_ini.setValue(this.estudio.EST_FECH_INI);
    this.est_fech_fin.setValue(this.estudio.EST_FECH_FIN);
  }

  //funciones para eliminar los estudios
  obtenerIdEstudio(id_estudio){//se obtiene el id del estudio para eliminarlo después
    this.id_estudio = id_estudio;
  }
  
  //función que determinan si se trata de eliminacion de estudio o de una experiencia laboral con su contacto
  eliminar(){
    if(this.eliminacionEstudio){
      this.eliminarEstudio();
    }else{
      this.eliminarExperienciaContacto();
    }
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
          this.cerrarAlerta();
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
      this.cerrarAlerta();
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

  nuevaExperiencia(){
    this.experienciaLaboral = new ExperienciaLaboral();
    this.experienciaLaboral.EXP_ID = 0;
    this.experienciaContactoForm.reset();// para limpiar todos los campos del modal
  }

  obtenerIdExperiencia(id_experiencia){
    this.id_experiencia = id_experiencia;
  }

  agregarActualizarExperiencia(){
    if(this.experienciaContactoForm.invalid){
      this.errorModal = true;
      this.mensajeModal = "Los datos ingresados son inválidos. Por favor, respete los formatos solicitados e intente de nuevo";
      this.cerrarAlerta();
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
            this.listarExperienciasContactos();
            /* Alerta al momento de actualizar una experiencia laboral del postulante */
            this.alertaGeneral = true;
            this.tipoAlerta = 'success';
            this.mensajeAlerta = "Experiencia laboral actualizado con éxito.";
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
        }, error=>{
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
          this.cerrarAlerta();
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
      this.cerrarAlerta();
    });
  }
  /***************************************************************************************************************************/

  /*************************************************** Funciones extras *****************************************/

  // ***************************** FUNCION PARA POSTULAR ************************** */
  insertarPostulacion(){
    this.loadingModal = true;
    this.errorModal = false;
    this.postulacionService.insertarPostulacion(this.id_postulante,this.postulante['POST_EMAIL'])
    .subscribe((data)=>{
      this.loadingModal = false;
      this.modalService.dismissAll();
      this.router.navigate(['postulante/postulacion']);
    },error=>{
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
      this.cerrarAlerta();
      this.loadingModal = false;
    });
  }

  cerrarSesion(){
    this.modalService.dismissAll();
    this.authService.logout();
  }

  // ***************************** FUNCION PARA COMPROBAR SI EL POSTULANTE ESTÁ BLOQUEADO O NO ************************** */
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

  /* GET PARA EL FORMULARIO DE LA CUENTA */
  get cuenta_alias(){
    return this.cuentaForm.get('cuenta_alias');
  }
  get cuenta_contra(){
    return this.cuentaForm.get('cuenta_contra');
  }
  get cuenta_contra_nueva(){
    return this.cuentaForm.get('cuenta_contra_nueva');
  }

  /* GET PARA EL FORMULARIO DEL POSTULANTE */
  get post_nombres(){
    return this.postulanteForm.get('post_nombres');
  }
  get post_ape_pat(){
    return this.postulanteForm.get('post_ape_pat');
  }
  get post_ape_mat(){
    return this.postulanteForm.get('post_ape_mat');
  }
  get post_email(){
    return this.postulanteForm.get('post_email');
  }
  get post_celular(){
    return this.postulanteForm.get('post_celular');
  }
  get post_dni(){
    return this.postulanteForm.get('post_dni');
  }
  get post_ruc() {
    return this.postulanteForm.get('post_ruc');
  }

  get post_sexo(){
    return this.postulanteForm.get('post_sexo');
  }
  get post_nacimiento(){
    return this.postulanteForm.get('post_nacimiento');
  }
  get post_direccion(){
    return this.postulanteForm.get('post_direccion');
  }
  get post_pai_id(){
    return this.postulanteForm.get('post_pai_id');
  }
  get post_reg_id(){
    return this.postulanteForm.get('post_reg_id');
  }
  get post_pro_id(){
    return this.postulanteForm.get('post_pro_id');
  }
  get post_dist_id(){
    return this.postulanteForm.get('post_dist_id');
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
  //DATOS JURIDICOS

  get ruc() {
    return this.juridicoForm.get('ruc');
  }
  get razonSocial() {
    return this.juridicoForm.get('razonSocial');
  }
  get tipoEmpresa() {
    return this.juridicoForm.get('tipoEmpresa');
  }

  redirigirBloqueo(){
    this.authService.logout();
    this.modalService.dismissAll();
    this.routingService.replace(['/home']);
  }

  // ***************************** FUNCION PARA EL MODAL ************************** */
  open(content) {
    this.modalService.open(content);
  }
  
  openExp(content) {
    this.modalService.open(content, { size: 'lg' });
  }

  
  /*************************** FUNCION PARA LOS ESTILOS DE LAS FECHAS HTML***************************/
  getToday(): string { // Devuelve 4 formatos de fechas, y solo escogemos el primero [0], hasta donde termine en 'T'.
    return new Date().toISOString().split('T')[0];
  }

  //para cambiar a false la variable que determina que se opaque el select de la fecha
  cambiarDeStyleDateInicioEstudio() {
    this.opacarDateFechaInicioEstudio = false;
  }

  cambiarDeStyleDateFinEstudio(){
    this.opacarDateFechaFinEstudio = false;
  }

  cambiarDeStyleDateInicioExperiencia() {
    this.opacarDateFechaInicioExperiencia = false;
  }

  cambiarDeStyleDateFinExperiencia(){
    this.opacarDateFechaFinExperiencia = false;
  }

  obtenerFechaMinima() {
    const fechaActual = this.datePipe.transform(new Date(), "yyyy-MM-dd").split('-')
    const dia = fechaActual[2]
    const mes = fechaActual[1];
    const anio = Number(fechaActual[0]) - 18;

    this.maxFecha = anio + '-' + mes + '-' + dia;
  }

  esValidoFechas(dateInicio: any, dateFin: any): boolean {
    if (dateInicio < dateFin) {
      return true;
    }
    return false;
  }

  eliminarFoto(){
    this.postulanteService.eliminarFoto(this.id_postulante,this.DOMINIO+this.MOSTRAR_FOTO)
    .subscribe(data=>{
      this.deshabilitarCuenta = true;
      this.loadingModal = false;
      this.modalService.dismissAll();
      this.obtenerCuenta();
    }, error=>{
      this.deshabilitarCuenta = true;
      this.loadingModal = false;
      if(error['error']['error'] !== undefined){
        if(error['error']['error'] === "error_deEstadoNoValidoBloqueo"){
          this.estado_postulacion = 3;//para indicar que es un postulante bloqueado, ya que si no se recarga la pagina no se actualiza dicha variable
          this.modalService.open(this.contentPostulacion);
        }else if(error['error']['error'] === "error_deBD")
          this.mensajeModal = "Hubo un error al intentar ejecutar su solicitud. Por favor, intente de nuevo";
        else if(error['error']['error'] === "error_deCampo")
          this.mensajeModal = "Los datos ingresados deben respetar los formatos permitidos. Por favor, intente de nuevo.";
        else if(error['error']['error'] === "error_noExistenciaDeId")
          this.mensajeModal = "No se encontró registro del postulante para actualizar su foto. Por favor, intente de nuevo.";
      }else{
        this.mensajeModal = "Hubo un error en la conexión del servidor. Por favor, intente más tarde.";
      }
    });
  }
}
