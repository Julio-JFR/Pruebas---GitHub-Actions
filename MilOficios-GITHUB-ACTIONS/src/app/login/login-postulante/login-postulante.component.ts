import { Component, ElementRef, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { NavigationStart, Router } from '@angular/router';
import { ReCaptcha2Component } from 'ngx-captcha';
import { RoutingService } from 'src/app/helpers/routing.service';
import { StorageService } from 'src/app/helpers/storage.service';
import { PostulanteService } from '../../layout/postulante/postulante.service';
import { routerTransition } from '../../router.animations';
import { Postulante } from 'src/app/layout/postulante/postulante.models';
import { environment } from 'src/environments/environment';
import { RecuperarCuentaService } from '../recuperar-cuenta.service';
import { AuthService } from 'src/app/authorization/auth.service';
import { Subscription } from 'rxjs';
import { NavbarService } from 'src/app/shared/navbar/navbar.service';

@Component({
  selector: 'app-login-postulante',
  templateUrl: './login-postulante.component.html',
  styleUrls: ['./login-postulante.component.scss'],
  animations: [routerTransition()]
})
export class LoginPostulanteComponent implements OnInit, OnDestroy {

  public aFormGroup: FormGroup;
  @ViewChild('captchaElem') captchaElem: ReCaptcha2Component;
  @ViewChild('modalForgotPassword') elementForgotPassword: ElementRef;
  @ViewChild('tEspecialista') tEspecialista: ElementRef;

  public lang = 'es';
  public theme: 'light' | 'dark' = 'light';
  public size: 'compact' | 'normal' = 'normal';
  public type: 'image' | 'audio';

  PASSWORD_ICON = 'fa fa-eye-slash border-span';
  PASSWORD_TYPE = 'password';
  disableButton;
  cargando;
  cargandoModal;
  error;
  mensajeError;
  mensajeModal = '';
  mostrarAlertaModal = false;
  tipoAlertaModal = '';
  mensajeBotonModal = "Enviar";
  cargandoCaptchan:boolean=true;
  IngresoCodigoRecuperacion=false;
  tipoColorAlertaLogin='danger';
  verdadero = false;
  evento = null;
  bandera = false;//para mostrar el mensaje de reenvio del correo (modal)
  mensaje_reenviar = ""; //mensaje que se mostrará en el reenvio de correo (modal)
  loginForm:FormGroup;

  ipEspecialista = '';
  EMAIL_USUARIO = '';

  //Captcha 6Lc2VQkaAAAAAJd9mmUzulkvacYFfh1Tz7HNsRt- (miloficios.rjberru.com)
  //6LfQdNAZAAAAACltytoB-Q5cAdVXV5WN6drcIbf4 para el localhost
  //nuevo captcha 6LexAS0aAAAAAAx69bq3DhX62cGbU-ZOSDDyZKwb (despliegue.rjberru.com)
  siteKey = environment.captcha;
  
  postulante = new Postulante();

  emailForm: any;
  POST_ALIAS: any;

  IdObservable: Subscription ;

  constructor(private formBuilder: FormBuilder,
    public router: Router,
    private modal: NgbModal,
    private storageService: StorageService,
    private routingService: RoutingService,
    private postulanteService: PostulanteService,
    private recuperarCuentaService: RecuperarCuentaService,
    private navBarService: NavbarService,
    private authService: AuthService,
    configModal: NgbModalConfig ){ 
      configModal.backdrop = 'static';
      configModal.keyboard = false;

    }

  ngOnInit() {
    
    this.IdObservable = this.authService.event_Postulante$.subscribe(
      data=> {
        if(data == true ){

          this.router.events
          .subscribe((event: NavigationStart) => {
            if (event.navigationTrigger === 'popstate') {
              // Perform actions
              // window.location.reload();
              this.authService.checkedGuardPostulante(false);
              /* this.router.navigate(['postulante/login']); */
            }
          });
          
        }
      }
    );
    

    this.modal.dismissAll();
    this.cargandoModal = false;
    if (this.storageService.getString('isLoggedin') === 'true') { // If the user has logged in
      this.routingService.replace(['/']); // Navigate to the main page
    } else {
      const cookies = localStorage.getItem('cookieConsent') === 'true';
      localStorage.setItem('MOVIL','0');
      localStorage.setItem('cookieConsent', cookies ? 'true' : 'false');
      this.disableButton = true;
      this.aFormGroup = this.formBuilder.group({
        recaptcha: ['', Validators.required]
      });
      const emailFormat = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
//       [Validators.required, Validators.pattern(emailFormat), Validators.maxLength(60), Validators.email]]
// [Validators.pattern(/^([0-9])*$/),Validators.minLength(5),Validators.maxLength(5)]
      this.emailForm =  this.formBuilder.group({
        usu_email: [''],
        usu_codigoRecuperacionCuenta: ['']
      });
    }
    this.cargarFormulario();
  }

  
  cargarFormulario(){
    this.loginForm = this.formBuilder.group({
      USU_USUARIO:[''],
      USU_CONTRASENIA:['']
    })
  }


  cargarValidaciones(){
    this.loginForm.controls.USU_USUARIO.setValidators([Validators.required,Validators.maxLength(60)]);
    this.loginForm.controls.USU_USUARIO.updateValueAndValidity();
    this.loginForm.controls.USU_CONTRASENIA.setValidators([Validators.required,Validators.maxLength(20)]);
    this.loginForm.controls.USU_CONTRASENIA.updateValueAndValidity();
  }

  ngOnDestroy() {
    this.IdObservable.unsubscribe();
  }

  
  handleLoad(){
    setTimeout(() => {
      this.cargandoCaptchan = false;
    }, 70);
  }
  
  submit() {
    this.cargarValidaciones();
    if(this.loginForm.invalid){
      this.loginForm.markAllAsTouched();
      return;
    }
    this.error = false;
    this.cargando = true;
    this.buscarAliasDelPostulante(this.loginForm.value.USU_USUARIO)
    .then(good => {
      const USU_CONTRASENIA = this.loginForm.value.USU_CONTRASENIA;
      let cantidad = this.POST_ALIAS.length;
      let codigoAscii = '';
      let dividir;
      let firstMitad, secondMitad;

      let textoCompleto: string;

      this.postulante.POST_ALIAS = this.POST_ALIAS;
      this.postulante.POST_CONTRASENIA = USU_CONTRASENIA;

      this.disableButton = true;
      if (this.evento != null) {
          this.postulanteService.verificarCredenciales(this.postulante)
          .subscribe((respuesta) => {
            this.disableButton = false;
            if (respuesta.exito) {
                for ( let i = 0; i < cantidad ; i++) {
                  codigoAscii = codigoAscii + this.POST_ALIAS[i].charCodeAt(0).toString()+"&";
                }
                cantidad = codigoAscii.length;
                dividir = cantidad / 2;
                firstMitad = codigoAscii.substring(0, Math.round(dividir));
                secondMitad = codigoAscii.substring(Math.round(dividir), codigoAscii.length);
                secondMitad = secondMitad.slice(0, secondMitad.length-1);
              textoCompleto = cantidad + '$$' + firstMitad + respuesta.autenticar + secondMitad;
                this.storageService.storeString('USE_SUB', textoCompleto); // todo el valor de la cabecera
                this.storageService.storeString('TIPO_SESION', '0'); // si es 0 es postulante, si es 1 es un usuario (cliente o especialista)
                this.storageService.storeString('USE_USUARIO', this.POST_ALIAS);
                this.storageService.storeString('POST_ID', respuesta.id_postulante);
                this.storageService.storeString('isLoggedin', 'true');
                if(respuesta.contra_pendiente === 1){
                  this.cargando = false;
                  if(respuesta.estado == null)
                    respuesta.estado = "2";
                  
                  this.storageService.storeString('MOVIL','0');//si es 0 es iniciado la sesión desde una laptop/pc y si es 1 desde un dispositivo movil
                  this.authService.checkedGuardPostulante(true);
                  this.storageService.storeString('USE_STATE','0');
                  this.routingService.replace(['app/postulante/postulacion'])
                }else{
                  //cuando un postulante es registrado recién, su estado es nulo por lo que es mejor asignarle un valor para que no tener errores al momento de asignar valor al USE_STATE en el localstorage
                  if(respuesta.estado == null)
                    respuesta.estado = "2";

                  this.authService.checkedGuardPostulante(true);
                  this.storageService.storeString('USE_STATE', respuesta.estado.toString());
                  // location.reload();
                  this.routingService.replace(['app/postulante/postulacion']);
                }
            }
          }, error => {
            this.tipoColorAlertaLogin = 'danger';
            this.disableButton = false;
            this.cargando = false;
            this.error = true;
            if (error['error']['error'] !== undefined) {
              if (error['error']['error'] === 'error_deBD') {
                this.mensajeError = 'Hubo un error al intentar ejecutar su solicitud. Por favor, intente de nuevo.';
              } else if (error['error']['error'] === 'error_deAlias') {
                this.mensajeError = 'No se puede iniciar sesión. Verifique sus credenciales, por favor.';
              } else if (error['error']['error'] === 'error_deContra') {
                this.mensajeError = 'No se puede iniciar sesión. Verifique sus credenciales, por favor.';
              } else if (error['error']['error'] === 'error_deEstadoNoValido') {
                this.mensajeError = 'Su postulación ya ha sido aceptada. Ingrese con una cuenta de postulante, por favor.';
              } else if (error['error']['error'] === 'error_deEstadoBloqueado'){
                this.mensajeError = "Esta cuenta ha sido bloqueada. Por favor, comuníquese con un administrador.";
              } else if (error['error']['error'] === 'error_deCampo') {
                this.mensajeError = 'Los datos ingresados no son válidos. El alias no debe exceder los 15 caracteres y la contraseña no debe ser menor a 8 caracteres y exceder los 20 caracteres';
              }
            } else {
              this.mensajeError = 'Hubo un error al validar tus credenciales. Por favor, intenta nuevamente';
            }
          });
      } else {
        // this.tipoColorAlertaLogin = 'danger';
        // this.cargando = false;
        // this.error = true;
        // this.mensajeError = 'Es necesario realizar el captcha para iniciar sesión.';
      }
    })
    .catch(bad => {
      this.tipoColorAlertaLogin = 'danger';
      this.cargando = false;
      this.error = true;
      if (bad['error']['error'] !== undefined) {
        if (bad['error']['error'] === 'error_noExistenciaDeAlias') {
          this.mensajeError = 'El email o alias de usuario proporcionado no se encuentra registrado.';
        }else if (bad['error']['error'] === 'error_deBD') {
          this.mensajeError = 'Hubo un error al intentar ejecutar su solicitud. Por favor, intente de nuevo.';
        }
      } else {
        this.mensajeError = 'Hubo un error al iniciar sesión. Por favor, intente de nuevo.';
      }
    });
    
  }

  buscarAliasDelPostulante(identificador){
    this.cargando = true;
    const aliaspromise = new Promise((resolve, reject) => {
      this.postulanteService.buscarAliasPostulante(identificador).subscribe(data=>{
        this.POST_ALIAS=data['resultado'];
        this.cargando = false;
        resolve(data);
      },error=>{
        reject(error);
        
      });
    });
    return aliaspromise;
  }
  handleSuccess(data) {
    this.evento = data;
    this.disableButton = false;
  }

  forgotPassword() {
    this.emailForm.reset();
    this.mostrarAlertaModal = false; 
    this.mensajeModal = '';
    this.modal.open(this.elementForgotPassword);
  }
  
  abrirModalRegistro(){
    this.modal.open(this.tEspecialista);
  }

  closeModal(): any {
    this.modal.dismissAll();
  }

  redireccionarRegistroEspecialistaPersona() {
    this.navBarService.definirTipoEspecialista(0); // persona.
    this.router.navigate(['registro-postulante']);
    this.modal.dismissAll();
  }
  redireccionarRegistroEspecialistaEmpresa() {
    this.navBarService.definirTipoEspecialista(1); // empresa
    this.router.navigate(['registro-postulante']);
    this.modal.dismissAll();
  }

  recuperarCuentaUsuario() {
    this.emailForm.controls.usu_email.setValidators(Validators.required);
    this.emailForm.controls.usu_email.updateValueAndValidity();
    if(this.emailForm.invalid){
      this.mostrarAlertaModal = true;
      this.tipoAlertaModal = "warning";
      this.mensajeModal = "Debe escribir su correo correctamente para poder recuperar la cuenta.";
    }else{
      this.mostrarAlertaModal = false;
      this.cargandoModal = true;
      let emailPostulante = this.usu_email.value; 
      this.recuperarCuentaService.solicitudCambioContrasena(emailPostulante,1).subscribe(
        (mensaje) => {
          this.mostrarAlertaModal = true;
          this.IngresoCodigoRecuperacion = true;
          this.tipoAlertaModal = "success";
          this.mensajeModal = 'Se le acaba de enviar un código de verificación a su correo electrónico.';
          this.cargandoModal = false;
          this.mensajeBotonModal = "Reenviar";
          this.emailForm.controls.usu_email.disable();// deshabilitar el campo del email
          this.bandera = true;
          if(this.bandera)
            this.mensaje_reenviar = "¿No recibiste el correo? Haz click en el botón reenviar.";
          else
            this.mensaje_reenviar = ''; 
        },
        (error) => {
          this.emailForm.controls.usu_email.disable();// deshabilitar el campo del email
          this.mostrarAlertaModal = true;
          this.tipoAlertaModal = "danger";
          this.cargandoModal = false;
          this.mensajeBotonModal = "Reenviar";
          if (error['error']['error'] !== undefined) {
            if (error['error']['error'] === 'error_deCampo') {
              this.mensajeModal = 'Los datos ingresados deben respetar los formatos permitidos. Por favor, intente de nuevo.';
            } else if (error['error']['error'] === 'error_deEmailNoEnviado') {
              this.mensajeModal = 'Ocurrió un problema al envíar el correo. Por favor, intente de nuevo.';
            } else if (error['error']['error'] === 'error_deBD') {
              this.mensajeModal = 'Hubo un error al intentar ejecutar su solicitud. Por favor, intente de nuevo.';
            } else if (error['error']['error'] === "error_deEstadoNoValido"){
              this.mensajeModal = 'El correo proporcionado no se encuentra registrado.';
            } else if(error['error']['error'] === "error_cambioEstadoContrasenia"){
              this.mensajeModal = 'Hubo un error al hacer la solicitud de cambio de contraseña. Por favor, intente de nuevo.';
            } else if(error['error']['error'] === "error_guardarCodigoDeRecuperacion"){
              this.mensajeModal = 'Hubo un error al generar el código de recuperación de cuenta. Por favor, intente de nuevo.';
            } else if(error['error']['error'] === "error_noEstadoPostulante"){
              this.mensajeModal = 'Hubo un error al verificar el correo del postulante. Por favor, intente de nuevo.';
            } else if (error['error']['error'] === 'error_emailNoValido') {
              this.mensajeModal = 'El correo proporcionado no se encuentra registrado.';
            }
          } else {
            this.mensajeModal = 'Hubo un error al solicitar la recuperación de cuenta. Por favor, intente de nuevo.';
          }
        } 
      );
    }
  }

  get usu_email() {
    return this.emailForm.get('usu_email');
  }
  get usu_codigoRecuperacionCuenta() {
    return this.emailForm.get('usu_codigoRecuperacionCuenta');
  }
  verificiarCodigoRecuperacion(){
    this.cargandoModal = true;
    this.buscarAliasDelPostulante(this.usu_email.value)

    .then((good) =>{
      this.disableButton = true;
      this.recuperarCuentaService.verificiarCodigoRecuperacion(this.usu_email.value,1,this.usu_codigoRecuperacionCuenta.value).subscribe(
        respuesta =>{
          this.storageService.storeString('TIPO_SESION', '0'); // si es 0 es postulante, si es 1 es un usuario (cliente o especialista)
          this.storageService.storeString('USE_USUARIO', this.POST_ALIAS);
          this.storageService.storeString('POST_ID', respuesta.id_postulante);
          this.storageService.storeString('USE_STATE', '2');
          this.cargandoModal = false;
          this.routingService.replace(['/change-password-post']);
          this.modal.dismissAll();

        },error=>{
          this.mostrarAlertaModal = true;
          this.tipoAlertaModal = 'danger';
          this.cargandoModal = false;
          const emailFormat = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
          this.emailForm =  this.formBuilder.group({
            usu_email: [this.usu_email.value, [Validators.required, Validators.pattern(emailFormat), Validators.maxLength(60), Validators.email]],
            usu_codigoRecuperacionCuenta: ['', [Validators.pattern(/^([0-9])*$/),Validators.minLength(5),Validators.maxLength(5)]]
          });
          if (error['error']['error'] !== undefined) {
            if (error['error']['error'] === 'error_deCampo') {
              this.mensajeModal = 'Los datos ingresados deben respetar los formatos permitidos. Por favor, intente de nuevo.';
            } else if(error['error']['error'] === 'error_noCoincidenciaDeCodigoDeRecuperacion'){
              this.mensajeModal = 'El código de recuperación es incorrecto. Por favor, intente de nuevo.';
            } else if (error['error']['error'] === 'error_noExistenciaDeCodigoDeRecuperacion'){
              this.mensajeModal = 'No tiene un código de recuperación pendiente.';
            } else if (error['error']['error'] === 'error_emailNoValido') {
              this.mensajeModal = 'El correo proporcionado no se encuentra registrado.';
            }else if (error['error']['error'] === 'error_deBD') {
              this.mensajeModal = 'Hubo un error al intentar ejecutar su solicitud. Por favor, intente de nuevo.';
            } 
          } else {
            this.mensajeModal = 'Hubo un error al intentar verificar el código de recuperación. Por favor, intente de nuevo.';
          }
        })
    })
    .catch(bad => {
      this.cargandoModal = false;
      this.mostrarAlertaModal = true;
      if (bad['error']['error'] !== undefined) {
        if (bad['error']['error'] === 'error_noExistenciaDeAlias') {
          this.mensajeModal = 'El email o alias de usuario proporcionado no se encuentra registrado.';
          this.tipoAlertaModal='danger';
        }else if (bad['error']['error'] === 'error_deBD') {
          this.mensajeModal = 'Hubo un error al intentar ejecutar su solicitud. Por favor, intente de nuevo.';
          this.tipoAlertaModal='danger';
        }
      } else {
        this.tipoAlertaModal='danger';
        this.mensajeModal = 'Hubo un error al autentificar. Por favor, intente de nuevo.';
      }
    });
  }
  
  cambiarVistaPassword() {
    if (this.PASSWORD_ICON === 'fa fa-eye-slash border-span') {
      this.PASSWORD_ICON = 'fa fa-eye border-span';
      this.PASSWORD_TYPE = 'text';
    } else {
      this.PASSWORD_ICON = 'fa fa-eye-slash border-span';
      this.PASSWORD_TYPE = 'password';
    }
  }

}
