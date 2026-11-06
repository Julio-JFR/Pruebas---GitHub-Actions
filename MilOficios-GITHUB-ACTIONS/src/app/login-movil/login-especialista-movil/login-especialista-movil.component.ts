import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { ReCaptcha2Component } from 'ngx-captcha';
import { RoutingService } from 'src/app/helpers/routing.service';
import { StorageService } from 'src/app/helpers/storage.service';
import { UsuariosService } from 'src/app/layout/usuarios/usuarios.service';
import { routerTransition } from '../../router.animations';
import { environment } from 'src/environments/environment';
import { RecuperarCuentaService } from '../../login/recuperar-cuenta.service';
import { NavbarService } from 'src/app/shared/navbar/navbar.service';
import { TrabajosConfirmadosService } from 'src/app/layout/trabajos-confirmados/trabajos-confirmados.service';

@Component({
  selector: 'app-login-especialista-movil',
  templateUrl: './login-especialista-movil.component.html',
  styleUrls: ['./login-especialista-movil.component.scss'],
  animations: [routerTransition()]
})
export class LoginEspecialistaMovilComponent implements OnInit {

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
  loginForm:FormGroup;
  
  mensajeModal = "";
  mostrarAlertaModal = false;
  tipoAlertaModal = "";
  emailForm: any;
  emailUsuario: string;
  IngresoCodigoRecuperacion=false;
  tipoColorAlertaLogin='danger';
  evento = null;

  bandera = false;
  btnEnviar:string = 'Enviar';
  mensaje_reenviar:string = '';
  mensajeBotonModal:string = "Enviar";
  cargandoCaptchan:boolean=true;

  //Captcha 6Lc2VQkaAAAAAJd9mmUzulkvacYFfh1Tz7HNsRt- (miloficios.rjberru.com)
  //6LfQdNAZAAAAACltytoB-Q5cAdVXV5WN6drcIbf4 para el localhost
  //nuevo captcha 6LexAS0aAAAAAAx69bq3DhX62cGbU-ZOSDDyZKwb (despliegue.rjberru.com)
  siteKey = environment.captcha;
  USU_USUARIO: any;

  constructor(private formBuilder: FormBuilder, 
    public router: Router,
    private modal: NgbModal,
    private storageService: StorageService, 
    private routingService: RoutingService,
    private usuarioService: UsuariosService,
    private navBarService: NavbarService,
    private recuperarCuentaService: RecuperarCuentaService,
    private trabajosConfirmadosService:TrabajosConfirmadosService,
    configModal: NgbModalConfig ){ 
      configModal.backdrop = 'static';
      configModal.keyboard = false;
  }

