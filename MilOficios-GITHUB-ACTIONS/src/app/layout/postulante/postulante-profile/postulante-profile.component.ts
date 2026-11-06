import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbAlert, NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { StorageService } from 'src/app/helpers/storage.service';
import { passwordValidation } from 'src/app/shared/modules/password-validation/password-validation.directive';
import { environment } from 'src/environments/environment';
import { UsuariosService } from '../../usuarios/usuarios.service';
import { PostulacionService } from '../postulacion/postulacion.service';
import { PostulanteService } from '../postulante.service';
import { AuthService } from '../../../shared/guard/auth.service';
import { Postulante } from '../postulante.models';
import { NgxImageCompressService } from 'ngx-image-compress';


@Component({
  selector: 'app-postulante-profile',
  templateUrl: './postulante-profile.component.html',
  styleUrls: ['./postulante-profile.component.scss']
})
export class PostulanteProfileComponent implements OnInit {

  estado_postulacion: number;
  //variable para alertas generales
  alertaGeneral: boolean = false;
  mensajeAlerta: string;
  tipoAlerta:string='danger';
  //Variable para la contraseña
  PASSWORD_CURRENT_ICON = 'fa fa-eye-slash';
  PASSWORD_CURRENT_TYPE = 'password';
  PASSWORD_NEW_ICON = 'fa fa-eye-slash';
  PASSWORD_NEW_TYPE = 'password';

  //Variables para errores
  alertaModal: boolean = false;
  loadingCv: boolean = false;
  tipoAlertaModal:string='';
  loadingModal:boolean=false;
  mensajeModal: string='';
  errorFoto:boolean=false;
  mensajeErrorFoto:string='';
  //Variables para los progressbar
  cargandoDatos: boolean;

  id_postulante: number;
  postulante: any;
  deshabilitarPost: boolean;

  //Variables para subir foto
  // imageChangedEvent: any = '';
  // archivoBase64textString = null;
  // imagen64 = null;
  imageChangedEvent: any;
  fotoBase64textString:any;

  MOSTRAR_FOTO : string;
  cargandoFoto:boolean=false;
  errorArchivo: boolean = false;
  croppedImage: any = '';
  isImagen: boolean;

  //Variables para la cuenta del postulante
  deshabilitarCuenta: boolean;
  postUsu: string;
  postContra: string = "";
  nuevaContra: string = "";

  dominioUrl = environment.domain_url;

  tituloArchivo:string='';
  post_cv: any;
  //Variables reactivos
  cuentaForm: FormGroup;
  loadingCuenta:boolean=true;
  alertaPostulacion:boolean=false;
  @ViewChild('inputCV') myinputCV: ElementRef;
  @ViewChild('selfClosingAlert', {static: false}) selfClosingAlert: NgbAlert; 

  constructor( config: NgbModalConfig, private formBuilder: FormBuilder,
    private postulanteService: PostulanteService, private storageService: StorageService, 
    private modalService: NgbModal, private route: ActivatedRoute, private router: Router,
    private postulacionService: PostulacionService, private authService: AuthService,private usuarioService: UsuariosService,
    private imageCompress: NgxImageCompressService
    ) {

    this.id_postulante = parseInt(this.storageService.getString('POST_ID'));
    this.deshabilitarPost = true;//deshabilitar los inputs de los datos del postulante
    this.deshabilitarCuenta = true;// deshabilitar los inputs de los datos de la cuenta del postulante
    config.backdrop = 'static';
    config.keyboard = false;
  }

  ngOnInit(): void {
    // this.obtenerCuenta();
    this.validacionesFormularios();
    this.obtenerDetallesPostulante();
  }

  obtenerDetallesPostulante(){
    this.cargandoFoto=false;
    this.route.data.subscribe( (data: any) => {
      if (data.postulanteSidebar.exito) {
        this.configurarDatosPost(data.postulanteSidebar);
      } else{
        this.tipoAlerta = "danger";
        this.alertaGeneral = true;
        this.mensajeAlerta = "Hubo un error en la conexión del servidor. Por favor, intente más tarde.";
      }
    });
  }

  configurarDatosPost(data): void{
    this.estado_postulacion = data['Resultado']['POST_ESTADO'];// estado del postulante
    this.MOSTRAR_FOTO = data['Resultado']['POST_FOTO'];
    this.postulante = data['Resultado'];
    this.cargandoFoto=true;
    this.loadingCuenta=false;
    if (this.estado_postulacion == 2){
      this.tipoAlerta = "warning";
      this.alertaPostulacion = true;
      this.mensajeAlerta = "Tienes una postulación pendiente. Por favor, espera a que esta sea evaluada para que actualices tus datos.";
    }
  }

