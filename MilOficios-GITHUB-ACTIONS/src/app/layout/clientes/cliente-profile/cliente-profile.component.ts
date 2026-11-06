import { Component, OnInit,ViewChild,ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';


import { NgbAlert, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {StorageService} from '../../../helpers/storage.service';


import {Cliente} from '../cliente.model';
import {ClienteService} from '../cliente.service';
import { UsuariosService } from '../../usuarios/usuarios.service';

import { NgxImageCompressService } from 'ngx-image-compress';
import { passwordValidation } from 'src/app/shared/modules/password-validation/password-validation.directive';

import { environment } from 'src/environments/environment';

import { ServiceWorkerService } from 'src/app/shared/services/service-worker.service';
@Component({
  selector: 'app-cliente-profile',
  templateUrl: './cliente-profile.component.html',
  styleUrls: ['./cliente-profile.component.scss']
})
export class ClienteProfileComponent implements OnInit {

  @ViewChild('modalUpdatePhoto') elementUpdatePhoto: ElementRef;
  @ViewChild('modalUpdateContrasena') elementUpdateContrasena: ElementRef;
  @ViewChild('modalUpdateDatos') elementUpdateDatos: ElementRef;
  @ViewChild('selfClosingAlert', {static: false}) selfClosingAlert: NgbAlert; 
  @ViewChild('fileInput') inputFile: ElementRef;


  croppedImage:any= '';


  CLIENTE: Cliente = new Cliente();
  datosUsuariosForm: any;
  contrasenaForm: any;


  PASSWORD_CURRENT_ICON = 'fa fa-eye-slash centrar-hijo';
  PASSWORD_CURRENT_TYPE = 'password';
  PASSWORD_NEW_ICON = 'fa fa-eye-slash centrar-hijo';
  PASSWORD_NEW_TYPE = 'password';



  imageChangedEvent: any;
  errorFoto: boolean;
  mensajeErrorFoto:string;
  mostrarAlertaModal:boolean;
  fotoBase64textString:any;


  cargandoDatos=false;
  mostrarAlerta=false;
  tipoAlerta:string;
  mensajeInicio:string;


  URL_NUEVA_FOTO;
  error: boolean;
  success:boolean;
  MENSAJE_CONFIRMACION;
  cargandoFoto:boolean;
  previewImage;

  mensajeModal:string;
  cargandoActualizarFoto:boolean = false;
  tipoAlertaModal:string;

  CONTRASENA_ACTUAL:string;
  NUEVA_CONTRASENA:string;



  contrasenasIguales:boolean = false;
  cargandoActualizarContrasena:boolean = false;


  
  sizeMinimoACompress =  5;
  
  DOMINIO = environment.domain_url;

  //Notificaciones

  mostrarAlertaNotification = false;
  tipoAlertaNotification = "";
  mensajeNotification = "";
  
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private modal: NgbModal,
    private clienteService: ClienteService,
    private storageService: StorageService,
    private usuarioService: UsuariosService,
    private imageCompress: NgxImageCompressService,
    private serviceWorker:ServiceWorkerService
  ) { }

  ngOnInit(): void {
    this.clienteService.updateHeaders();
    this.previewImage = "../../../../assets/images/no-img.png";
    this.cargandoDatos = false;
    this.cargandoFoto = true;

    this.incializarContrasena();
    this.incializarDatosUsuarios();
    this.getUsuarioCliente().then(() => {
      this.datosUsuariosForm.enable();
      this.cargandoDatos = false;
      if (this.CLIENTE === undefined) {
        this.goToNotFound();
      } else {
        this.URL_NUEVA_FOTO = this.CLIENTE.USU_FOTO;
        this.previewImage = this.CLIENTE.USU_FOTO;
        this.cargandoFoto = false;
        
        this.updateValuesCliente();
      }
    })
    .catch((error) => {
      this.error = true;
      this.success = false;
      this.cargandoDatos = false;
      this.MENSAJE_CONFIRMACION = 'Hubo un error al intentar obtener los datos de usuario. Por favor, intente de nuevo';
    });

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


  getUsuarioCliente = () => {
    this.cargandoDatos = true;
    let typeUser =Number(localStorage.getItem('USE_TYPE')); 
    const clientePromise = new Promise((resolve, reject) => {
    this.clienteService.obtenerCliente(Number(localStorage.getItem("USE_ID"))).subscribe(
      (CLIENTE) => {
        this.CLIENTE = CLIENTE['Resultado'][0];
        this.URL_NUEVA_FOTO = this.CLIENTE.USU_FOTO;

        this.clienteService.getClienteById(Number(localStorage.getItem("USE_ID")),typeUser).subscribe(
          (CLIENTE) => {
            this.CLIENTE.USU_SEXO = CLIENTE['Resultado'][0].USU_SEXO;
            this.URL_NUEVA_FOTO = this.CLIENTE.USU_FOTO;
            resolve(this.CLIENTE);
            this.cargandoDatos = false;
          },
          (error) => {
            this.cargandoDatos = false;
            this.mostrarAlerta = true;
            
            this.cerrarAlerta();
            this.tipoAlerta = 'danger';
            if (error['error']['error'] !== undefined) {
              if (error['error']['error'] === 'error_noExistenciaDeIdCli') {
                this.mensajeInicio = 'No se pudo obtener los datos de usuario del cliente debido a que ya no se encuentra registrado. Por favor, intente de nuevo.';
              }
              else if (error['error']['error'] === 'error_deBD') {
                this.mensajeInicio = 'Hubo un error al intentar ejecutar su solicitud para obtener los datos de usuario. Por favor, intente de nuevo.';
              }
              else if (error['error']['error'] === 'error_deCampo') {
                this.mensajeInicio = 'Los datos ingresados deben respetar los formatos permitidos. Por favor, intente de nuevo.';
              }
            } 
            else  {
              this.mensajeInicio = 'Hubo un error al intentar obtener los datos de usuario. Por favor, intente de nuevo';
            }
            
          });
      },
      (error) => {
        this.cargandoDatos = false;
        this.mostrarAlerta = true;
        this.cerrarAlerta();
        this.tipoAlerta = 'danger';
        if (error['error']['error'] !== undefined) {
          if (error['error']['error'] === 'error_noExistenciaDeIdCli') {
            this.mensajeInicio = 'No se pudo obtener los datos de usuario del cliente debido a que ya no se encuentra registrado. Por favor, intente de nuevo.';
          }
          else if (error['error']['error'] === 'error_deBD') {
            this.mensajeInicio = 'Hubo un error al intentar ejecutar su solicitud para obtener los datos de usuario. Por favor, intente de nuevo.';
          }
          else if (error['error']['error'] === 'error_deCampo') {
            this.mensajeInicio = 'Los datos ingresados deben respetar los formatos permitidos. Por favor, intente de nuevo.';
          }
        } 
        else  {
          this.mensajeInicio = 'Hubo un error al intentar obtener los datos de usuario. Por favor, intente de nuevo';
        }
        
      });
    });


    return clientePromise;
  }

  incializarDatosUsuarios(){
    this.datosUsuariosForm =  this.formBuilder.group({
      nombreUsuario:[{value: '', disabled: true }],
      correo: [{value: '', disabled: true }]
    });

  }

  incializarContrasena(){

    this.contrasenaForm =  this.formBuilder.group({
      contrasenaActual: [''],
      contrasenaNueva: ['']
    });

  }

  cambiarVistaContrasenaActual() {
    if (this.PASSWORD_CURRENT_ICON === 'fa fa-eye-slash centrar-hijo') {
      this.PASSWORD_CURRENT_ICON = 'fa fa-eye centrar-hijo';
      this.PASSWORD_CURRENT_TYPE = 'text';
    } else {
      this.PASSWORD_CURRENT_ICON = 'fa fa-eye-slash centrar-hijo';
      this.PASSWORD_CURRENT_TYPE = 'password';
    }
  }

  cambiarVistaContrasenaNueva() {
    if (this.PASSWORD_NEW_ICON === 'fa fa-eye-slash centrar-hijo') {
      this.PASSWORD_NEW_ICON = 'fa fa-eye centrar-hijo';
      this.PASSWORD_NEW_TYPE = 'text';
    } else {
      this.PASSWORD_NEW_ICON = 'fa fa-eye-slash centrar-hijo';
      this.PASSWORD_NEW_TYPE = 'password';
    }
  }

  abrirModalImagen(){
    this.modal.open(this.elementUpdatePhoto);
  }

  abrirModalContrasena(){
    this.validarCampos();
    if(this.datosUsuariosForm.invalid){
      this.datosUsuariosForm.markAllAsTouched();
      return;
    }
    this.contrasenaForm.reset();
    this.borrarValidacionesContra();
    this.modal.open(this.elementUpdateContrasena);
  }

  abrirModalUpdateDatos(){
    this.modal.open(this.elementUpdateDatos);
  }

  cerrarModal(){
    this.modal.dismissAll();
    this.errorFoto=false;
    this.mostrarAlertaModal=false;
    this.mensajeInicio='';
    this.mensajeErrorFoto='';
    this.croppedImage=null;
  }

  updateUsuarioCliente(){
    this.validarCampos();
    if(this.datosUsuariosForm.invalid){
      this.datosUsuariosForm.markAllAsTouched();
      return;
    }
    this.cargandoDatos = true;
    this.saveValuesCliente();
    this.clienteService.updateDatosCliente(this.CLIENTE).subscribe(data => {
      this.actualizarCabeceras().then(
        (resp:string) => {
          this.clienteService.updateHeaders(resp);
          localStorage.setItem('USE_SUB',resp);
          // this.getUsuarioCliente();
        }
      );

      this.cargandoDatos = false;
      this.mostrarAlerta = true;
      this.tipoAlerta = 'success';
      this.mensajeInicio = 'Datos de usuario actualizados correctamente';
      this.cerrarAlerta();
      this.storageService.storeString('USE_EMAIL', this.CLIENTE.USU_EMAIL.toLowerCase());
      // this.usuarioService.usuarioUpdated(this.CLIENTE.USU_ALIAS);
    }, error =>{
      this.cargandoDatos = false;
      this.mostrarAlerta = true;
      this.tipoAlerta = 'danger';
      if (error['error']['error'] !== undefined) {
        if (error['error']['error'] === 'error_existenciaDeNombreUsuario') {
          this.mensajeInicio = 'No se pudo actualizar el cliente debido a que el nombre de usuario se encuentra registrado. Por favor, intente de nuevo.';
        } else if (error['error']['error'] === 'error_existenciaDeEmail') {
          this.mensajeInicio  = 'No se pudo actualizar el cliente debido a que el correo electrónico ya se encuentra registrado. Por favor, intente de nuevo.';
        } else if (error['error']['error'] === 'error_deBD') {
          this.mensajeInicio = 'Hubo un error al intentar ejecutar su solicitud. Por favor, intente de nuevo.';
        } else if (error['error']['error'] === 'error_deCampo') {
          this.mensajeInicio = 'Los datos ingresados deben respetar los formatos permitidos. Por favor, intente de nuevo.';
        }
      } else {
        this.mensajeInicio = 'Hubo un error al intentar actualizar los datos. Por favor, intente de nuevo';
      }
      this.cerrarAlerta();
    });

  }

  actualizarCabeceras = () => {
    const autorizacionPromise = new Promise((resolve, reject) => {
      let USU_USUARIO = this.CLIENTE.USU_ALIAS;
      let cantidad = USU_USUARIO.length;
      let codigoAscii: string = '';
      let dividir,firstMitad, secondMitad,dividido;
      let textoCompleto: string;
      let token = localStorage.getItem('USE_SUB');

      dividido = token.slice(0,token.indexOf("$$"));

      let tokenAux = token.substring((token.indexOf("$$")+2),token.length);
      let numFirstMitad:number = Number((dividido/2).toFixed());
      let numSecondMitad:number = dividido-numFirstMitad-1;

      let textoCental = tokenAux.slice(numFirstMitad,-numSecondMitad);

      for ( let i=0; i< cantidad ; i++){
          codigoAscii = codigoAscii + USU_USUARIO[i].charCodeAt(0).toString()+'&';
      }
      codigoAscii = codigoAscii.substring(0, codigoAscii.length - 1);
      cantidad=codigoAscii.length+1;
      dividir = cantidad/2;
      
      firstMitad = codigoAscii.substring(0,Math.round(dividir));
      secondMitad = codigoAscii.substring(Math.round(dividir),codigoAscii.length);
      textoCompleto = cantidad + "$$" + firstMitad + textoCental + secondMitad;

      this.storageService.storeString('USE_SUB', textoCompleto);
      this.storageService.storeString('USE_USUARIO', USU_USUARIO.toLowerCase());
      localStorage.setItem('USE_SUB',textoCompleto)

      resolve(textoCompleto);
    });

    return autorizacionPromise;
  }

  obtenerExtension(filename): any {
    return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
  }

  async subirFoto(e){
    // El peso de las imágenes está en Byte por defecto.
    let files = e.target.files;
    if ( this.obtenerExtension(files[0].name).toString().toUpperCase() === 'JPG' || this.obtenerExtension(files[0].name).toString().toUpperCase() === 'JPEG'  ||
          this.obtenerExtension(files[0].name).toString().toUpperCase() === 'PNG'  ) {
        this.errorFoto = false;
        this.mostrarAlertaModal = false;
        this.imageChangedEvent = e;
        if (e.target.files && e.target.files[0]) {
          await this.imageCropped.bind(e);
        }
    }
    else {
      this.errorFoto = true;
      this.mensajeErrorFoto = 'Error! : solo se admite imágenes con extensiones .png, .jpeg, .jpg';
      this.mostrarAlertaModal = true;
      this.fotoBase64textString = null;
      if(this.inputFile)this.inputFile.nativeElement.value = '';
      this.cerrarAlerta();
    }
  }

  imageCropped(readerEvent){

    let binaryString =  readerEvent.base64.split(",")[1]; 
    
    let pesoEnMB = this.imageCompress.byteCount(readerEvent.base64)/(1024*1024);

    if(pesoEnMB >= this.sizeMinimoACompress ){
      this.comprimirImagen(readerEvent.base64);
    } else{
      this.croppedImage = binaryString;
    }
  }
  
  comprimirImagen(image) {
    // ARGUMENTOS PARA EL MÉTODO COMPRESSFILE. 
    //P1 = la imagen en base 64, P3= El tamaño de la imagen en radios. 
    // P4 = La calidad de la imagen. 
    this.imageCompress.compressFile(image, -1,20 , 35).then(
    result => {
      this.croppedImage= result.split(",")[1];
    });
  }

  guardarFotoActualizada(){
    if (!this.croppedImage) {
      return;
    }
    this.cargandoActualizarFoto = true;
    this.clienteService.updateFotoCliente(this.CLIENTE.CLI_ID,this.croppedImage).subscribe( data => {
      this.modal.dismissAll();
      this.mostrarAlerta = true;
      this.tipoAlerta = 'success';
      this.mensajeInicio ='Foto actualizada correctamente';
      this.getUsuarioCliente();
      this.cerrarAlerta();
      this.cargandoActualizarFoto = false;
    }, error => {
      this.cargandoActualizarFoto = false;
      this.mostrarAlertaModal = true;
      this.tipoAlertaModal = 'danger';
      if (error['error']['error'] !== undefined) {
        if (error['error']['error'] === 'error_noExistenciaDeIdCli') {
          this.mensajeModal = 'No se pudo actualizar la foto debido a que el cliente ya no se encuentra registrado. Por favor, intente de nuevo.';
        } else if (error['error']['error'] === 'error_deBD') {
          this.mensajeModal = 'Hubo un error al intentar ejecutar su solicitud. Por favor, intente de nuevo.';
        } else if (error['error']['error'] === 'error_deCampo') {
          this.mensajeModal = 'Los datos ingresados para actualizar la foto deben respetar los formatos permitidos. Por favor, intente de nuevo.';
        }
      } else {
        this.mensajeModal = 'Hubo un error al intentar actualizar la foto. Por favor, intente de nuevo';
      }
      this.cerrarAlerta();
    });
  }

  actualizarAutorizacion = () => {
    const autorizacionPromise = new Promise((resolve, reject) => {
      let USU_USUARIO = this.CLIENTE.USU_ALIAS;
      let USU_CONTRASENIA = this.NUEVA_CONTRASENA;     
      let cantidad = USU_USUARIO.length;
      let codigoAscii: string = '';
      let dividir;
      let firstMitad, secondMitad;

      let textoCompleto: string;

      this.usuarioService.verificarCredenciales(USU_USUARIO, USU_CONTRASENIA, 0)
        .subscribe((respuesta)=>{
          if(respuesta.exito) //Credentials are correct
          {
              for ( let i=0; i< cantidad ; i++){
                codigoAscii = codigoAscii + USU_USUARIO[i].charCodeAt(0).toString();
              }
              cantidad = codigoAscii.length;
              dividir = cantidad/2;
              firstMitad = codigoAscii.substring(0,Math.round(dividir));
              secondMitad = codigoAscii.substring(Math.round(dividir),codigoAscii.length);

              textoCompleto = cantidad + "$$" + firstMitad + respuesta.autenticar + secondMitad;
              this.storageService.storeString('USE_SUB', textoCompleto);
              this.storageService.storeString('USE_USUARIO', USU_USUARIO.toLowerCase());
              this.storageService.storeString('USE_ID', respuesta.id);
              this.storageService.storeString('USE_NAMES', respuesta.fullName);
              this.storageService.storeString('USE_TYPE', "1");     // Tipo de usuario 1, representa a un especialista
              resolve(textoCompleto);
          }
          else {
            this.mostrarAlerta = true;
            this.tipoAlerta = 'danger';
            this.mensajeInicio = "Las credenciales ingresadas son incorrectas. Por favor, intenta nuevamente";
            this.cerrarAlerta();
          }
          this.cargandoDatos = false;
        }, error=>{
            this.cargandoDatos = false;  
            this.mostrarAlerta = true;
            this.tipoAlerta = 'danger';
            this.mensajeInicio = "Hubo un error al validar tus credenciales. Por favor, intenta nuevamente";
            this.cerrarAlerta();
        });
    });

    return autorizacionPromise;
  }


  saveContrasena() {
    this.validarCamposContrasenia();
    if(this.contrasenaForm.invalid){
      this.contrasenaForm.markAllAsTouched();
      return;
    }

    this.saveValuesContrasena();
    this.saveValuesCliente();
    if (this.CONTRASENA_ACTUAL !== this.NUEVA_CONTRASENA) {
      this.contrasenasIguales = false;
      this.cargandoActualizarContrasena = true;
      this.clienteService.updateContrasenaCliente(this.CLIENTE.CLI_ID, this.CONTRASENA_ACTUAL, this.NUEVA_CONTRASENA).subscribe(
          (message) => {
            this.modal.dismissAll();
            this.mostrarAlerta = true;
            this.tipoAlerta = 'success';
            this.mensajeInicio = 'La contraseña se actualizó exitosamente';
            this.actualizarAutorizacion().then(
              () => {
                this.clienteService.updateHeaders();
                this.usuarioService.usuarioUpdated(this.CLIENTE.USU_ALIAS);
              }
            );
            this.cargandoActualizarContrasena = false;
            this.cerrarAlerta();
          }, (error) => {
            this.cargandoActualizarContrasena = false;
            this.mostrarAlertaModal = true;
            this.tipoAlertaModal = 'danger';
            if (error['error']['error'] !== undefined) {
              if (error['error']['error'] === 'error_deContraseñaActual') {
                this.mensajeModal = 'La contraseña actual es incorrecta';
              } else if (error['error']['error'] === 'error_deBD') {
                this.mensajeModal = 'Hubo un error al intentar ejecutar su solicitud para obtener los datos de usuario del cliente. Por favor, intente de nuevo.';
              } else if (error['error']['error'] === 'error_deCampo') {
                this.mensajeModal = 'Los datos ingresados deben respetar los formatos permitidos. Por favor, intente de nuevo.';
              }
            } else {
              this.mensajeModal = 'Hubo un error al intentar actualizar la contraseña. Por favor, intente de nuevo';
            }
            this.cerrarAlerta();
        });
    } else if (this.contrasenaActual.value == '' || this.contrasenaNueva.value == '' ) {
      this.mostrarAlertaModal = true;
      this.tipoAlertaModal = 'danger';
      this.mensajeModal = 'La contraseña no puede ser vacío';
      this.cerrarAlerta();
    } else {
      this.mostrarAlertaModal = true;
      this.tipoAlertaModal = 'danger';
      this.mensajeModal = 'La contraseña nueva no puede ser igual a la actual';
      this.cerrarAlerta();
    }

  }


  goToNotFound() {
    this.router.navigate(['not-found']);
  }

  saveValuesContrasena() {
    this.CONTRASENA_ACTUAL = this.contrasenaActual.value;
    this.NUEVA_CONTRASENA = this.contrasenaNueva.value;
  }

  updateValuesCliente() {
    this.nombreUsuario.setValue(this.CLIENTE.USU_ALIAS);
    this.correo.setValue(this.CLIENTE.USU_EMAIL);
  }

  saveValuesCliente() {
    this.CLIENTE.USU_ALIAS = this.nombreUsuario.value;
    this.CLIENTE.USU_EMAIL = this.correo.value;
  }

  validarCampos(){
    const emailFormat = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    this.datosUsuariosForm.controls.nombreUsuario.setValidators([Validators.required, Validators.pattern('[a-zñáéíóúA-ZÑÁÉÍÓÚ0-9]+'), Validators.maxLength(50)]);
    this.datosUsuariosForm.controls.nombreUsuario.updateValueAndValidity();
    
    this.datosUsuariosForm.controls.correo.setValidators([Validators.required, Validators.pattern(emailFormat), Validators.maxLength(60), Validators.email]);
    this.datosUsuariosForm.controls.correo.updateValueAndValidity();
  }

  validarCamposContrasenia(){
    this.contrasenaForm.controls.contrasenaActual.setValidators([Validators.required, Validators.minLength(8), Validators.maxLength(20)]);
    this.contrasenaForm.controls.contrasenaActual.updateValueAndValidity();

    this.contrasenaForm.controls.contrasenaNueva.setValidators([Validators.required, Validators.minLength(8), Validators.maxLength(20), passwordValidation()]);
    this.contrasenaForm.controls.contrasenaNueva.updateValueAndValidity();
  }

  borrarValidacionesContra(){
    this.contrasenaForm.controls.contrasenaActual.clearValidators();
    this.contrasenaForm.controls.contrasenaActual.updateValueAndValidity();
    this.contrasenaForm.controls.contrasenaNueva.clearValidators();
    this.contrasenaForm.controls.contrasenaNueva.updateValueAndValidity();
  }

  get nombreUsuario() {
    return this.datosUsuariosForm.get('nombreUsuario');
  }

  get correo() {
    return this.datosUsuariosForm.get('correo');
  }

  get contrasenaActual() {
    return this.contrasenaForm.get('contrasenaActual');
  }

  get contrasenaNueva() {
    return this.contrasenaForm.get('contrasenaNueva');
  }

  cerrarAlerta(){
    setTimeout(() => {
      this.mostrarAlerta=false;
      this.mostrarAlertaModal=false;
      this.mensajeInicio='';
    }, 5000);
  }


}