  ngOnInit(): void {
    this.cargandoModal = false;
    if(this.storageService.getString('isLoggedin') == 'true'){ //If the user has logged in
      this.routingService.replace(['/']); //Navigate to the main page
    }
    else {
      const cookies = localStorage.getItem('cookieConsent') === 'true';
      localStorage.setItem('MOVIL','1');
      localStorage.setItem('cookieConsent', cookies ? 'true' : 'false');
      this.disableButton = true;
      this.aFormGroup = this.formBuilder.group({
        recaptcha: ['', Validators.required]
      });

      const emailFormat = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
      this.emailForm =  this.formBuilder.group({
        usu_email: [''],
        usu_codigoRecuperacionCuenta: ['']
      });
    }
    localStorage.setItem('USE_TYPE_MOVIL','1');
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


  handleLoad(){
    setTimeout(() => {
      this.cargandoCaptchan = false;
    }, 80);
  }

  submit() {
    this.cargarValidaciones();
    if(this.loginForm.invalid){
      this.loginForm.markAllAsTouched();
      return;
    }
    this.error = false; 
    this.cargando = true;  
    this.buscarAliasDelUsuario(this.loginForm.value.USU_USUARIO)
    .then(good => {
      let USU_CONTRASENIA = this.loginForm.value.USU_CONTRASENIA;     
      let cantidad = this.USU_USUARIO.length;
      let codigoAscii: string = '';
      let dividir;
      let firstMitad, secondMitad;
      let textoCompleto: string;
      
      if (this.evento != null) {
          this.usuarioService.verificarCredenciales(this.USU_USUARIO.toLowerCase(), USU_CONTRASENIA, 1)
          .subscribe((respuesta)=>{
            if(respuesta.exito) //Credentials are correct
            {
                for ( let i=0; i< cantidad ; i++){
                  codigoAscii = codigoAscii + this.USU_USUARIO.toLowerCase()[i].charCodeAt(0).toString()+"&";
                }
                cantidad = codigoAscii.length;
                dividir = cantidad/2;
                firstMitad = codigoAscii.substring(0,Math.round(dividir));
                secondMitad = codigoAscii.substring(Math.round(dividir),codigoAscii.length);
                secondMitad = secondMitad.slice(0, secondMitad.length-1);
                textoCompleto = cantidad + "$$" + firstMitad + respuesta.autenticar + secondMitad;
                this.storageService.storeString('USE_SUB', textoCompleto);
                this.storageService.storeString('USE_USUARIO',this.USU_USUARIO.toLowerCase());    // Nombre de usuario (alias)
                this.storageService.storeString('USE_ID', respuesta.id);      // Es el ID de especialista, no el de usuario
                this.storageService.storeString('USE_NAMES', respuesta.fullName);   // Concatenación de nombres y apellidos
                this.storageService.storeString('USE_TYPE', "1");     // Tipo de usuario 1, representa a un especialista
                this.storageService.storeString('USE_TYPE_MOVIL','1');
                this.storageService.storeString('USE_STATE', respuesta.estado.toString());
                this.storageService.storeString('USE_CRO', 'H2aUzWe$nDjVRji1b5Z&8Y^h!FUJ5m!$I');
                const navegadores = window.navigator['userAgentData']?.brands;
                let navegadoresDisponibles = navegadores ? navegadores.filter(dat => dat['brand']!='Not_A Brand') : [];
                this.storageService.storeString('navegador',navegadoresDisponibles[1]?.brand??'' +navegadoresDisponibles[1]?.version??'');
                if (respuesta.servicioIniciado=='1') {
                  let fechaActual = new Date();
                  this.storageService.storeString('USE_SERV_ACTIVO', '1');
                  let fechaFin = new Date(respuesta.fechaServicio);
                  let dif = fechaActual.getTime() - fechaFin.getTime();
                  this.storageService.storeString('USER_FEL', (dif/1000).toFixed());
                  this.storageService.storeString('FECHA_INI', respuesta.fechaServicio);

                  this.obtenerURL(respuesta.SERE_ID, respuesta.USU_ID);
                  this.trabajosConfirmadosService.updateHeaders();
                  this.trabajosConfirmadosService.getTrabajosConfirmados(localStorage.getItem('USE_ID')).subscribe(resp => {
                    localStorage.setItem('TRA_CNF',resp['Resultado'][0])
                    this.trabajosConfirmadosService.recibirTrabajoConfirmado(resp['Resultado'][0]);
                  })
                }else{
                  this.storageService.storeString('USE_SERV_ACTIVO', '0');
                }

                if(respuesta.estado == 0) {     // Si estado es "inactivo" (0), entonces muestra un mensaje de error
                  this.cargando = false;
                  this.error = true;
                  this.mensajeError = "Su cuenta se encuentra inactiva, comuníquese con soporte para obtener más información.";
                  const cookies = localStorage.getItem('cookieConsent') === 'true';
                  localStorage.setItem('cookieConsent', cookies ? 'true' : 'false');
                }
                else if(respuesta.estado == 1) {    // Si estado es "activo" (1), entonces lo redirecciona a la página principal
                  this.storageService.storeString('MOVIL','1');//si es 0 es iniciado la sesión desde una laptop/pc y si es 1 desde un dispositivo movil
                  this.storageService.storeString('TIPO_SESION',"1");   //si es 0 es postulante, si es 1 es un usuario (cliente o especialista)  
                  if (this.storageService.hasKey('USER_FEL') || this.storageService.hasKey('MR') ){
                    this.storageService.storeString('USE_CRO', 'H2aUzWe$nDjVZji1b5Z&8Y^h!FUJ5m!$I');
                    const url = '/realizarServicio/'+respuesta.SERE_ID+'/'+ respuesta.USU_ID;
                    this.router.navigate([url]);
                    // this.routingService.replace(['/trabajos-ejecucion']);
                  }else{
                    this.routingService.replace(['/app/especialista/solicitudes']);
                  }
                }
                else if(respuesta.estado == 2) {    // Si estado es "Pendiente de cambio de contraseña" (2), entonces lo redirecciona a la página para cambiar su contraseña
                  this.cargando = false;
                  this.storageService.storeString('USE_STATE', '1');

                  this.storageService.storeString('TIPO_SESION', '1');   // si es 0 es postulante, si es 1 es un usuario (cliente o especialista)
                // alert('Redireccionar a la página de clientes');
                  if (this.storageService.hasKey('USER_FEL') || this.storageService.hasKey('MR') ){
                    setTimeout(() => this.routingService.replace(['/trabajos-ejecucion']),500);
                  }else{
                    setTimeout(() => this.routingService.replace(['/app/especialista/solicitudes']),500);
                  }
                }
                else {    // Si no se obtiene un estádo válido
                  this.cargando = false;
                  this.error = true;
                  this.tipoColorAlertaLogin='danger';
                  this.mensajeError = "Ocurrió un problema al verificar el estado de su cuenta. Por favor, intenta nuevamente";
                  
                  const cookies = localStorage.getItem('cookieConsent') === 'true';
                  localStorage.setItem('cookieConsent', cookies ? 'true' : 'false');
                }
            }
            else {
              this.error = true;
              this.tipoColorAlertaLogin='danger';
              this.mensajeError = "Las credenciales ingresadas son incorrectas. Por favor, intenta nuevamente"
            }
            this.cargando = false;
          }, error=>{
              this.cargando = false;  
              this.error = true;
              this.tipoColorAlertaLogin='danger';
              this.mensajeError = "Hubo un error al validar tus credenciales. Por favor, intenta nuevamente";
          });
      }
      else{
          this.cargando=false;
          this.error = true;
          this.tipoColorAlertaLogin='danger';
          this.mensajeError = "Es necesario realizar el captcha para iniciar sesión";
      }
    })
    .catch((bad => {
      this.cargando = false;
      this.error = true;
      if (bad['error']['error'] !== undefined) {
        if (bad['error']['error'] === 'error_noExistenciaDeAlias') {
          this.tipoColorAlertaLogin='danger';
          this.mensajeError = 'El email o alias de usuario proporcionado no se encuentra registrado.';
        }else if (bad['error']['error'] === 'error_deBD') {
          this.tipoColorAlertaLogin='danger';
          this.mensajeError = 'Hubo un error al intentar ejecutar su solicitud. Por favor, intente de nuevo.';
        }
      } else {
        this.tipoColorAlertaLogin='danger';
        this.mensajeError = 'Hubo un error al iniciar sesión. Por favor, intente de nuevo.';
      }
    })
    )
    
    
  }

  handleSuccess(data) {
    this.evento = data;
    this.disableButton = false;
  }
  buscarAliasDelUsuario(identificador){
    const aliasprommise = new Promise((resolve, reject) => {
      this.usuarioService.buscarAliasUsuario(identificador).subscribe(data=>{
        this.USU_USUARIO=data['resultado'];
        //this.cargando = false;
        resolve(data);
      },error=>{
        reject(error);
        
      });
    });
    return aliasprommise;
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
      this.emailUsuario = this.usu_email.value;
      this.recuperarCuentaService.solicitudCambioContrasena(this.emailUsuario,0,1).subscribe(
        (mensaje) => {
          this.mostrarAlertaModal = true;
          this.IngresoCodigoRecuperacion = true;
          this.tipoAlertaModal = "success";
          this.mensajeModal = 'Se le acaba de enviar un código de verificación a su correo electrónico.';
          this.cargandoModal = false;
          this.mensajeBotonModal = "Reenviar";
          this.emailForm.controls.usu_email.disable();// deshabilitar el campo del email
          this.bandera = true;
          //this.emailForm.reset();
          if(this.bandera)
          this.mensaje_reenviar = "¿No recibiste el correo? Haz click en el botón reenviar.";
          else
          this.mensaje_reenviar = '';
        },
        (error) => {
          this.mostrarAlertaModal = true;
          this.tipoAlertaModal = "danger";
          this.cargandoModal = false;
          if (error['error']['error'] !== undefined) {
            if (error['error']['error'] === 'error_deCampo') {
              this.mensajeModal = 'Los datos ingresados deben respetar los formatos permitidos. Por favor, intente de nuevo.';
            }else if (error['error']['error'] === 'error_deEmailNoEnviado') {
              this.mensajeModal = 'Ocurrió un problema al envia el correo. Por favor, intente de nuevo.';
            } else if (error['error']['error'] === 'error_deBD') {
              this.mensajeModal = 'Hubo un error al intentar ejecutar su solicitud. Por favor, intente de nuevo.';
            } else if(error['error']['error'] === 'error_cambioEstadoContrasenia'){
              this.mensajeModal = 'Hubo un error al hacer la solicitud de cambio de contraseña. Por favor, intente de nuevo.';
            } else if(error['error']['error'] === "error_guardarCodigoDeRecuperacion"){
              this.mensajeModal = 'Hubo un error al generar el código de recuperación de cuenta. Por favor, intente de nuevo.';
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
    this.buscarAliasDelUsuario(this.usu_email.value)

    .then((good) =>{
      this.recuperarCuentaService.verificiarCodigoRecuperacion(this.usu_email.value,0,this.usu_codigoRecuperacionCuenta.value).subscribe(
        respuesta =>{
          this.storageService.storeString('USE_USUARIO', this.USU_USUARIO.toLowerCase());    // Nombre de usuario (alias)
          this.storageService.storeString("USE_EMAIL", this.usu_email.value); //email del cliente
          this.storageService.storeString('TIPO_SESION',"1");   //si es 0 es postulante, si es 1 es un usuario (cliente o especialista)  
          this.storageService.storeString('USE_TYPE', '1');     // Tipo de usuario 0, representa a un cliente
          this.storageService.storeString('USE_STATE','2');
          this.cargandoModal = true;
          this.routingService.replace(['/change-password']);
          this.modal.dismissAll();
        },error=>{
          this.mostrarAlertaModal = true;
          this.tipoAlertaModal = 'danger';
          this.cargandoModal = false;
          if (error['error']['error'] !== undefined) {
            if (error['error']['error'] === 'error_deCampo') {
              this.mensajeModal = 'Los datos ingresados deben respetar los formatos permitidos. Por favor, intente de nuevo.';
            } else if(error['error']['error'] === 'error_noCoincidenciaDeCodigoDeRecuperacion'){
              this.mensajeModal = 'El código de recuperación es correcto. Por favor, intente de nuevo.';
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

  obtenerURL(SERE_ID, USU_ID) {
    this.storageService.storeString('USER_CRO', '1');
    this.storageService.storeString('USE_CRO', 'H2aUzWe$nDjVZji1b5Z&8Y^h!FUJ5m!$I');
    this.storageService.storeString('servRealizadoID', SERE_ID);
    this.storageService.storeString('usuarioID', USU_ID);
  }

}