  validacionesFormularios(){
    this.cuentaForm =  this.formBuilder.group({
      cuenta_alias: [this.storageService.getString('USE_USUARIO') ? this.storageService.getString('USE_USUARIO') : '',[Validators.required, Validators.maxLength(15)]],
      cuenta_contra: [ '',[Validators.minLength(8), Validators.maxLength(20)]],
      cuenta_contra_nueva: ['',[Validators.minLength(8), Validators.maxLength(20),passwordValidation()]]
    });
    
  }

  obtenerCuenta(){
    this.cuentaForm.controls.cuenta_contra.reset();
    this.cuentaForm.controls.cuenta_contra_nueva.reset();
    this.loadingCuenta = true;
    this.cargandoFoto =false;
    this.postulanteService.obtenerPostulante(this.id_postulante)
    .subscribe((data)=>{
      this.configurarDatosPost(data);
      this.alertaGeneral = false;
      this.loadingCuenta = false;
    }, error=>{
      this.MOSTRAR_FOTO = "";
      this.cargandoFoto=true;
      this.loadingCuenta = false;
      if(error['error']['error'] !== undefined){
        this.alertaGeneral = true;
        if(error['error']['error'] === "error_deBD")
          this.mensajeAlerta = "Hubo un error al intentar ejecutar su solicitud para obtener la cuenta del postulante. Por favor, intente de nuevo";
        else if(error['error']['error'] === "error_noExistenciaDeId")
          this.mensajeAlerta = "No se encontró registro del postulante para obtener su cuenta. Por favor, intente de nuevo.";
        else if(error['error']['error'] === "error_deCampo")
          this.mensajeAlerta = "Los datos ingresados deben respetar los formatos permitidos. Por favor, intente de nuevo.";
      }else{
        this.tipoAlerta = "danger";
        this.alertaGeneral = true;
        this.mensajeAlerta = "Hubo un error en la conexión del servidor. Por favor, intente más tarde.";
      }
    });
  }

  //gets
  get cuenta_alias() {
    return this.cuentaForm?.get('cuenta_alias');
  }

  get cuenta_contra() {
    return this.cuentaForm?.get('cuenta_contra');
  }

  get cuenta_contra_nueva() {
    return this.cuentaForm?.get('cuenta_contra_nueva');
  }

    /********************** Función para subir la foto*********************/
  //función para "convertir" a base64 la imagen
  imageCropped(readerEvent){
    let binaryString =  readerEvent.base64.split(",")[1]; 
    let pesoEnMB = this.imageCompress.byteCount(readerEvent.base64)/(1024*1024);

    if(pesoEnMB >= 5){
      this.comprimirImagen(readerEvent.base64);
    } else{
      this.croppedImage = binaryString;
    }
  }

  comprimirImagen(image) {
    this.imageCompress.compressFile(image, -1,20 , 35).then(
    result => {
      this.croppedImage= result.split(",")[1];
    });
  }

  async subirFoto(e){
    // El peso de las imágenes está en Byte por defecto.
    let files = e.target.files;
    if ( this.obtenerExtension(files[0].name).toString().toUpperCase() === 'JPG' || this.obtenerExtension(files[0].name).toString().toUpperCase() === 'JPEG'  ||
          this.obtenerExtension(files[0].name).toString().toUpperCase() === 'PNG'  ) {
        this.errorFoto = false;
        this.alertaModal = false;
        this.imageChangedEvent = e;
        if (e.target.files && e.target.files[0]) {
          await this.imageCropped.bind(e);
        }
    }
    else {
      this.errorFoto = true;
      this.mensajeErrorFoto = 'Error! : solo se admite imágenes con extensiones .png, .jpeg, .jpg';
      this.alertaModal = true;
      this.fotoBase64textString = null;
      this.cerrarAlerta();
    }
  }
  
  obtenerExtension(filename): any {
    return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
  }

