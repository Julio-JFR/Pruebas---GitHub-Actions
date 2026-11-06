import { Component, ElementRef, OnInit, ViewChildren, QueryList, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { EspecialistasService } from '../especialistas.service';
import { Especialista } from '../especialista.model';
import { NgbModal,NgbAlert } from '@ng-bootstrap/ng-bootstrap';
import { ServiciosService } from '../../servicios/servicios.service';
import { CategoriasService } from '../../servicios/categorias/categorias.service';
import { DatePipe } from '@angular/common';
import { sortableDirective, compare } from 'src/app/shared/modules/sortable/sortable.directive';
import { FormBuilder, Validators } from '@angular/forms';
import { UsuariosService } from '../../usuarios/usuarios.service';
import { StorageService } from 'src/app/helpers/storage.service';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { passwordValidation } from 'src/app/shared/modules/password-validation/password-validation.directive';
import { environment } from 'src/environments/environment';


interface HtmlInputEvent extends Event{
  target: HTMLInputElement & EventTarget;
}
@Component({
  selector: 'app-especialistas-profile',
  templateUrl: './especialistas-profile.component.html',
  styleUrls: ['./especialistas-profile.component.scss']
})
export class EspecialistasProfileComponent implements OnInit {

  // MODAL CONFIRMACION
  MENSAJE_CONFIRMACION: string;

  @ViewChild('selfClosingAlert', {static: false}) selfClosingAlert: NgbAlert; 
  // referencia al las artetas que se cierran solas despues de 30 segundos. 
  // MODAL ACTUALIZAR FOTO
  @ViewChild('modalUpdatePhoto') elementUpdatePhoto: ElementRef;
  @ViewChild('fileInput') inputFile: ElementRef;
  URL_NUEVA_FOTO: string;
  previewImage: string | ArrayBuffer;
  fotoBase64textString = null;
  file: File;
  croppedImage: any = '';
  imageChangedEvent: any = '';
  mensajeErrorFoto = '* La foto es requerida';

  // MODAL ACTUALIZAR CONTRASEÑA
  @ViewChild('modalUpdatePassword') elementUpdatePassword: ElementRef;
  @ViewChild('modalEliminarEsp') modalEliminarEsp: ElementRef;
  CONTRASENA_ACTUAL = '';
  NUEVA_CONTRASENA = '';
  PASSWORD_CURRENT_ICON = 'fa fa-eye-slash';
  PASSWORD_CURRENT_TYPE = 'password';
  PASSWORD_NEW_ICON = 'fa fa-eye-slash';
  PASSWORD_NEW_TYPE = 'password';

  // PERFIL
  ID_ESPECIALISTA = 0;
  ESPECIALISTA: Especialista = new Especialista();
  CATEGORIAS: any[];
  ID_CATEGORIA: number;
  SERVICIOS: any[];
  ID_SERVICIO: number;
  NIVELES: any[];
  ID_NIVEL: number;
  SERVICIOS_ESPECIALISTA: any[];
  SERVICIOS_ESPECIALISTA_DB: any[];

  especialistaForm: any;
  contrasenaForm: any;
  contrasenasIguales = false;
  especialidadForm: any;

  // Users list is loading
  cargandoDatos: boolean;
  cargandoFoto: boolean;
  cargandoActualizarDatos: boolean;
  cargandoActualizarContrasena: boolean;
  cargandoActualizarFoto: boolean;
  cargandoGuardar: boolean;

  // MODAL DE CONFIRMACION
  @ViewChild('modalConfirmacion') elementModalConfirmacion: ElementRef;

  // Sortable directive. To get the headers
  @ViewChildren(sortableDirective) headers: QueryList<sortableDirective>;

  mensajeErrorModal = '';
  message = '';
  error: any;
  errorFoto = false;
  errorModal: any;
  success: boolean;

  mensaje="";
  mostrarAlertaModal = false;
  mostrarAlerta = false;
  tipoAlertaModal = '';
  tipoAlerta = '';

  // Pagination
  currentPage = 1;
  itemsPerPage = 5;
  servicioSeleccionado:any;


  DOMINIO = environment.domain_url;

  constructor(
    private especialistasService: EspecialistasService,
    private usuarioService: UsuariosService,
    private storageService: StorageService,
    private router: Router,
    private modal: NgbModal,
    private serviciosService: ServiciosService,
    private categoriasService: CategoriasService,
    private datePipe: DatePipe,
    private formBuilder: FormBuilder
    ) { }

  ngOnInit(): void {
    this.previewImage = "../../../../assets/images/no-img.png";
    this.cargandoDatos = false;
    this.cargandoFoto = true;
    this.cargandoActualizarDatos = false;
    this.cargandoActualizarContrasena = false;
    this.cargandoActualizarFoto = false;
    this.cargandoGuardar = false;
    this.getUsuarioEspecialista().then(() => {
      this.cargandoDatos = false;
      if (this.ESPECIALISTA === undefined) {
        this.goToNotFound();
      } else {
        this.URL_NUEVA_FOTO = this.ESPECIALISTA.USU_FOTO;
        this.previewImage = this.ESPECIALISTA.USU_FOTO;
        //this.croppedImage = this.ESPECIALISTA.USU_FOTO;
        this.cargandoFoto = false;
        this.ID_ESPECIALISTA = this.ESPECIALISTA.ESP_ID;
        
        this.dateConverter();
        this.getCategorias();
        this.getNiveles();
        this.getServiciosEspecialista();
        this.updateValuesEspecialista();
      }
    })
    .catch((error) => {
      this.error = true;
      this.success = false;
      this.cargandoDatos = false;
      this.MENSAJE_CONFIRMACION = 'Hubo un error al intentar obtener los datos de usuario. Por favor, intente de nuevo';
    });
    
    const emailFormat = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    this.especialistaForm =  this.formBuilder.group({
      usu_alias: ['', [Validators.required, Validators.pattern('[a-zñáéíóúA-ZÑÁÉÍÓÚ0-9]+'), Validators.maxLength(15)]],
      usu_email: ['', [Validators.required, Validators.pattern(emailFormat), Validators.maxLength(60), Validators.email]],
    });
    this.contrasenaForm =  this.formBuilder.group({
      contrasena_actual: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(20)]],
      contrasena_nueva: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(20),passwordValidation()]]
    });
    this.especialidadForm =  this.formBuilder.group({
      id_categoria: [null, Validators.required],
      id_servicio: [null, Validators.required],
      id_nivel: [null, Validators.required],
    });
  }

  getUsuarioEspecialista = () => {
    this.cargandoDatos = true;
    const especialistaPromise = new Promise((resolve, reject) => {
    this.especialistasService.getEspecialistaById(Number(localStorage.getItem("USE_ID"))).subscribe(
      (ESPECIALISTA) => {
        this.ESPECIALISTA = ESPECIALISTA['Resultado'][0];
        this.URL_NUEVA_FOTO = this.ESPECIALISTA.USU_FOTO;
        this.cargandoDatos = false;
        resolve(this.ESPECIALISTA);
      },
      (error) => {
        this.cargandoDatos = false;
        this.mostrarAlerta = true;
        this.tipoAlerta = 'danger';
        if (error['error']['error'] !== undefined) {
          if (error['error']['error'] === 'error_noExistenciaDeIdEsp') {
            this.mensaje = 'No se pudo obtener los datos de usuario del especialista debido a que ya no se encuentra registrado. Por favor, intente de nuevo.';
          }
          else if (error['error']['error'] === 'error_deBD') {
            this.mensaje = 'Hubo un error al intentar ejecutar su solicitud para obtener los datos de usuario del especialista. Por favor, intente de nuevo.';
          }
          else if (error['error']['error'] === 'error_deCampo') {
            this.mensaje = 'Los datos ingresados deben respetar los formatos permitidos. Por favor, intente de nuevo.';
          }
        } 
        else {
          this.mensaje = 'Hubo un error al intentar obtener los datos de usuario. Por favor, intente de nuevo';
        }
        this.cerrarAlerta();
      });
    });
    return especialistaPromise;
  }
  cerrarAlerta(){
    setTimeout(() => {
      this.mostrarAlerta=false;
      this.mostrarAlertaModal=false;
      this.mensaje="";
    }, 5000);
  }
  
  
  updateUsuarioEspecialista() {
    this.cargandoDatos = true;
    this.saveValuesEspecialista();
    this.especialistasService.updateUsuarioEspecialista(this.ESPECIALISTA).subscribe(
      (message) => {
        this.actualizarCabeceras().then(
          (resp:string) => {
            localStorage.setItem('USE_SUB',resp);
            this.serviciosService.updateHeaders(resp);
            this.especialistasService.updateHeaders(resp);
            this.usuarioService.usuarioUpdated(this.ESPECIALISTA.USU_ALIAS);
            this.getServiciosEspecialista();
          }
        );
        this.cargandoDatos = false;
        this.mostrarAlerta = true;
        this.tipoAlerta = 'success';
        this.mensaje = 'Datos de usuario actualizados correctamente';
        this.cerrarAlerta();
      }, (error) => {
        this.cargandoDatos = false;
        this.mostrarAlerta = true;
        this.tipoAlerta = 'danger';
        if (error['error']['error'] !== undefined) {
          if (error['error']['error'] === 'error_existenciaDeNombreUsuario') {
            this.mensaje = 'No se pudo actualizar el especialista debido a que el nombre de usuario se encuentra registrado. Por favor, intente de nuevo.';
          } else if (error['error']['error'] === 'error_existenciaDeEmail') {
            this.mensaje = 'No se pudo actualizar el especialista debido a que el correo electrónico ya se encuentra registrado. Por favor, intente de nuevo.';
          } else if (error['error']['error'] === 'error_deBD') {
            this.mensaje = 'Hubo un error al intentar ejecutar su solicitud. Por favor, intente de nuevo.';
          } else if (error['error']['error'] === 'error_deCampo') {
            this.mensaje = 'Los datos ingresados deben respetar los formatos permitidos. Por favor, intente de nuevo.';
          }
        } else {
          this.mensaje = 'Hubo un error al intentar actualizar los datos. Por favor, intente de nuevo';
        }
        this.cerrarAlerta();
    });
  }

  actualizarAutorizacion = () => {
    const autorizacionPromise = new Promise((resolve, reject) => {
      let USU_USUARIO = this.ESPECIALISTA.USU_ALIAS.toLowerCase();
      let USU_CONTRASENIA = this.NUEVA_CONTRASENA;     
      let cantidad = USU_USUARIO.length;
      let codigoAscii: string = '';
      let dividir,firstMitad, secondMitad;

      let textoCompleto: string;
      this.usuarioService.verificarCredenciales(USU_USUARIO, USU_CONTRASENIA, 1)
        .subscribe((respuesta)=>{
          if(respuesta.exito) //Credentials are correct
          {
            for ( let i=0; i< cantidad ; i++){
              codigoAscii = codigoAscii + USU_USUARIO[i].charCodeAt(0).toString()+'&';
            }
            codigoAscii = codigoAscii.substring(0, codigoAscii.length - 1);
            cantidad=codigoAscii.length+1;
            dividir = cantidad/2;
            firstMitad = codigoAscii.substring(0,Math.round(dividir));
            secondMitad = codigoAscii.substring(Math.round(dividir),codigoAscii.length);
            // textoCompleto = cantidad + "$$" + firstMitad + "$2y$10$H9qUPFUBt8B.cACHXv7T1Oka8RlffxW.Py6qetaYE.W6rrixZohHq" + secondMitad;
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
            this.mensaje = "Las credenciales ingresadas son incorrectas. Por favor, intenta nuevamente";
            this.cerrarAlerta();
          }
          this.cargandoDatos = false;
        }, error=>{
            this.cargandoDatos = false;  
            this.mostrarAlerta = true;
            this.tipoAlerta = 'danger';
            this.mensaje = "Hubo un error al validar tus credenciales. Por favor, intenta nuevamente";
            this.cerrarAlerta();
        });
    });

    return autorizacionPromise;
  }

  actualizarCabeceras = () => {
    const autorizacionPromise = new Promise((resolve, reject) => {
      let USU_USUARIO = this.ESPECIALISTA.USU_ALIAS.toLowerCase();
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

  getCategorias() {
    this.categoriasService.updateHeaders();
    this.categoriasService.getCategorias().subscribe(
      (CATEGORIAS) => {
        this.CATEGORIAS = CATEGORIAS['Resultado '];
      },
      (error) => {
        this.cargandoDatos = false;
        this.mostrarAlerta = true;
        this.tipoAlerta = 'danger';
        this.mensaje = 'Hubo un error al intentar obtener las categorías del especialista. Por favor, intente de nuevo';
        this.cerrarAlerta();
      });
  }

  getServicios() {
    this.serviciosService.updateHeaders();
    this.SERVICIOS = [];
    this.id_servicio.setValue(null);
    this.serviciosService.getServiciosPorCategoria(this.ID_CATEGORIA).subscribe(
      (SERVICIOS) => {
        this.SERVICIOS = SERVICIOS['resultado'];
      },
      (error) => {
        this.cargandoDatos = false;
        this.mostrarAlerta = true;
        this.tipoAlerta = 'danger';
        this.mensaje = 'Hubo un error al intentar obtener los servicios del especialista. Por favor, intente de nuevo';
        this.cerrarAlerta();
      });
  }

  getNiveles() {
    this.especialistasService.getNiveles().subscribe(
      (NIVELES) => {
        this.NIVELES = NIVELES['Resultado'];
      }, (error) => {
        this.cargandoDatos = false;
        this.mostrarAlerta = true;
        this.tipoAlerta = 'danger';
        if (error['error']['error'] !== undefined) {
          if (error['error']['error'] === 'error_noExistenciaDeNiveles') {
            this.mensaje = 'No se pudo obtener los niveles debido a que no se encuentraron registros. Por favor, intente de nuevo.';
          } else if (error['error']['error'] === 'error_deBD') {
            this.mensaje = 'Hubo un error al intentar ejecutar su solicitud. Por favor, intente de nuevo.';
          } else if (error['error']['error'] === 'error_deCampo') {
            this.mensaje = 'Los datos ingresados deben respetar los formatos permitidos. Por favor, intente de nuevo.';
          }
        } else {
          this.mensaje = 'Hubo un error al intentar obtener los niveles. Por favor, intente de nuevo';
        }
        this.cerrarAlerta();
      });
  }

  getServiciosEspecialista() {
    this.serviciosService.getServiciosEspecialista(this.ID_ESPECIALISTA).subscribe(
      (SERVICIOS_ESPECIALISTA) => {
        this.SERVICIOS_ESPECIALISTA = SERVICIOS_ESPECIALISTA['Resultado'];
        this.SERVICIOS_ESPECIALISTA_DB = SERVICIOS_ESPECIALISTA['Resultado'];
      }, (error) => {
        this.cargandoDatos = false;
        this.mostrarAlerta = true;
        this.tipoAlerta = 'danger';
        if (error) {
          if (error['error']['error'] !== undefined) {
            if (error['error']['error'] === 'error_noExistenciaDeIdEsp') {
              this.mensaje = 'No se pudo obtener los niveles debido a que el especialista ya no se encuentra registrado. Por favor, intente de nuevo.';
            } else if (error['error']['error'] === 'error_deBD') {
              this.mensaje = 'Hubo un error al intentar ejecutar su solicitud. Por favor, intente de nuevo.';
            } else if (error['error']['error'] === 'error_deCampo') {
              this.mensaje = 'Los datos ingresados deben respetar los formatos permitidos. Por favor, intente de nuevo.';
            }
          } else {
            this.mensaje = 'Hubo un error al intentar obtener los niveles. Por favor, intente de nuevo';
          }
        }
        this.cerrarAlerta();
      });
  }

  saveServicioEspecialista() {
    this.saveValuesEspecialidad();
    this.cargandoGuardar = true;
    this.serviciosService.saveServicioEspecialista(this.ID_SERVICIO, this.ID_ESPECIALISTA, this.ID_NIVEL, this.ID_CATEGORIA).subscribe(
      (message) => {
        this.cargandoGuardar = false;
        this.mostrarAlerta = true;
        this.tipoAlerta = 'success';
        this.mensaje = 'Especialidad creada correctamente';
        this.cerrarAlerta();
        this.getServiciosEspecialista();
        this.especialidadForm.reset();
      }, (error) => {
        this.cargandoGuardar = false;
        this.mostrarAlerta = true;
        this.tipoAlerta = 'danger';
        if (error['error']['error'] !== undefined) {
          if (error['error']['error'] === 'error_noExistenciaDeIdSer') {
            this.mensaje = 'No se pudo la especialidad debido a que no se encontró el servicio correspondiente. Por favor, intente de nuevo.';
          } else if (error['error']['error'] === 'error_noExistenciaDeIdEsp') {
            this.mensaje = 'No se pudo la especialidad debido a que no se encontró registrada la cuenta de especialista. Por favor, intente de nuevo.';
          } else if (error['error']['error'] === 'error_noExistenciaDeIdNiv') {
            this.mensaje = 'No se pudo la especialidad debido a que no se encontró el nivel correspondiente. Por favor, intente de nuevo.';
          } else if (error['error']['error'] === 'error_noExistenciaDeIdCat') {
            this.mensaje = 'No se pudo la especialidad debido a que no se encontró la categoría correspondiente. Por favor, intente de nuevo.';
          } else if (error['error']['error'] === 'error_deBD') {
            this.mensaje = 'Hubo un error al intentar ejecutar su solicitud. Por favor, intente de nuevo.';
          } else if (error['error']['error'] === 'error_deCampo') {
            this.mensaje = 'Los datos ingresados deben respetar los formatos permitidos. Por favor, intente de nuevo.';
          } else if (error['error']['error'] === 'error_sevicioEspecialistaDuplicado') {
            this.mensaje = 'Los datos ingresados ya han sido asignados al especialista.';
          }
        } else {
          this.mensaje = 'Hubo un error al intentar crear la especialidad. Por favor, intente de nuevo.';
        }
        this.cerrarAlerta();
      });
  }

  goToNotFound() {
    this.router.navigate(['not-found']);
  }

  actualizarFoto() {
    this.fotoBase64textString = null;
    this.imageChangedEvent = null;
    //this.previewImage = this.ESPECIALISTA.USU_FOTO;
    this.errorFoto = false;
    this.modal.open(this.elementUpdatePhoto);
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
    this.fotoBase64textString = this.croppedImage.toString().slice(22);
  }

  obtenerExtension(filename): any {
    return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
  }

  seleccionarFoto(event: HtmlInputEvent): void{
    if(event.target.files && event.target.files[0]){
      this.file = <File>event.target.files[0];
      //image preview
      const reader = new FileReader();
      reader.onload = e =>this.previewImage = reader.result;
      reader.readAsDataURL(this.file);
    }
  }

  subirFoto(event): any {
    this.fotoBase64textString = null; 
    this.imageChangedEvent = null;
    let files = event.target.files;
    if ( this.obtenerExtension(files[0].name).toString().toUpperCase() === 'JPG' || this.obtenerExtension(files[0].name).toString().toUpperCase() === 'JPEG'  ||
          this.obtenerExtension(files[0].name).toString().toUpperCase() === 'PNG'  ) {
        this.errorFoto = false;
        this.mostrarAlertaModal = false;
        this.imageChangedEvent = event;
        if (event.target.files && event.target.files[0]) {
          this.imageCropped(event);
        }
    }
    else {
      this.errorFoto = true;
      this.tipoAlertaModal='danger';
      this.mensajeErrorFoto = 'Error! : solo se admite imágenes con extensiones .png, .jpeg, .jpg';
      this.mostrarAlertaModal = true;
      this.fotoBase64textString = null;
      if(this.inputFile)this.inputFile.nativeElement.value = '';
    }
  }

  _handleReaderLoaded(readerEvent): any {
    const binaryString = readerEvent.target.result;
    if (binaryString != null || binaryString !== undefined) {
      this.fotoBase64textString = btoa(binaryString);
      this.URL_NUEVA_FOTO = this.fotoBase64textString;
    } else {
      this.fotoBase64textString = null;
    }
  }

  saveFoto() {
    this.cargandoActualizarFoto = true;
    this.especialistasService.updateFotoEspecialista(this.ID_ESPECIALISTA, this.fotoBase64textString).subscribe(
      (message) => {
        this.modal.dismissAll();
        this.mostrarAlerta = true;
        this.tipoAlerta = 'success';
        this.mensaje = 'Foto actualizada correctamente';
        this.cerrarAlerta();
        this.getUsuarioEspecialista();
        this.cargandoActualizarFoto = false;
      }, (error) => {
        this.cargandoActualizarFoto = false;
        this.mostrarAlertaModal = true;
        this.tipoAlertaModal = 'danger';
        if (error['error']['error'] !== undefined) {
          if (error['error']['error'] === 'error_noExistenciaDeIdEsp') {
            this.mensaje = 'No se pudo actualizar la foto debido a que el especialista ya no se encuentra registrado. Por favor, intente de nuevo.';
          } else if (error['error']['error'] === 'error_deBD') {
            this.mensaje = 'Hubo un error al intentar ejecutar su solicitud. Por favor, intente de nuevo.';
          } else if (error['error']['error'] === 'error_deCampo') {
            this.mensaje = 'Los datos ingresados para actualizar la foto deben respetar los formatos permitidos. Por favor, intente de nuevo.';
          }
        } else {
          this.mensaje = 'Hubo un error al intentar actualizar la foto. Por favor, intente de nuevo';
        }
        this.cerrarAlerta();
    });
  }

  actualizarContrasena() {
    this.CONTRASENA_ACTUAL = '';
    this.NUEVA_CONTRASENA = '';
    this.contrasenaForm.reset();
    this.modal.open(this.elementUpdatePassword);
  }

  eliminarEsp(servicio) {
    this.servicioSeleccionado =  servicio;
    this.modal.open(this.modalEliminarEsp);
  }


  saveContrasena() {
    this.saveValuesContrasena();
    this.saveValuesEspecialista();
    if (this.CONTRASENA_ACTUAL !== this.NUEVA_CONTRASENA) {
      this.contrasenasIguales = false;
      this.cargandoActualizarContrasena = true;
      this.especialistasService.updateContrasenaEspecialista(this.ESPECIALISTA.ESP_ID, this.CONTRASENA_ACTUAL, this.NUEVA_CONTRASENA).subscribe(
          (message) => {
            this.modal.dismissAll();
            this.mostrarAlerta = true;
            this.tipoAlerta = 'success';
            this.mensaje = 'La contraseña se actualizó exitosamente';
            this.cerrarAlerta();
            this.actualizarAutorizacion().then(
              () => {
                this.especialistasService.updateHeaders();
                this.usuarioService.usuarioUpdated(this.ESPECIALISTA.USU_ALIAS);
              }
            );
            this.cargandoActualizarContrasena = false;
          }, (error) => {
            this.cargandoActualizarContrasena = false;
            this.mostrarAlertaModal = true;
            this.tipoAlertaModal = 'danger';
            if (error['error']['error'] !== undefined) {
              if (error['error']['error'] === 'error_deContraseñaActual') {
                this.mensaje = 'La contraseña actual es incorrecta';
              } else if (error['error']['error'] === 'error_deBD') {
                this.mensaje = 'Hubo un error al intentar ejecutar su solicitud para obtener los datos de usuario del cliente. Por favor, intente de nuevo.';
              } else if (error['error']['error'] === 'error_deCampo') {
                this.mensaje = 'Los datos ingresados deben respetar los formatos permitidos. Por favor, intente de nuevo.';
              }
            } else {
              this.mensaje = 'Hubo un error al intentar actualizar la contraseña. Por favor, intente de nuevo';
            }
            this.cerrarAlerta();
        });
    } else {
      this.mostrarAlertaModal = true;
      this.tipoAlertaModal = 'danger';
      this.mensaje = 'La contraseña nueva no puede ser igual a la actual';
      this.cerrarAlerta();
    }

  }

  cambiarVistaContrasena(idInput: string, idIcono: string) {
    const input = document.getElementById(idInput) as HTMLInputElement;
    const icono = document.getElementById(idIcono)?.querySelector('em') as HTMLElement;
  
    if (input && icono) {
      if (input.type === 'password') {
        input.type = 'text';
        icono.classList.remove('fa-eye-slash');
        icono.classList.add('fa-eye');
      } else {
        input.type = 'password';
        icono.classList.remove('fa-eye');
        icono.classList.add('fa-eye-slash');
      }
    }
  }
  
  dateConverter() {
    if (this.ESPECIALISTA.USU_FECH_NACIMIENTO !== '0000-00-00 00:00:00') {
      this.ESPECIALISTA.USU_FECH_NACIMIENTO = this.datePipe.transform(this.ESPECIALISTA.USU_FECH_NACIMIENTO, 'dd/MM/yyyy');
    } else {
      this.ESPECIALISTA.USU_FECH_NACIMIENTO = '00/00/0000';
    }
  }

  resetSorting(column: string) {
    this.headers.forEach(header => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });
  }

  sort({column, direction}: {column: string, direction: string}) {
    // Resetting other headers
    this.resetSorting(column);
    // Sorting chargings
    if (direction === '') {
      this.SERVICIOS_ESPECIALISTA = this.SERVICIOS_ESPECIALISTA_DB.slice();
    } else {
      this.SERVICIOS_ESPECIALISTA = this.SERVICIOS_ESPECIALISTA_DB.slice().sort((a, b) => {
        const res = compare(a[column], b[column]);
        return direction === 'asc' ? res : -res;
      });
    }
  }

  get usu_alias() {
    return this.especialistaForm.get('usu_alias');
  }

  get usu_email() {
    return this.especialistaForm.get('usu_email');
  }

  get contrasena_actual() {
    return this.contrasenaForm.get('contrasena_actual');
  }

  get contrasena_nueva() {
    return this.contrasenaForm.get('contrasena_nueva');
  }

  get id_categoria() {
    return this.especialidadForm.get('id_categoria');
  }

  get id_servicio() {
    return this.especialidadForm.get('id_servicio');
  }

  get id_nivel() {
    return this.especialidadForm.get('id_nivel');
  }

  updateValuesEspecialista() {
    this.usu_alias.setValue(this.ESPECIALISTA.USU_ALIAS);
    this.usu_email.setValue(this.ESPECIALISTA.USU_EMAIL);
  }

  saveValuesEspecialista() {
    this.ESPECIALISTA.USU_ALIAS = this.usu_alias.value;
    this.ESPECIALISTA.USU_EMAIL = this.usu_email.value;
  }

  saveValuesContrasena() {
    this.CONTRASENA_ACTUAL = this.contrasena_actual.value;
    this.NUEVA_CONTRASENA = this.contrasena_nueva.value;
  }

  saveValuesEspecialidad() {
    this.ID_CATEGORIA = this.id_categoria.value;
    this.ID_SERVICIO = this.id_servicio.value;
    this.ID_NIVEL = this.id_nivel.value;
  }

  eliminarEspecialidad(){
    this.serviciosService.eliminarServEspecialista(this.servicioSeleccionado.ESP_SER_ID,this.servicioSeleccionado.ESP_ID).subscribe(
      (message) => {
        this.modal.dismissAll();
        this.mostrarAlerta = true;
        this.tipoAlerta = 'success';
        this.mensaje = 'La especialdiad se ha eliminado correctamente';
        this.getServiciosEspecialista();
        this.cerrarAlerta();
      }, (error) => {
        this.mostrarAlertaModal = true;
        this.tipoAlertaModal = 'danger';
        if (error['error']['error'] !== undefined) {
          if (error['error']['error'] === 'error_Duplicidad') {
            this.mensaje = 'No existe el servicio para este especialista';
          }
        } else {
          this.mensaje = 'Hubo un error al intentar eliminar el servicio. Por favor, intente de nuevo';
        }
        this.cerrarAlerta();
    });
    
  }

  cambioElementos(){
    this.currentPage=1;
  }

  cerrarModal(){
    this.modal.dismissAll();
    this.errorFoto=false;
    this.mostrarAlertaModal=false;
    this.mensaje='';
    this.mensajeErrorFoto='';
    this.servicioSeleccionado='';
    this.croppedImage=null;
  }

}
