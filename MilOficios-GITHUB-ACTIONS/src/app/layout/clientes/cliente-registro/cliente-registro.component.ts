
import { Component, ElementRef, OnInit, ViewChild  } from '@angular/core';
import { DatePipe } from '@angular/common';
import { NgbAlert, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder,  Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { StorageService } from 'src/app/helpers/storage.service';
import {Pais} from '../../paises/pais.model';
import {Idiomas} from '../../idiomas/idiomas.models';
import {PaisesService} from '../../paises/paises.service';
import {Region} from '../../regiones/region.model';
import {Provincia} from '../../provincias/provincia.model';
import {Distrito} from '../../distritos/distrito.model';
import {TipoEmpresa} from '../../tipo-empresa/tipo-empresa.model';
import {Cliente} from '../../clientes/cliente.model';
import {Tarjeta} from '../../tarjetas/tarjeta.model';
import {RegionesService} from '../../regiones/regiones.service';
import {ProvinciasService} from '../../provincias/provincias.service';
import {DistritosService} from '../../distritos/distritos.service';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import {IdiomasService} from '../../idiomas/idiomas.service';
import {TipoEmpresaService} from '../../tipo-empresa/tipo-empresa.service';
import {ClienteService} from '../../clientes/cliente.service';
import {NavbarService} from '../../../shared/navbar/navbar.service';
import { passwordValidation } from 'src/app/shared/modules/password-validation/password-validation.directive';
import { environment } from 'src/environments/environment';
 

@Component({
  selector: 'app-cliente-registro',
  templateUrl: './cliente-registro.component.html',
  styleUrls: ['./cliente-registro.component.scss']
})
export class ClienteRegistroComponent implements OnInit {
  PAISES: Pais[];
  REGIONES: Region[];
  PROVINCIAS: Provincia[];
  DISTRITOS: Distrito[];
  IDIOMAS: Idiomas[];
  TIPOEMPRESA: TipoEmpresa[];
  CLIENTE = new Cliente();
  TARJETA = new Tarjeta();
  sexo = 'M';
  post_foto: any = '';
  rutaTerminosCondiciones:string = environment.domain_url+'/archivos/TerminosYCondiciones.pdf';
  public usuarioForm: FormGroup;
  public datPersonalesForm: FormGroup;
  public datContactoForm: FormGroup;
  public  datJuridicos: FormGroup;
  mostrarAlertaTerminos = false;
  opacarDateFechaNacimiento = true;

  carga = false;
  cambiarProfile = false;
  esValidoContrasena = true;
  idDistrito: number;
  tipoPersona: string;
  mensajeFotoError: string;
  mostrarAlertaFoto = false;
  imageChangedEvent: any = '';
  croppedImage: any = '';

  cargaDeDato = false;
  mostrarAlerta = false;
  tipoAlerta: string;
  mensaje: string;

  POST_FECH_NACIMIENTO;
  PASSWORD_CURRENT_ICON = 'fa fa-eye-slash';
  PASSWORD_CURRENT_TYPE = 'password';
  PASSWORD_NEW_ICON = 'fa fa-eye-slash';
  PASSWORD_NEW_TYPE = 'password';
  tipoPersonaCad: string;

  @ViewChild('foto') elementModalMostrarSubirImagenPerfil: ElementRef;
  @ViewChild('terminos') elementModalTerminosyCondiciones: ElementRef;
  @ViewChild('Redirrecionar') redireccionarLoginPostulante: ElementRef;
  @ViewChild('selfClosingAlert', {static: false}) selfClosingAlert: NgbAlert;
  

  constructor(
    private provinciaServicio: ProvinciasService,
    private distritoServicio: DistritosService,
    private paisesServicio: PaisesService,
    private regionServicio: RegionesService,
    private tipoEmpresaServicio: TipoEmpresaService,
    private formBuilder: FormBuilder ,
    private datePipe: DatePipe,
    private router: Router,
    private idiomaService: IdiomasService,
    private storageService: StorageService,
    public modal: NgbModal,
    public clienteService: ClienteService,
    private navbarService: NavbarService
  ) { }

  ngOnInit(): void {
    this.inicializarRegistro();
    this.obtenerIdiomas();
    this.obtenerTipoEmpresa();
    this.obtenerDatosPaises();    
  }
  inicializarRegistro() {
    this.navbarService.enviarTipoUsuario().subscribe( x => {
      console.log('xx',x);
      if (x === 0) {
        this.tipoPersona = '0';
        this.inicializarUsuarioForm();
        this.inicializarDatosPersonalesForm();
        this.inicializarDatosContactoForm();
      } else if (x === 1) {
        this.tipoPersona = '1';
        this.inicializarUsuarioForm();
        this.inicializarDatosPersonalesForm();
        this.inicializarDatosContactoForm();
        this.inicializarDatosJurídicos();
      } else {
        this.router.navigate(['/home']);
      }
    } );
  }
  inicializarUsuarioForm() {
    this.usuarioForm =  this.formBuilder.group({
      usu_apodo: [''],
      contrasena: [''],
      contrasenaConfirmar: ['']
    });
  }
  redireccionarPagina() {
    this.modal.dismissAll();
    console.log('redirigiendo');
    this.navbarService.obtenerTipoUsuario(2);
    if(this.storageService.getString('MOVIL') === '0')
      this.router.navigate(['cliente/login']);
    else
      this.router.navigate(['cliente/login/movil']);
  }
  inicializarDatosPersonalesForm() {
    this.datPersonalesForm  =  this.formBuilder.group({
      nombre: [''],
      apellidoPaterno: [''],
      apellidoMaterno:  [''],
      date: [''],
      idioma: [''],
      dni: [''],
    });
  }
  inicializarDatosContactoForm() {
    this.datContactoForm  =  this.formBuilder.group({
      direccion: [''],
      correo: [''],
      celular: [''],
      pais: [''],
      departamento: [''],
      provincia: [''],
      distrito: [''],
      checkTerminos:[false]
    });
  }
    inicializarDatosJurídicos() {
      this.datJuridicos = this.formBuilder.group(
        {
          ruc: [''],
          razonSocial: [''],
          tipoEmpresa: ['']
        }
      );
    }

  getTodayFechaNacimiento(): string {
    const fechaActual = this.datePipe.transform(new Date(), 'yyyy-MM-dd').split('-');
    const dia = fechaActual[2];
    const mes = fechaActual[1];
    const anio = Number(fechaActual[0]) - 18;
    const fechaMaxima = anio + '-' + mes + '-' + dia;

    return new Date(fechaMaxima).toISOString().split('T')[0] ;
  }
  obtenerSexo(sexo) {
    this.sexo = sexo;
  }
  crearCliente() {
    this.POST_FECH_NACIMIENTO = this.datPersonalesForm.get('date').value;

    if (this.isValidoContrasenia(this.usuarioForm.get('contrasena').value, this.usuarioForm.get('contrasenaConfirmar').value)) {

        this.CLIENTE.USU_NOMBRES = this.nombre.value;
        this.CLIENTE.USU_APE_PAT = this.apellidoPaterno.value;
        this.CLIENTE.USU_APE_MAT = this.apellidoMaterno.value;
        this.CLIENTE.USU_SEXO = this.sexo;
        this.CLIENTE.USU_DNI = this.dni.value;
        this.CLIENTE.USU_FECH_NACIMIENTO = this.POST_FECH_NACIMIENTO;//datePipe.transform(this.datPersonalesForm.get('date').value, 'dd/MM/yyyy') ;
        this.CLIENTE.USU_CELULAR = this.celular.value;
        this.CLIENTE.USU_DIRECCION = this.direccion.value;
        this.CLIENTE.CLI_DESCRIPCION = '';
        this.CLIENTE.USU_EMAIL = this.correo.value;
        this.CLIENTE.PAI_ID = this.pais.value;
        this.CLIENTE.REG_ID = this.departamento.value;
        this.CLIENTE.PRO_ID = this.provincia.value;
        this.CLIENTE.DIST_ID = this.distrito.value;
        this.CLIENTE.USU_ALIAS = this.usu_apodo.value;
        this.CLIENTE.USU_CONTRASENIA = this.contrasena.value;
        this.CLIENTE.IDI_ID = +this.idioma.value;
        this.CLIENTE.CLI_TIPO = +this.tipoPersona;
        if (this.tipoPersona === '1') {
          this.CLIENTE.USU_RUC = this.ruc.value;
          this.CLIENTE.TIP_EMP_ID = this.tipoEmpresa.value;
          this.CLIENTE.JUR_RAZ_SOCIAL = this.razonSocial  .value;
        } else {
          this.CLIENTE.USU_RUC = '';
          this.CLIENTE.TIP_EMP_ID = 0;
          this.CLIENTE.JUR_RAZ_SOCIAL = '';
        }
        this.TARJETA.TAR_TITULAR = '';
        this.TARJETA.TAR_NUMERO = '';
        this.TARJETA.TAR_CVV = '';
        this.TARJETA.TAR_MES = '';
        this.TARJETA.TAR_ANIO = '';
        this.TARJETA.TIP_TAR_ID = '';

    } else {
      this.mostrarAlerta = true;
      this.tipoAlerta = 'danger';
      this.mensaje = 'Las contraseñas ingresadas no son iguales.';
      this.cerrarAlerta();
    }
  }
  mostrarModalRedireccion() {
    this.modal.open(this.redireccionarLoginPostulante, {size: ' lg'});
  }
  confirmarRegistro() {
    if(this.validarCamposUsuario()){
      this.carga = true;
      this.crearCliente();
      this.clienteService.insertCliente(this.CLIENTE, this.TARJETA, this.post_foto).subscribe(
        data => {
          if (this.tipoPersona === '0') {
            this.usuarioForm.reset();
            this.datPersonalesForm.reset();
            this.datContactoForm.reset();
          } else {
            this.usuarioForm.reset();
            this.datPersonalesForm.reset();
            this.datJuridicos.reset();
            this.datContactoForm.reset();
          }
          this.cambiarProfile = false;
          this.opacarDateFechaNacimiento = true;
          this.modal.dismissAll();
          this.mostrarModalRedireccion();
        }, error => {
          this.mostrarAlerta = true;
          this.tipoAlerta = 'danger';
          if (error['error']['error'] !== undefined) {
            if (error['error']['error'] === 'error_existenciaDeNombreUsuario') {
              this.mensaje = 'No se pudo registrar el cliente debido a que el nombre de usuario se encuentra registrado. Por favor, intente de nuevo.';
            } else if (error['error']['error'] === 'error_existenciaDeDni') {
              this.mensaje = 'No se pudo registrar el cliente debido a que el DNI ya se encuentra registrado. Por favor, intente de nuevo.';
            } else if (error['error']['error'] === 'error_existenciaDeEmail') {
              this.mensaje = 'No se pudo registrar el cliente debido a que el correo electrónico ya se encuentra registrado. Por favor, intente de nuevo.';
            } else if (error['error']['error'] === 'error_existenciaDeRuc') {
              this.mensaje = 'No se pudo registrar el cliente debido a que el RUC ya se encuentra registrado. Por favor, intente de nuevo.';
            } else if (error['error']['error'] === 'error_deBD') {
              this.mensaje = 'Hubo un error al intentar ejecutar su solicitud. Por favor, intente de nuevo.';
            } else if (error['error']['error'] === 'error_deCampo') {
              this.mensaje = 'Los datos ingresados deben respetar los formatos permitidos. Por favor, intente de nuevo.';
            }
          } else {
            this.mensaje = 'Hubo un error al intentar crear la cuenta. Por favor, intente de nuevo';
          }
          this.carga = false;
          this.cerrarAlerta();
      });
    }
  }
  validarCamposUsuario():boolean {
    this.validarCampos();
    this.validarFormularios();
    if (this.tipoPersona === '0') {
      if (this.usuarioForm.invalid || this.datContactoForm.invalid || this.datPersonalesForm.invalid ) {
        this.mostrarAlerta = true;
        this.tipoAlerta = 'danger';
        this.mensaje = 'Debe completar todos los campos';
        this.cerrarAlerta();
        return false;
      } else {
        if ( this.isValidoContrasenia(this.usuarioForm.get('contrasena').value , this.usuarioForm.get('contrasenaConfirmar').value ) === false    ) {
          this.mostrarAlerta = true;
          this.tipoAlerta = 'danger';
          this.mensaje = 'Las contraseñas deben ser iguales';
          this.usuarioForm.get('contrasena').setValue('');
          this.usuarioForm.get('contrasenaConfirmar').setValue('');
          this.cerrarAlerta();
          return false;
        }
      }
    }
    if (this.tipoPersona === '1') {
      if (this.datJuridicos.invalid) {
        this.mostrarAlerta = true;
        this.tipoAlerta = 'danger';
        this.mensaje = 'Debe completar todos los campos';
        this.cerrarAlerta();
        return false;
      } else {
        if ( this.isValidoContrasenia(this.usuarioForm.get('contrasena').value , this.usuarioForm.get('contrasenaConfirmar').value ) === false    ) {
          this.mostrarAlerta = true;
          this.tipoAlerta = 'danger';
          this.mensaje = 'Las contraseñas deben ser iguales';
          this.usuarioForm.get('contrasena').setValue('');
          this.usuarioForm.get('contrasenaConfirmar').setValue('');
          this.cerrarAlerta();
          return false;
        }         
      }
    }
    return true;
  }

  isValidoContrasenia(contrasena, confirmarContrasena): boolean  {
    if (contrasena === confirmarContrasena) {
      this.mostrarAlerta = false;
      return true;
    }
    return false;
  }

  obtenerDatosPaises() {
    this.paisesServicio.getPaises().subscribe( data => {
      this.PAISES = data['Resultado'];
    }, error => {
      this.tipoAlerta = 'danger';
      this.cargaDeDato = false;
      this.mostrarAlerta = true;
      if (error['error']['error'] !== undefined) {
        if (error['error']['error'] === 'error_deBD') {
            this.mensaje = 'No se pudo obtener los datos, debido a una falla de conexión. Por favor, intente otra vez.';
        }
      } else {
        this.mensaje = 'Hubo un error al intentar rescatar los países. Por favor, intente de nuevo';
      }
      this.cerrarAlerta();
    } );
  }
  obtenerTipoEmpresa() {
    this.tipoEmpresaServicio.getTipoEmpresa().subscribe( data => {
      this.TIPOEMPRESA = data['Resultado'];
    }, error => {
      this.tipoAlerta = 'danger';
      this.cargaDeDato = false;
      this.mostrarAlerta = true;
      this.cerrarAlerta();
      if (error['error']['error'] !== undefined) {
        if (error['error']['error'] === 'error_deBD') {
            this.mensaje = 'No se pudo obtener los datos, debido a una falla de conexión. Por favor, intente otra vez.';
        }
      } else {
        this.mensaje = 'Hubo un error al intentar rescatar los tipos de empresa. Por favor, intente de nuevo';
      }
    } );
  }
  obtenerIdiomas() {
    this.idiomaService.obtenerIdiomas().subscribe( data => {
      this.IDIOMAS = data['Resultado'];
    }, error => {
      this.tipoAlerta = 'danger';
      this.cargaDeDato = false;
      this.mostrarAlerta = true;
      if (error['error']['error'] !== undefined) {
        if (error['error']['error'] === 'error_deBD') {
            this.mensaje = 'No se pudo obtener los datos, debido a una falla de conexión. Por favor, intente otra vez.';
        }
      } else {
        this.mensaje = 'Hubo un error al intentar rescatar los idiomas. Por favor, intente de nuevo';
      }
      this.cerrarAlerta();
    } );
  }
  closeModal(): any {
    this.mostrarAlertaTerminos = false;
    this.modal.dismissAll();
  }

  obtenerRegion(paisSeleccionado) {
    this.regionServicio.getRegiones(paisSeleccionado).subscribe( data => {
      this.REGIONES = data['Resultado'];
    }, error => {
      this.tipoAlerta = 'danger';
      this.cargaDeDato = false;
      this.mostrarAlerta = true;
      if (error['error']['error'] !== undefined) {
        if (error['error']['error'] === 'error_deBD') {
            this.mensaje = 'No se pudo obtener los datos, debido a una falla de conexión. Por favor, intente otra vez.';
        } else if (error['error']['error'] === 'error_noExistenciaDeIdPai') {
          this.mensaje = 'No se pudo obtener las regiones . Por favor, intente con otra de nuevo.';
        } else if (error['error']['error'] === 'error_deCampo') {
          this.mensaje = 'Los datos ingresados deben respetar los formatos permitidos. Por favor, intente de nuevo.';
        }
      } else {
        this.mensaje = 'Hubo un error al intentar rescatar las regiones. Por favor, intente de nuevo';
      }
      this.cerrarAlerta();
    }
    );
  }

  obtenerProvincia(regionSeleccionado) {
    this.provinciaServicio.getProvincias(regionSeleccionado).subscribe( data => {
      this.PROVINCIAS = data['Resultado'];
    }, error => {
      this.tipoAlerta = 'danger';
      this.cargaDeDato = false;
      this.mostrarAlerta = true;
      if (error['error']['error'] !== undefined) {
        if (error['error']['error'] === 'error_deBD') {
            this.mensaje = 'No se pudo obtener los datos, debido a una falla de conexión. Por favor, intente otra vez.';
        } else if (error['error']['error'] === 'error_noExistenciaDeIdReg') {
          this.mensaje = 'No se pudo obtener las provincias. Por favor, intente con otra vez.';
        } else if (error['error']['error'] === 'error_deCampo') {
          this.mensaje = 'Los datos ingresados deben respetar los formatos permitidos. Por favor, intente de nuevo.';
        }
      } else {
        this.mensaje = 'Hubo un error al intentar rescatar las provincias. Por favor, intente de nuevo';
      }
      this.cerrarAlerta();
    }
    );
  }

  obtenerDistrito(provinciaSeleccionada) {
    this.distritoServicio.getDistrito(provinciaSeleccionada).subscribe( data => {
      this.DISTRITOS = data['Resultado'];
    }, error => {
      this.tipoAlerta = 'danger';
      this.cargaDeDato = false;
      this.mostrarAlerta = true;
      if (error['error']['error'] !== undefined) {
        if (error['error']['error'] === 'error_deBD') {
            this.mensaje = 'No se pudo obtener los datos, debido a una falla de conexión. Por favor, intente otra vez.';
        } else if (error['error']['error'] === 'error_noExistenciaDeIdPro') {
          this.mensaje = 'No se pudo obtener los distritos. Por favor, intente de nuevo.';
        } else if (error['error']['error'] === 'error_deCampo') {
          this.mensaje = 'Los datos ingresados deben respetar los formatos permitidos. Por favor, intente de nuevo.';
        }
      } else {
        this.mensaje = 'Hubo un error al intentar rescatar los distritos. Por favor, intente de nuevo';
      }
      this.cerrarAlerta();
    });
  }

  obtenerIDDistrito(id) {
    this.idDistrito = id;
  }
  cambiarDeStyleDate() {
    this.opacarDateFechaNacimiento = false;
  }

  cambiarVistaContrasenaActual() { // CAMBIA DE ICONO Y DE TIPO EN LA CONSTRASEÑA
    if (this.PASSWORD_CURRENT_ICON === 'fa fa-eye-slash') {
      this.PASSWORD_CURRENT_ICON = 'fa fa-eye';
      this.PASSWORD_CURRENT_TYPE = 'text';
    } else {
      this.PASSWORD_CURRENT_ICON = 'fa fa-eye-slash';
      this.PASSWORD_CURRENT_TYPE = 'password';
    }
  }

  cambiarVistaContrasenaNueva() { // CAMBIA DE ICONO Y DE TIPO EN CONFIRMAR CONSTRASEÑA
    if (this.PASSWORD_NEW_ICON === 'fa fa-eye-slash') {
      this.PASSWORD_NEW_ICON = 'fa fa-eye';
      this.PASSWORD_NEW_TYPE = 'text';
    } else {
      this.PASSWORD_NEW_ICON = 'fa fa-eye-slash';
      this.PASSWORD_NEW_TYPE = 'password';
    }
  }
  confirmarSubidaDeImagen() {
    this.cambiarProfile = true;
    this.modal.dismissAll();
  }
  mostrarModalSubirImagen() {
    this.imageChangedEvent = null;
    this.modal.open(this.elementModalMostrarSubirImagenPerfil );
  }

  subirImagen(event) {
    const files = event.target.files;
    if (files.length !== 0) {
      if ( this.obtenerExtension(files[0].name).toString().toUpperCase() === 'JPG' || this.obtenerExtension(files[0].name).toString().toUpperCase() === 'JPEG'  ||
          this.obtenerExtension(files[0].name).toString().toUpperCase() === 'PNG'  ) {
        this.mostrarAlertaFoto = false;
        this.imageChangedEvent = event;
        if (event.target.files && event.target.files[0]) {
          this.imageCropped(event);
        }
      } else {
        this.imageChangedEvent = '';
        this.mensajeFotoError = 'Error! : solo se admite imágenes con extensiones .png, .jpeg, .jpg';
        this.mostrarAlertaFoto = true;
      }
    } else {
      this.imageChangedEvent = null;
    }
  }
  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64; // Obtiene la imagen en base 64 y otros datos.
    this.post_foto = this.croppedImage?.toString().slice(22); // Obtiene la imagen en base 64.
  }


  obtenerExtension(filename): any {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
  }


  // Get usuarioForm
  get usu_apodo() {
    return this.usuarioForm.get('usu_apodo');
  }

  get contrasena() {
    return this.usuarioForm.get('contrasena');
  }

  get contrasenaConfirmar() {
    return this.usuarioForm.get('contrasenaConfirmar');
  }
  // Get datPersonalesForm
  get nombre() {
    return this.datPersonalesForm.get('nombre');
  }
  get idioma() {
    return this.datPersonalesForm.get('idioma');
  }
  get apellidoPaterno() {
    return this.datPersonalesForm.get('apellidoPaterno');
  }
  get apellidoMaterno() {
    return this.datPersonalesForm.get('apellidoMaterno');
  }
  get dni() {
    return this.datPersonalesForm.get('dni');
  }
  get date() {
    return this.datPersonalesForm.get('date');
  }
  // Get datContactoForm
  get direccion() {
    return this.datContactoForm.get('direccion');
  }
  get pais() {
    return this.datContactoForm.get('pais');
  }
  get provincia() {
    return this.datContactoForm.get('provincia');
  }
  get distrito() {
    return this.datContactoForm.get('distrito');
  }
  get departamento() {
    return this.datContactoForm.get('departamento');
  }
  get celular() {
    return this.datContactoForm.get('celular');
  }
  get correo() {
    return this.datContactoForm.get('correo');
  }
  get ruc() {
    return this.datJuridicos.get('ruc');
  }
  get razonSocial() {
    return this.datJuridicos.get('razonSocial');
  }
  get tipoEmpresa() {
    return this.datJuridicos.get('tipoEmpresa');
  }

  //nuevos cambios
  limpiarCampos(){
    this.usuarioForm.reset();
    this.datPersonalesForm.reset();
    this.datContactoForm.reset();
    
    this.inicializarUsuarioForm();
    this.inicializarDatosPersonalesForm();
    this.inicializarDatosContactoForm();
  }

  validarCampos(){
    this.usuarioForm.controls.usu_apodo.setValidators([Validators.required, Validators.pattern('[a-zñáéíóúA-ZÑÁÉÍÓÚ0-9]+'), Validators.maxLength(15)]);
    this.usuarioForm.controls.usu_apodo.updateValueAndValidity();
    this.usuarioForm.controls.contrasena.setValidators([Validators.required, Validators.minLength(8), Validators.maxLength(20),passwordValidation()]);
    this.usuarioForm.controls.contrasena.updateValueAndValidity();
    this.usuarioForm.controls.contrasenaConfirmar.setValidators([Validators.required, Validators.minLength(8), Validators.maxLength(20)]);
    this.usuarioForm.controls.contrasenaConfirmar.updateValueAndValidity();

    this.datPersonalesForm.controls.nombre.setValidators([Validators.required, Validators.pattern('[a-zñáéíóú A-ZÑÁÉÍÓÚ ]+'), Validators.maxLength(50)]);
    this.datPersonalesForm.controls.nombre.updateValueAndValidity();
    this.datPersonalesForm.controls.apellidoPaterno.setValidators([Validators.required, Validators.pattern('[a-zñáéíóú A-ZÑÁÉÍÓÚ ]+'), Validators.maxLength(30)]);
    this.datPersonalesForm.controls.apellidoPaterno.updateValueAndValidity();
    this.datPersonalesForm.controls.apellidoMaterno.setValidators([Validators.required, Validators.pattern('[a-zñáéíóú A-ZÑÁÉÍÓÚ ]+'), Validators.maxLength(30)]);
    this.datPersonalesForm.controls.apellidoMaterno.updateValueAndValidity();
    this.datPersonalesForm.controls.date.setValidators([Validators.required ]);
    this.datPersonalesForm.controls.date.updateValueAndValidity();
    this.datPersonalesForm.controls.idioma.setValidators([Validators.required ]);
    this.datPersonalesForm.controls.idioma.updateValueAndValidity();
    this.datPersonalesForm.controls.dni.setValidators([Validators.required, Validators.pattern(/^([0-9])*$/), Validators.minLength(8),  Validators.maxLength(8)]);
    this.datPersonalesForm.controls.dni.updateValueAndValidity();


    
    this.datContactoForm.controls.direccion.setValidators([Validators.required , Validators.pattern('^[a-zñáéíóú#°/,. A-ZÑÁÉÍÓÚ  0-9]+$'), Validators.maxLength(100)]);
    this.datContactoForm.controls.direccion.updateValueAndValidity();
    this.datContactoForm.controls.correo.setValidators([Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/), Validators.maxLength(60), Validators.email]);
    this.datContactoForm.controls.correo.updateValueAndValidity();
    this.datContactoForm.controls.celular.setValidators([Validators.required, Validators.pattern('[+][0-9]+'), Validators.maxLength(20), Validators.minLength(12)] );
    this.datContactoForm.controls.celular.updateValueAndValidity();
    this.datContactoForm.controls.pais.setValidators([Validators.required ]);
    this.datContactoForm.controls.pais.updateValueAndValidity();
    this.datContactoForm.controls.departamento.setValidators([Validators.required ]);
    this.datContactoForm.controls.departamento.updateValueAndValidity();
    this.datContactoForm.controls.provincia.setValidators([Validators.required ]);
    this.datContactoForm.controls.provincia.updateValueAndValidity();
    this.datContactoForm.controls.distrito.setValidators([Validators.required ]);
    this.datContactoForm.controls.distrito.updateValueAndValidity();
    
    if(this.datJuridicos){
      this.datJuridicos.controls.ruc.setValidators([Validators.required, Validators.pattern(/^([0-9])*$/), Validators.maxLength(11), Validators.minLength(11)]);
      this.datJuridicos.controls.ruc.updateValueAndValidity();
      
      this.datJuridicos.controls.razonSocial.setValidators([Validators.required, Validators.pattern('[a-zñáéíóú A-ZÑÁÉÍÓÚ ]+'), Validators.maxLength(100)]);
      this.datJuridicos.controls.razonSocial.updateValueAndValidity();
      
      this.datJuridicos.controls.tipoEmpresa.setValidators(Validators.required);
      this.datJuridicos.controls.tipoEmpresa.updateValueAndValidity();
    }
  }

  validarFormularios(){
    if (this.usuarioForm.invalid){
      this.usuarioForm.markAllAsTouched();
    }

    if (this.datPersonalesForm.invalid){
      this.datPersonalesForm.markAllAsTouched();
    }

    if (this.datContactoForm.invalid){
      this.datContactoForm.markAllAsTouched();
    }

    if (this.usuarioForm.invalid || this.datPersonalesForm.invalid || this.datContactoForm.invalid)
      return;
  }

  abrirVentana(){
    window.open(this.rutaTerminosCondiciones, "_blank"); 
  }

  cerrarAlerta(){
    setTimeout(() => {
      this.mostrarAlerta=false;
      this.mostrarAlertaTerminos=false;
    }, 5000);
  }
}