  actualizarFoto(){
    this.alertaGeneral = false;
    if (!this.croppedImage) {
      return;
    }
    if(this.errorFoto == false){
      this.loadingModal = true;
      this.postulanteService.actualizarFoto(this.id_postulante,this.croppedImage)
      .subscribe(data=>{
        this.deshabilitarCuenta = true;
        this.loadingModal = false;
        this.modalService.dismissAll();
        this.alertaGeneral = true;
        this.tipoAlerta = "success";
        this.mensajeAlerta = "Se ha actualizado correctamente su cv.";
        this.cerrarAlerta();
        this.obtenerCuenta();
      }, error=>{
        this.deshabilitarCuenta = true;
        this.loadingModal = false;
        this.alertaGeneral = true;
        this.tipoAlerta = "danger";
        if(error['error']['error'] !== undefined){
          if(error['error']['error'] === "error_deEstadoNoValidoBloqueo"){
            this.estado_postulacion = 3;//para indicar que es un postulante bloqueado, ya que si no se recarga la pagina no se actualiza dicha variable
            // this.modalService.open(this.contentPostulacion);
          }else if(error['error']['error'] === "error_deBD")
            this.mensajeAlerta = "Hubo un error al intentar ejecutar su solicitud. Por favor, intente de nuevo";
          else if(error['error']['error'] === "error_deCampo")
            this.mensajeAlerta = "Los datos ingresados deben respetar los formatos permitidos. Por favor, intente de nuevo.";
          else if(error['error']['error'] === "error_noExistenciaDeId")
            this.mensajeAlerta = "No se encontró registro del postulante para actualizar su foto. Por favor, intente de nuevo.";
        }else{
          this.mensajeAlerta = "Hubo un error en la conexión del servidor. Por favor, intente más tarde.";
        }
        this.cerrarAlerta();
      });
    }else{
      this.tipoAlerta = "danger";
      this.alertaModal = true;
      this.mensajeModal = "La foto no tiene un formato permitido. Por favor, intente de nuevo.";
    }
  }  
  
  eliminarFoto(){
    this.alertaGeneral=false;
    this.postulanteService.eliminarFoto(this.id_postulante,this.dominioUrl+this.MOSTRAR_FOTO)
    .subscribe(data=>{
      this.deshabilitarCuenta = true;
      this.loadingModal = false;
      this.alertaGeneral = true;
      this.tipoAlerta = "success";
      this.mensajeAlerta = "Se ha actualizado correctamente su cv.";
      this.cerrarAlerta();
      this.obtenerCuenta();
    }, error=>{
      this.deshabilitarCuenta = true;
      this.loadingModal = false;
      this.alertaGeneral = true;
      this.tipoAlerta = "danger";
      if(error['error']['error'] !== undefined){
        if(error['error']['error'] === "error_deEstadoNoValidoBloqueo"){
          this.estado_postulacion = 3;//para indicar que es un postulante bloqueado, ya que si no se recarga la pagina no se actualiza dicha variable
          // this.modalService.open(this.contentPostulacion);
        }else if(error['error']['error'] === "error_deBD")
          this.mensajeModal = "Hubo un error al intentar ejecutar su solicitud. Por favor, intente de nuevo";
        else if(error['error']['error'] === "error_deCampo")
          this.mensajeModal = "Los datos ingresados deben respetar los formatos permitidos. Por favor, intente de nuevo.";
        else if(error['error']['error'] === "error_noExistenciaDeId")
          this.mensajeModal = "No se encontró registro del postulante para actualizar su foto. Por favor, intente de nuevo.";
      }else{
        this.mensajeModal = "Hubo un error en la conexión del servidor. Por favor, intente más tarde.";
      }
      this.cerrarAlerta();
    });
  }

  open(content) {
    this.modalService.open(content);
  }
  // ***************************** FUNCION PARA POSTULAR ************************** */
  insertarPostulacion(){
    this.loadingModal = true;
    this.alertaGeneral = false;
    this.postulacionService.insertarPostulacion(this.id_postulante,this.postulante['POST_EMAIL'])
    .subscribe((data)=>{
      this.loadingModal = false;
      this.modalService.dismissAll();
      this.alertaGeneral = true;
      this.tipoAlerta = "success";
      this.mensajeAlerta = "Se ha actualizado correctamente su cv.";
      this.cerrarAlerta();
      this.router.navigate(['postulante/postulacion']);
    },error=>{
      this.tipoAlerta = "danger";
      if(error['error']['error'] !== undefined){
        if(error['error']['error'] === "error_deEstadoNoValidoBloqueo"){
          this.mensajeAlerta = "Su cuenta ha sido bloqueada. Por favor, comuníquese con un administrador.";
          this.obtenerDetallesPostulante();
        }if(error['error']['error'] === "error_deBD")
          this.mensajeAlerta = "Hubo un error al intentar ejecutar su solicitud para realización la postulación. Por favor, intente de nuevo";
        else if(error['error']['error'] === "error_deCampo")
          this.mensajeAlerta = "Los datos ingresados deben respetar los formatos permitidos. Por favor, intente de nuevo.";  
        else if(error['error']['error'] === "error_noExistenciaDeId")
          this.mensajeAlerta = "No se encontró registro del postulante para realizar su postulación. Por favor, intente de nuevo.";
        else if(error['error']['error'] === "error_dePostulacionPendiente")
          this.mensajeAlerta = "No puede postular cuando se tiene una postulación pendiente. Por favor, espere a que un administrador analice su postulación.";
      }else{
        this.mensajeAlerta = "Hubo un error al intentar postular. Por favor, intente de nuevo";
      }
      this.cerrarAlerta();
      this.alertaGeneral = true;
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

  actualizarCuenta(){
    this.alertaGeneral = false;
    if(this.cuentaForm.invalid){
      this.alertaGeneral = true;
      this.mensajeAlerta = "Debe ingresar correctamente los datos. Por favor, intente de nuevo";
    }else{
      this.alertaGeneral = false;
      this.loadingCuenta = true;
      let usuario = this.cuentaForm.value;
      this.postUsu = usuario.cuenta_alias;
      this.postContra = usuario.cuenta_contra;
      this.nuevaContra = usuario.cuenta_contra_nueva;
      this.postContra = (this.postContra == null)? '':this.postContra;//si es null despues de capturar el dato del html entonces se cambia a vacio
      this.nuevaContra = (this.nuevaContra == null)? '':this.nuevaContra;//si es null despues de capturar el dato del html entonces se cambia a vacio
      if((this.postContra != '' && this.nuevaContra != '') && this.postContra === this.nuevaContra){
        this.alertaGeneral = true;
        this.loadingCuenta = false;
        this.mensajeAlerta = "La nueva contraseña no debe ser igual a la actual. Por favor, intente de nuevo."
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
            this.actualizarAutorizacion().then(
              () => {
                this.postulanteService.usuarioUpdated();
                this.usuarioService.usuarioUpdated(this.postUsu);
              }
            );
          }else{
            this.obtenerCuenta();
          }
        }, error=>{
          this.loadingCuenta = false;
          if(error['error']['error'] !== undefined){
            this.alertaGeneral = true;
            if(error['error']['error'] === "error_deEstadoNoValidoBloqueo"){
              this.alertaGeneral = false;//se pone false para que no aparezca el elemento de alerta
              this.estado_postulacion = 3;//para indicar que es un postulante bloqueado, ya que si no se recarga la pagina no se actualiza dicha variable
            }else if(error['error']['error'] === "error_deBD")
              this.mensajeAlerta = "Hubo un error al intentar ejecutar su solicitud. Por favor, intente de nuevo";
            else if(error['error']['error'] === "error_deCampo")
              this.mensajeAlerta = "Los datos ingresados deben respetar los formatos permitidos. Por favor, intente de nuevo.";
            else if(error['error']['error'] === "error_noExistenciaDeId")
              this.mensajeAlerta = "No se encontró registro del postulante para actualizar su cuenta. Por favor, intente de nuevo.";
            else if(error['error']['error'] === "error_deContraseniaActual")
              this.mensajeAlerta = "Para actualizar su contraseña debe ingresar correctamente su contraseña actual. Por favor, intente de nuevo.";
            else if(error['error']['error'] === "error_deContraNoVacio")
              this.mensajeAlerta = "Los campos contraseña actual y nueva contraseña tienen que tener datos para actualizar su contraseña. Por favor, intente de nuevo.";
            else if(error['error']['error'] === "error_deAliasNoValido")
              this.mensajeAlerta = "No puede actualizar su alias con uno ya existente. Por favor, intente de nuveo"; 
          }else{
            this.tipoAlerta = "danger";
            this.alertaGeneral = true;
            this.mensajeAlerta = "Hubo un error en la conexión del servidor. Por favor, intente más tarde.";
          }
          
          this.cuentaForm.controls.cuenta_contra.reset();
          this.cuentaForm.controls.cuenta_contra_nueva.reset();
        }); 
      }
    }
  }

  cerrarAlerta(){
    setTimeout(() => {
      if(this.selfClosingAlert) {
        this.selfClosingAlert.close();
      }
      }, 30000);
  }

  actualizarAutorizacion = () => {
    const autorizacionPromise = new Promise((resolve, reject) => {
      let postulante = new Postulante();
      postulante.POST_ALIAS = this.postUsu.toLowerCase();
      postulante.POST_CONTRASENIA = this.nuevaContra;
      let cantidad = postulante.POST_ALIAS.length;
      let codigoAscii: string = '';
      let dividir,firstMitad, secondMitad;

      let textoCompleto: string;

      this.postulanteService.verificarCredenciales(postulante)
        .subscribe((respuesta)=>{
          if(respuesta.exito) //Credentials are correct
          {
            for ( let i=0; i< cantidad ; i++){
              codigoAscii = codigoAscii + postulante.POST_ALIAS[i].charCodeAt(0).toString()+'&';
            }
            codigoAscii = codigoAscii.substring(0, codigoAscii.length - 1);
            cantidad=codigoAscii.length+1;
            dividir = cantidad/2;
            firstMitad = codigoAscii.substring(0,Math.round(dividir));
            secondMitad = codigoAscii.substring(Math.round(dividir),codigoAscii.length);
            textoCompleto = cantidad + "$$" + firstMitad + respuesta.autenticar + secondMitad;
            this.storageService.storeString('USE_SUB', textoCompleto);
            this.storageService.storeString('TIPO_SESION',"0");//si es 0 es postulante, si es 1 es un usuario (cliente o especialista)
            this.storageService.storeString('USE_USUARIO', this.postUsu.toLowerCase());
            this.storageService.storeString('POST_ID',respuesta.id_postulante);

            resolve(textoCompleto);
          }
          else {
            this.alertaGeneral = true;
            this.tipoAlerta = 'danger';
            this.mensajeAlerta = "Las credenciales ingresadas son incorrectas. Por favor, intenta nuevamente";
          }
        }, error=>{
            this.alertaGeneral = true;
            this.tipoAlerta = 'danger';
            this.mensajeAlerta = "Hubo un error al validar tus credenciales. Por favor, intenta nuevamente";
        });
    });

    return autorizacionPromise;
  }

  //cv

  subirArchivoCV(event):void {
    this.loadingModal = false;
    let files = event.target.files;
    let file = files[0];
    if(!files || !file){
      this.tituloArchivo= '';
      return;
    }
    if ( this.obtenerExtension(files[0].name).toString().toUpperCase() === 'PDF' ) {
      this.alertaModal = false;
      if (files && file) {
        let reader = new FileReader();
        reader.onload = this._handleReaderLoaded.bind(this);
        reader.readAsBinaryString(file);
        this.tituloArchivo= file.name;
      }
    } else {
      this.myinputCV.nativeElement.value = '';
      this.alertaModal = true;
      this.mensajeModal = 'El formato solo permite archivos con extensión .pdf';
    }
  }
  
  guardarCv(){
    this.alertaGeneral = false;
    this.alertaModal = false;
    this.loadingModal=true;
    this.postulanteService.actualizarCvPostulante(this.id_postulante,this.post_cv)
    .subscribe((data)=>{
      this.loadingCv = false;
      this.obtenerCuenta();
      this.alertaGeneral = true;
      this.modalService.dismissAll();
      this.tipoAlerta = "success";
      this.mensajeAlerta = "Se ha actualizado correctamente su cv.";
      this.cerrarAlerta();
      this.loadingModal=false;
    },error=>{
      this.loadingModal=false;
      if(error['error']['error'] !== undefined){
        this.alertaModal = true;
        if(error['error']['error'] === "error_deEstadoNoValidoBloqueo"){
          this.estado_postulacion = 3;//para indicar que es un postulante bloqueado, ya que si no se recarga la pagina no se actualiza dicha variable
        }else if(error['error']['error'] === "error_deBD")
          this.mensajeModal = "Hubo un error al intentar ejecutar su solicitud para actualizar el cv del postulante. Por favor, intente de nuevo";
        else if(error['error']['error'] === "error_noExistenciaDeId")
          this.mensajeModal = "No se encontró registro del postulante para actualizar su cv. Por favor, intente de nuevo.";
        else if(error['error']['error'] === "error_deCampo")
          this.mensajeModal = "Los datos ingresados deben respetar los formatos permitidos. Por favor, intente de nuevo."; 
      }else{
        this.tipoAlerta = "danger"
        this.alertaModal = true;
        this.mensajeModal = "Hubo un error en la conexión del servidor. Por favor, intente más tarde.";
      }
      this.loadingCv = false;
    });
  }

  _handleReaderLoaded(readerEvent): any {
    let binaryString = readerEvent.target.result;
    this.post_cv = btoa(binaryString);
  }

}
