import { Component, ElementRef, OnInit, ViewChild  } from '@angular/core';
import { Especialista } from '../../especialistas/especialista.model';
import { DatePipe } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder,  Validators } from '@angular/forms';
import { StorageService } from '../../../helpers/storage.service';
import { Pais } from '../../paises/pais.model';
import { PaisesService } from '../../paises/paises.service';
import { RegionesService } from '../../regiones/regiones.service';
import { Region } from '../../regiones/region.model';
import { Provincia } from '../../provincias/provincia.model';
import { ProvinciasService } from '../../provincias/provincias.service';
import { Distrito } from '../../distritos/distrito.model';
import { DistritosService } from '../../distritos/distritos.service';
import { Estudio } from '../../estudios/estudio.model';
import { ExperienciaLaboral } from '../../experiencias-laborales/experiencia-laboral.model';
import { PostulanteService } from '../postulante.service';
import { Postulante } from '../postulante.models';
import { TipoEmpresa } from '../../tipo-empresa/tipo-empresa.model';
import { ContactoReferenciaModels } from '../../contactos-referencias/contacto-referencia-models';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { Idiomas } from '../../idiomas/idiomas.models';
import { IdiomasService } from '../../idiomas/idiomas.service';
import { Router } from '@angular/router';
import { passwordValidation } from 'src/app/shared/modules/password-validation/password-validation.directive';
import { NavbarService } from '../../../shared/navbar/navbar.service';
import { TipoEmpresaService } from '../../tipo-empresa/tipo-empresa.service'
import { AuthService } from 'src/app/authorization/auth.service';
import { environment } from 'src/environments/environment';

interface HtmlInputEvent extends Event {
  target: HTMLInputElement & EventTarget;
}

@Component({
  selector: 'app-postulante-registro',
  templateUrl: './postulante-registro.component.html',
  styleUrls: ['./postulante-registro.component.scss']
})
export class PostulanteRegistroComponent implements OnInit {


  ESPECIALISTAREGISTRO: Especialista = new Especialista();
  PAISES: Pais[];
  REGIONES: Region[];
  PROVINCIAS: Provincia[];
  DISTRITOS: Distrito[];
  IDIOMAS: Idiomas[];
  ESTUDIO: Estudio = new Estudio();
  listaDeEstudios: Array<Estudio>;
  listaDeEstudiosFinal: Array<Estudio> = [];
  listaDeExperienciasLaborales: Array<ExperienciaLaboral>;
  listaDeExperienciasLaboralesFinal: Array<ExperienciaLaboral> = [];
  listaDeContactosReferencia: Array<ContactoReferenciaModels> = [];
  listaDeContactosReferenciaFinal: Array<ContactoReferenciaModels> = [];
  estudioEditar = false;
  experienciaLaboralEditar = false;
  posicionEstudioAEditar = 0;
  posicionExperienciaLaboralEditar = 0;
  estudioAEliminar;
  experienciaLaboralAEliminar;
  postulante = new Postulante();
  sexo = 'M';
  isImagen = false;
  isCV = false;
  copiarExperienciasLaborales = false;
  copiarEstudios = false;
  post_foto: any;
  post_cv: any;
  idDistrito: number;
  idIdioma: number;


  @ViewChild('terminos') elementModalTerminosyCondiciones: ElementRef;
  @ViewChild('agregarP') elementModalagregarEstudios: ElementRef;
  @ViewChild('agregarEL') elementModalagregarExperienciaLaboral: ElementRef;
  @ViewChild('eliminarEst') elementModalEliminarEstudio: ElementRef;
  @ViewChild('eliminarEL') elementModalEliminarExperienciaLaboral: ElementRef;
  @ViewChild('inputCV') myinputCV: ElementRef;
  @ViewChild('foto') elementModalMostrarSubirImagenPerfil: ElementRef;
  @ViewChild('Redirrecionar') redireccionarLoginPostulante: ElementRef;


  PASSWORD_CURRENT_ICON = 'fa fa-eye-slash';
  PASSWORD_CURRENT_TYPE = 'password';
  PASSWORD_NEW_ICON = 'fa fa-eye-slash';
  PASSWORD_NEW_TYPE = 'password';


  public estudiosForm: FormGroup;
  public experienciaLaboralForm: FormGroup;
  public usuarioForm: FormGroup;
  public datosPersonalesForm: FormGroup;
  public datosEmpresa: FormGroup;

  cargaDeDato = false;
  cantidadEstudios = 0;
  eliminar = false;
  cambiarProfile = false;

  mostrarAlerta = false;
  mostrarAlertaModal:boolean=false;
  tipoAlerta: string;
  mensaje: string;
  carga:boolean = false;
  mostrarAlertaTerminos = false;
  // mostrarAlertaEstudio = false;
  mostrarAlertaArchivo = false;
  mensajeArchivo: string;
  mensajeFotoError: string;
  tituloArchivo:string='';
  rutaTerminosCondiciones:string = environment.domain_url+'/archivos/TerminosYCondiciones.pdf';
  mostrarAlertaFoto = false;


  POST_FECH_NACIMIENTO: string;
  TIPO_POSTULANTE: number;
  TIPOS_EMPRESA: TipoEmpresa[];

  photoSelected: string | ArrayBuffer;
  imageChangedEvent: any = '';
  croppedImage: any = '';

  opacarDateFechaNacimiento = true;
  opacarDateFechaInicioEstudio = true;
  opacarDateFechaFinEstudio = true;
  opacarDateFechaInicioExperienciaLaboral = true;
  opacarDateFechaFinExperienciaLaboral = true;

  inhabilitarBotonesPostular = false;
  cargaDeCV = false; // servirá para habilitar o no el botón postular.
  esValidoContrasena = true;


  textoDeBotonModal = 'Añadir';
  tituloModalEstudios = 'Agregar Estudios';
  tituloModalExperienciaLaboral = 'Agregar experiencia laboral';


  fotoRecortada: any;
  checkTerminos:boolean=false;

  isCheckEstudio:boolean = false;
  isCheckExperiencia:boolean = false;


  constructor(
    private provinciaServicio: ProvinciasService,
    private distritoServicio: DistritosService,
    private paisesServicio: PaisesService,
    private regionServicio: RegionesService,
    private formBuilder: FormBuilder ,
    private storageService: StorageService ,
    private postulanteService: PostulanteService,
    private tipoEmpresaServicio: TipoEmpresaService,
    private idiomaService: IdiomasService,
    private navbarService: NavbarService,
    private datePipe: DatePipe,
    private router: Router,
    public modal: NgbModal,
    private authService: AuthService
   ) {

   }

  ngOnInit(): void {
    this.obtenerIdiomas();
    this.obtenerDatosPaises();
    this.inicializarEstudiosForm();
    this.inicializarUsuarioForm();
    this.inicializarDatosPersonalesForm();
    this.inicializarExperienciaLaboralesForm();

    this.listaDeEstudios = [];
    this.listaDeExperienciasLaborales = [];

    this.inicializarRegistro();
    this.obtenerTipoEmpresa();

  }

  inicializarRegistro(){
    this.navbarService.obtenerTipoEspecialista()
    .subscribe( tipoEsp =>{
      if(tipoEsp != 0 && tipoEsp !=1){//si tipoEsp es diferente a 0 (postulante persona) y 1 (postulante empresa)
        this.router.navigate(['/home']);
      }else{
        if(tipoEsp == 1)//si el tipo de postulante es 1 (empresa) entonces inicializar el formulario
        this.inicializarDatosJurídicos();
        this.TIPO_POSTULANTE = tipoEsp;//almacena el tipo de postulante o postulante 0 persona y 1 empresa
      }
    })
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
    } );
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
    } );
  }

  obtenerTipoEmpresa() {
    this.tipoEmpresaServicio.getTipoEmpresa().subscribe( data => {
      this.TIPOS_EMPRESA = data['Resultado'];
    }, error => {
      this.tipoAlerta = 'danger';
      this.cargaDeDato = false;
      this.mostrarAlerta = true;
      if (error['error']['error'] !== undefined) {
        if (error['error']['error'] === 'error_deBD') {
            this.mensaje = 'No se pudo obtener los datos, debido a una falla de conexión. Por favor, intente otra vez.';
        }
      } else {
        this.mensaje = 'Hubo un error al intentar rescatar los tipos de empresa. Por favor, intente de nuevo';
      }
    } );
  }
  inicializarDatosJurídicos() {
    this.datosEmpresa = this.formBuilder.group(
      {
        razonSocial: [''],
        tipoEmpresa: ['']
      }
    );
  }

  inicializarEstudiosForm() {
    this.estudiosForm =  this.formBuilder.group({
      est_tipo: [''],
      est_institucion: [''],
      est_fech_ini: [''],
      est_fech_fin: [''],
      est_descripcion: [''],
    });
  }

  inicializarUsuarioForm() {
    this.usuarioForm =  this.formBuilder.group({
      usu_apodo: [''],
      contrasena: [''],
      contrasenaConfirmar: ['']
    });
  }

  inicializarDatosPersonalesForm() {
    this.datosPersonalesForm  =  this.formBuilder.group({
      nombre: [''],
      apellidoPaterno: [''],
      apellidoMaterno:  [''],
      date: [''],
      dni: [''],
      rucD: [''],
      idioma: [null],
      direccion: [''],
      correo: [''],
      celular: [''] ,
      pais: [null],
      departamento: [null],
      provincia: [null],
      distrito: [null]
    });
  }


  inicializarExperienciaLaboralesForm() {
    this.experienciaLaboralForm  =  this.formBuilder.group( {
      descripcion: ['' ],
      lugarempresa: [''],
      especialidad: [''],
      fechaInicio: [''],
      fechaFin: [''],
      nombreEL: [''],
      apellido: [''],
      correoEL: [''],
      celularEL: ['']
    });
  }

  mostrarModalSubirImagen() {
    this.imageChangedEvent = null;
    this.modal.open(this.elementModalMostrarSubirImagenPerfil );
  }

  mostrarModalEstudios() {
    this.estudioEditar = false;
    this.opacarDateFechaInicioEstudio = true;
    this.opacarDateFechaFinEstudio = true;
    this.isCheckEstudio = false;
    this.estudiosForm.controls.est_fech_fin.enable(); 
    this.textoDeBotonModal = 'Añadir';
    this.tituloModalEstudios = 'Agregar estudios';
    this.estudiosForm.reset();
    this.modal.open(this.elementModalagregarEstudios, {size: 'lg'});
  }

  mostrarModalExperienciaLaboral() {
    this.experienciaLaboralEditar = false;
    this.opacarDateFechaInicioExperienciaLaboral = true;
    this.opacarDateFechaFinExperienciaLaboral = true;
    this.mostrarAlerta = false;
    this.experienciaLaboralForm.reset();
    this.isCheckExperiencia = false;
    this.experienciaLaboralForm.controls.fechaFin.enable(); 
    this.textoDeBotonModal = 'Añadir';
    if(this.TIPO_POSTULANTE === 0)
      this.tituloModalExperienciaLaboral = 'Agregar experiencia laboral';
    else if(this.TIPO_POSTULANTE === 1)
      this.tituloModalExperienciaLaboral = 'Agregar cliente destacado';
    this.modal.open(this.elementModalagregarExperienciaLaboral, {size: 'lg'});
  }
  
  mostrarTerminosyCondiciones() {
    this.modal.open(this.elementModalTerminosyCondiciones );
  }

  retornarPosicionEstudioAEditar(estudio) {
    let posicion = 0;
    for ( let est of this.listaDeEstudios ) {
      if (estudio.EST_DESCRIPCION === est.EST_DESCRIPCION  ) {
        this.posicionEstudioAEditar = posicion;
      }
      posicion ++ ;
    }
  }

  obtenerLengthExperienciaLaboral(): number { // Sirve para calcular la dimensión en Experiencia Laboral, exceptuando aquellos que estan
                                              // como "no" en el atributo EXP_DESCRIPCION
    let contador = 0;
    let i;
      for (i = 0 ;  i < this.listaDeExperienciasLaborales.length ; i++ ) {
        if (this.listaDeExperienciasLaborales[i].EXP_DESCRIPCION !== 'no' ) {
          contador ++;
        }
      }
    return contador;
  }

  obtenerLenthEstudios(): number { // Sirve para calcular la dimensión en Estudios exceptuando aquellos que estan
                                  // como "no" en el atributo EST_INSTITUCION
    let contador = 0;
    let i;
    for ( i = 0;  i < this.listaDeEstudios.length; i++) {
      if (this.listaDeEstudios[i].EST_INSTITUCION !== 'no') {
        contador++;
      }
    }
    return contador;
  }

  abrirModalEditar(estudio) {
    this.estudioEditar = true;
    this.retornarPosicionEstudioAEditar(estudio);
    this.textoDeBotonModal = 'Actualizar';
    this.tituloModalEstudios = 'Actualizar estudios';
    this.estudiosForm =  this.formBuilder.group({
      est_tipo: [estudio.EST_TIPO ],
      est_institucion: [estudio.EST_INSTITUCION ],
      est_fech_ini: [ estudio.EST_FECH_INI],
      est_fech_fin: [ estudio.EST_FECH_FIN],
      est_descripcion: [ estudio.EST_DESCRIPCION],
    });

    if(estudio.EST_FECH_FIN == " "){
      this.estudiosForm.controls.est_fech_fin.disable(); 
      this.isCheckEstudio = true;
    }
    this.modal.open(this.elementModalagregarEstudios, {size: 'lg'});
  }

  abrirModalEliminarEstudio(estudio) {
    this.modal.open(this.elementModalEliminarEstudio);
    this.estudioAEliminar = estudio;
  }

  retornarPosicionExperienciaLaboralAEditar(experiencia) {
    let posicion = 0;

    for ( let experienciaLaboral of this.listaDeExperienciasLaborales ) {
      if (experiencia.EXP_DESCRIPCION === experienciaLaboral.EXP_DESCRIPCION  ) {
        this.posicionExperienciaLaboralEditar = posicion;
      } else {
        posicion ++ ;
      }
    }
  }

  insertarPostulante() {

    this.POST_FECH_NACIMIENTO = this.datosPersonalesForm.get('date').value;

    if (this.isValidoContrasenia(this.usuarioForm.get('contrasena').value, this.usuarioForm.get('contrasenaConfirmar').value)) {
        this.postulante = new Postulante(
          this.datosPersonalesForm.get('nombre').value,
          this.datosPersonalesForm.get('apellidoPaterno').value,
          this.datosPersonalesForm.get('apellidoMaterno').value,
          this.datosPersonalesForm.get('dni').value,
          this.datosPersonalesForm.get('rucD').value,
          this.datosPersonalesForm.get('direccion').value,
          this.POST_FECH_NACIMIENTO,
          this.sexo,
          this.datosPersonalesForm.get('celular').value,
          this.datosPersonalesForm.get('correo').value,
          this.usuarioForm.get('usu_apodo').value,
          this.usuarioForm.get('contrasena').value,
          this.post_foto,
          this.post_cv
      );
    } else {
      this.mostrarAlerta = true;
      this.tipoAlerta = 'danger';
      this.mensaje = 'Las contraseñas ingresadas no son iguales.';
    }
  }

  abrirModalEditarExperienciaLaboral(experienciaLaboral) {
    this.mostrarAlerta = false;
    this.experienciaLaboralEditar = true;
    this.tituloModalExperienciaLaboral = 'Actualizar experiencia laboral';
    this.textoDeBotonModal = 'Actualizar';
    this.retornarPosicionExperienciaLaboralAEditar(experienciaLaboral);

    this.experienciaLaboralForm  =  this.formBuilder.group( {
      descripcion: [ experienciaLaboral.EXP_DESCRIPCION],
      lugarempresa: [ experienciaLaboral.EXP_EMPRESA ],
      especialidad: [ experienciaLaboral.EXP_ESPECIALIDAD ],
      fechaInicio: [ experienciaLaboral.EXP_FECH_INI ],
      fechaFin: [ experienciaLaboral.EXP_FECH_FIN ],
      nombreEL: [  this.listaDeContactosReferencia[this.posicionExperienciaLaboralEditar].CONT_NOMBRES ],
      apellido: [  this.listaDeContactosReferencia[this.posicionExperienciaLaboralEditar].CONT_APELLIDOS ],
      correoEL: [ this.listaDeContactosReferencia[this.posicionExperienciaLaboralEditar].CONT_EMAIL ],
      celularEL: [  this.listaDeContactosReferencia[this.posicionExperienciaLaboralEditar].CONT_CELULAR]
    });
  
    if(experienciaLaboral.EXP_FECH_FIN == " "){
      this.experienciaLaboralForm.controls.fechaFin.disable(); 
      this.isCheckExperiencia = true;
    }
    this.modal.open(this.elementModalagregarExperienciaLaboral, {size: 'lg'});
  }

  abrirModalEliminarExperienciaLaboral(experienciaLaboral) {
    this.modal.open(this.elementModalEliminarExperienciaLaboral);
    this.experienciaLaboralAEliminar = experienciaLaboral;
  }

  closeModal(): any {
    this.mostrarAlertaTerminos = false;
    this.modal.dismissAll();
  }

  anadirEstudios() {
    this.validarCamposEstudios();
    if(this.estudiosForm.invalid){
      this.estudiosForm.markAllAsTouched();
      return;
    }

    if (this.estudioEditar === true ) {

      let fechaFin = this.estudiosForm.get('est_fech_fin').value;
      if(fechaFin==null)
        fechaFin = ""; 

        if ( this.verificarFecha(this.estudiosForm.get('est_fech_ini').value)  && this.verificarFecha(this.estudiosForm.get('est_fech_fin').value ) ) {
          if ( this.isValidoFechas(this.estudiosForm.get('est_fech_ini').value , this.estudiosForm.get('est_fech_fin').value) ) {
  
            this.listaDeEstudios[this.posicionEstudioAEditar].EST_DESCRIPCION = this.estudiosForm.get('est_descripcion').value;
            this.listaDeEstudios[this.posicionEstudioAEditar].EST_FECH_FIN = this.estudiosForm.get('est_fech_fin').value ;
            this.listaDeEstudios[this.posicionEstudioAEditar].EST_FECH_INI = this.estudiosForm.get('est_fech_ini').value;
            this.listaDeEstudios[this.posicionEstudioAEditar].EST_INSTITUCION = this.estudiosForm.get('est_institucion').value;
            this.listaDeEstudios[this.posicionEstudioAEditar].EST_TIPO = this.estudiosForm.get('est_tipo').value;

            this.mostrarAlerta = true;
            this.tipoAlerta = 'success';
            this.mensaje = 'Se editó correctamente. ';
            this.cerrarAlerta();
            this.estudioEditar = false;
            this.modal.dismissAll();
          }
  
        } else { // en caso de que la fecha sobrepasó la fecha actual, se muestra una alerta
          this.mostrarAlertaModal = true;
          this.tipoAlerta = 'danger';
          this.mensaje = 'Algunas de las fechas o ambas no puede(n) ser mayor a la fecha actual. ';
          this.cerrarAlerta();
        }
    } else {

      let fechaFin = this.estudiosForm.get('est_fech_fin').value;
      if(fechaFin==null)
        fechaFin = ""; 

      if ( this.verificarFecha(this.estudiosForm.get('est_fech_ini').value)  && this.verificarFecha(this.estudiosForm.get('est_fech_fin').value ) ) {

        if ( this.isValidoFechas(this.estudiosForm.get('est_fech_ini').value , this.estudiosForm.get('est_fech_fin').value) ) {

          const ESTUDIOS = new Estudio(
            this.estudiosForm.get('est_tipo').value, this.estudiosForm.get('est_descripcion').value,
            this.estudiosForm.get('est_institucion').value, this.estudiosForm.get('est_fech_ini').value,
            this.estudiosForm.get('est_fech_fin').value );

          this.listaDeEstudios.push(ESTUDIOS);
          
          this.mostrarAlerta = true;
          this.tipoAlerta = 'success';
          this.mensaje = 'Se agregó correctamente. ';
          this.cerrarAlerta();
          this.modal.dismissAll();

        }

      } else { // en caso de que la fecha sobrepasó la fecha actual, se muestra una alerta
        this.mostrarAlertaModal = true;
        this.tipoAlerta = 'danger';
        this.mensaje = 'Algunas de las fechas o ambas no puede(n) ser mayor a la fecha actual. ';
        this.cerrarAlerta();
      }

    }


  }

  eliminarEstudio() {
    this.copiarEstudios = true;
    let i = 0;

    for (const estudio of this.listaDeEstudios ) {
      if ( estudio.EST_DESCRIPCION === this.estudioAEliminar.EST_DESCRIPCION  ) {
        this.listaDeEstudios[i].EST_INSTITUCION = 'no';
      } else {
        i++;
      }
    }
    
    this.mostrarAlerta = true;
    this.tipoAlerta = 'success';
    this.mensaje = 'Se eliminó correctamente. ';
    this.cerrarAlerta();
    this.modal.dismissAll();
  }

  anadirExperienciasLaborales() {
    this.validarCamposExpLaborales();
    if(this.experienciaLaboralForm.invalid){
      this.experienciaLaboralForm.markAllAsTouched();
      return;
    }

    this.mostrarAlerta = false;
    if (this.experienciaLaboralEditar === true ) {
      let fechaFin = this.experienciaLaboralForm.get('fechaFin').value;
      if(fechaFin==null)
        fechaFin = ""; 
  
      if (  this.verificarFecha(this.experienciaLaboralForm.get('fechaInicio').value)  && this.verificarFecha(this.experienciaLaboralForm.get('fechaFin').value) ) {

        if (   this.isValidoFechas(this.experienciaLaboralForm.get('fechaInicio').value  , this.experienciaLaboralForm.get('fechaFin').value )) {
          this.listaDeExperienciasLaborales[this.posicionExperienciaLaboralEditar].EXP_ESPECIALIDAD = this.experienciaLaboralForm.get('especialidad').value;
          this.listaDeExperienciasLaborales[this.posicionExperienciaLaboralEditar].EXP_EMPRESA = this.experienciaLaboralForm.get('lugarempresa').value;
          this.listaDeExperienciasLaborales[this.posicionExperienciaLaboralEditar].EXP_DESCRIPCION = this.experienciaLaboralForm.get('descripcion').value;
          this.listaDeExperienciasLaborales[this.posicionExperienciaLaboralEditar].EXP_FECH_INI = this.experienciaLaboralForm.get('fechaInicio').value;
          this.listaDeExperienciasLaborales[this.posicionExperienciaLaboralEditar].EXP_FECH_FIN = this.experienciaLaboralForm.get('fechaFin').value;
          this.listaDeContactosReferencia[this.posicionExperienciaLaboralEditar].CONT_NOMBRES = this.experienciaLaboralForm.get('nombreEL').value;
          this.listaDeContactosReferencia[this.posicionExperienciaLaboralEditar].CONT_APELLIDOS = this.experienciaLaboralForm.get('apellido').value;
          this.listaDeContactosReferencia[this.posicionExperienciaLaboralEditar].CONT_EMAIL = this.experienciaLaboralForm.get('correoEL').value;
          this.listaDeContactosReferencia[this.posicionExperienciaLaboralEditar].CONT_CELULAR = this.experienciaLaboralForm.get('celularEL').value;
          this.mostrarAlerta = true;
          this.tipoAlerta = 'success';
          this.mensaje = 'Se editó correctamente. ';
          this.modal.dismissAll();
        
        }
      } else {
        this.mostrarAlertaModal = true;
        this.tipoAlerta = 'danger';
        this.mensaje = 'Algunas de las fechas o ambas no puede(n) ser mayor a la fecha actual. ';
      }
      this.cerrarAlerta();
    } else {

      this.textoDeBotonModal = 'Añadir';
      let fechaFin = this.experienciaLaboralForm.get('fechaFin').value;
      if(fechaFin==null)
        fechaFin = ""; 

      if (  this.verificarFecha(this.experienciaLaboralForm.get('fechaInicio').value)  && this.verificarFecha(this.experienciaLaboralForm.get('fechaFin').value) ) {

        if (   this.isValidoFechas(this.experienciaLaboralForm.get('fechaInicio').value  , this.experienciaLaboralForm.get('fechaFin').value )) {
          const EXPERIENCIAS_LABORALES = new ExperienciaLaboral(
            this.experienciaLaboralForm.get('especialidad').value ,
            this.experienciaLaboralForm.get('lugarempresa').value ,
            this.experienciaLaboralForm.get('descripcion').value ,
            this.experienciaLaboralForm.get('fechaInicio').value ,
            this.experienciaLaboralForm.get('fechaFin').value
          );

          const CONTACTOS_REFERENCIA = new ContactoReferenciaModels(
            this.experienciaLaboralForm.get('nombreEL').value ,
            this.experienciaLaboralForm.get('apellido').value ,
            this.experienciaLaboralForm.get('correoEL').value ,
            this.experienciaLaboralForm.get('celularEL').value
          );

          this.listaDeExperienciasLaborales.push(EXPERIENCIAS_LABORALES);
          this.listaDeContactosReferencia.push(CONTACTOS_REFERENCIA);
          this.mostrarAlerta = true;
          this.tipoAlerta = 'success';
          this.mensaje = 'Se agregó correctamente. ';
          this.modal.dismissAll();
        }
      } else {
        this.mostrarAlertaModal = true;
        this.tipoAlerta = 'danger';
        this.mensaje = 'Algunas de las fechas o ambas no puede(n) ser mayor a la fecha actual. ';
      }
      this.cerrarAlerta();
    }
  }

  eliminarExperienciasLaborales() {
    let i = 0;
    this.copiarExperienciasLaborales = true;
    for (let experienciaLaboral of this.listaDeExperienciasLaborales ) {
      if ( experienciaLaboral.EXP_DESCRIPCION === this.experienciaLaboralAEliminar.EXP_DESCRIPCION  ) {
        this.listaDeExperienciasLaborales[i].EXP_DESCRIPCION = 'no';
      } else {
        i++;
      }
    }
    this.mostrarAlerta = true;
    this.tipoAlerta = 'success';
    this.mensaje = 'Se eliminó correctamente. ';
    this.cerrarAlerta();
    this.modal.dismissAll();
  }

  obtenerRegion(paisSeleccionado) {
    this.regionServicio.getRegiones(paisSeleccionado).subscribe( data => {
      this.REGIONES = data['Resultado'];
      this.datosPersonalesForm.get('departamento').setValue(null);
      this.datosPersonalesForm.get('provincia').setValue(null);
      this.datosPersonalesForm.get('distrito').setValue(null);
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
          this.mensaje = error['error']['mensaje'];
        }
      } else {
        this.mensaje = 'Hubo un error al intentar rescatar las regiones. Por favor, intente de nuevo';
      }
    }
    );
  }

  obtenerProvincia(regionSeleccionado) {
    this.provinciaServicio.getProvincias(regionSeleccionado).subscribe( data => {
      this.PROVINCIAS = data['Resultado'];
      this.datosPersonalesForm.get('provincia').setValue(null);
      this.datosPersonalesForm.get('distrito').setValue(null);
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
    });
  }

  obtenerIDDistrito(id) {
    this.idDistrito = id;
  }

  obtenerIDIdioma(id) {
    this.idIdioma = id;
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

  copyEstudios() {

    if (this.copiarEstudios === true ) {  // En caso de que el usuario haya eliminado algun estudio
 
      let i;
      for ( i = 0;  i < this.listaDeEstudios.length; i++) {
        if (this.listaDeEstudios[i].EST_INSTITUCION !== 'no') {

          this.listaDeEstudiosFinal.push(this.listaDeEstudios[i]); // Asignamos los valores.

        }
      }
    } else {   // En caso de que el usuario nunca haya eliminado algun estudio

      this.listaDeEstudiosFinal = this.listaDeEstudios.slice(); // Asignamos los valores.

    }
  }

  copyExperienciaLaboral() {


    if ( this.copiarExperienciasLaborales === true ) { // En caso de que el usuario haya eliminado alguna experiencia Laboral
      let i;
      for (i = 0 ;  i < this.listaDeExperienciasLaborales.length ; i++ ) {
        if (this.listaDeExperienciasLaborales[i].EXP_DESCRIPCION !== 'no' ) {
          this.listaDeExperienciasLaboralesFinal.push(this.listaDeExperienciasLaborales[i]); // Asignamos los valores.
          this.listaDeContactosReferenciaFinal.push(this.listaDeContactosReferencia[i]); // Asignamos los valores.
        }
      }
    } else { // En caso de que el usuario no haya eliminado alguna experiencia Laboral

      this.listaDeExperienciasLaboralesFinal = this.listaDeExperienciasLaborales.slice(); // Asignamos los valores.
      this.listaDeContactosReferenciaFinal = this.listaDeContactosReferencia.slice();// Asignamos los valores.

    }

  }

  

  terminosYCondiciones() {
    this.validarCamposUsuario();
    if(this.usuarioForm.invalid){
      this.usuarioForm.markAllAsTouched();
      this.mostrarAlerta = true;
      this.tipoAlerta = 'danger';
      this.mensaje = 'Campos inválidos. Por favor, intente de nuevo';
      this.cerrarAlerta();
      return;
    }
    let datosJuridicos = null;

    this.mostrarAlertaTerminos = false;
    this.esValidoContrasena = true;
    this.cargaDeCV = true;
    if(this.TIPO_POSTULANTE === 0 ){
      this.copyEstudios();
    } else{
      if(this.datosEmpresa.invalid){
        this.datosEmpresa.markAllAsTouched();
        return;
      }
      let razonSocial = this.datosEmpresa.get('razonSocial').value;
      let ruc = this.datosPersonalesForm.get('rucD').value;
      let tipoEmpresa = this.datosEmpresa.get('tipoEmpresa').value;
      datosJuridicos = {
        "razonSocial": razonSocial,
        "ruc":ruc,
        "tipoEmpresa":tipoEmpresa
      }
    }
    this.copyExperienciaLaboral();
    this.insertarPostulante();
    this.carga = true;
    this.inhabilitarBotonesPostular = true;
    this.mostrarAlerta = false;
    this.postulanteService.insertarPostulante( this.TIPO_POSTULANTE, this.idIdioma,  this.idDistrito, this.postulante, this.listaDeExperienciasLaboralesFinal, this.listaDeEstudiosFinal, this.listaDeContactosReferenciaFinal, datosJuridicos).subscribe( (data) => {
      this.carga = false;
      this.usuarioForm.reset();
      this.datosPersonalesForm.reset();
      this.estudiosForm.reset();
      this.experienciaLaboralForm.reset();
      this.inhabilitarBotonesPostular = false;
      this.cargaDeCV = false;
      this.myinputCV.nativeElement.value = '';  // Elimina el archivo.
      this.cambiarProfile = false;
      this.listaDeEstudios = []; // Elimina los objetos creados.
      this.listaDeExperienciasLaborales = [];  // Elimina los objetos creados.
      this.listaDeContactosReferencia = [];  // Elimina los objetos creados.
      this.opacarDateFechaNacimiento = true;
      this.opacarDateFechaInicioEstudio = true;
      this.opacarDateFechaFinEstudio = true;
      this.opacarDateFechaInicioExperienciaLaboral = true;
      this.opacarDateFechaFinExperienciaLaboral = true; 
      this.modal.dismissAll();
      this.mostrarModalRedireccion();
    }, error => {
      this.inhabilitarBotonesPostular = false;
      this.mostrarAlerta = true;
      this.carga = false;
      this.tipoAlerta = 'danger';
      this.mostrarAlertaTerminos = true;
      if (error['error']['error'] !== undefined) {
        if (error['error']['error'] === 'error_deBD') {
          this.mensaje = 'Hubo un error al intentar ejecutar su solicitud. Por favor, intente de nuevo';
        } else if (error['error']['error'].includes('POST_CV')) {
          this.mensaje = "Debe ingresar su CV";
        } else if (error['error']['error'] === 'error_deCampo') {
          this.mensaje = 'Debe completar todos los campos correctamente';
        } else if (error['error']['error'] === 'error_NICKExistente') {
          this.mensaje = 'El NICKNAME ingresado ya se encuentra registrado. Por favor, agregue otro.';
        } else if (error['error']['error'] === 'error_DNIExistente') {
          this.mensaje = 'El DNI ingresado ya se encuentra registrado. ';
        } else if (error['error']['error'] === 'error_EMAILExistente') {
          this.mensaje = 'El Email ingresado ya se encuentra registrado. ';
        } else if (error['error']['error'] === 'error_MAYORDEEDADExistente') {
          this.mensaje = 'Usted debe ser mayor de edad para poder registrar su postulación. ';
        } else if (error['error']['error'] === 'error_Rucxistente') {
          this.mensaje = error['error']['mensaje'];
        } else if (error['error']['error'] === 'error_deEstudios') {
          this.mensaje = "Debe completar sus estudios";
        } else if (error['error']['error'] === 'error_deExperiencias') {
          this.mensaje = "Debe completar sus experiencias";
        } else if (error['error']['error'] === 'error_deContactos') {
          this.mensaje = "Debe completar sus contactos de referencia";
        }
      } else {
        this.mensaje = 'Hubo un error al intentar insertar un postulante. Por favor, intente de nuevo';
      }
      this.cerrarAlerta();
    });
  }

  mostrarModalRedireccion() {
    this.modal.open(this.redireccionarLoginPostulante, {size: 'lg'});
  }
  

  redireccionarPagina() {
    this.authService.checkedGuardPostulante(true);
    this.authService.isNewPostulante(true);
    if(this.storageService.getString('MOVIL') === '0')
      this.router.navigate(['postulante/login']);
    else
      this.router.navigate(['postulante/login/movil']);
  }

  confirmarSubidaDeImagen() {
    this.cambiarProfile = true;
    this.modal.dismissAll();
  }

  subirImagen(event) {
    let files = event.target.files;
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
    this.croppedImage = event.base64;// Obtiene la imagen en base 64 y otros datos.
    this.post_foto = this.croppedImage?.toString().slice(22); // Obtiene la imagen en base 64.
  }


  obtenerExtension(filename): any {
    return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
  }

  subirArchivoCV(event) {
    this.cargaDeCV = false;
    let files = event.target.files;
    let file = files[0];
    if(!files || !file){
      this.tituloArchivo= '';
      return;
    }
    if ( this.obtenerExtension(files[0].name).toString().toUpperCase() === 'PDF' ) {
      this.mostrarAlertaArchivo = false;
      if (files && file) {
        let reader = new FileReader();
        reader.onload = this._handleReaderLoaded.bind(this);
        reader.readAsBinaryString(file);
        this.tituloArchivo= file.name;
      }
      this.isCV = true;
    } else {
      this.myinputCV.nativeElement.value = '';
      this.mostrarAlertaArchivo = true;
      this.mensajeArchivo = 'El formato solo permite archivos con extensión .pdf';
    }
  }

  _handleReaderLoaded(readerEvent): any {
    let binaryString = readerEvent.target.result;
    if (this.isCV === true) {
      this.post_cv = btoa(binaryString);
      this.cargaDeCV = true;
      this.isCV = false;
    }
  }

  obtenerSexo(sexo) {
    this.sexo = sexo;
  }

  verificarFecha(fecha: any): boolean { // FUNCIÓN QUE COMPARA LA FECHA DEL PARAMETRO CON LA FECHA ACTUAL.
    const fechaActual = new Date();

    if (fecha > this.datePipe.transform(fechaActual.toDateString(), 'yyyy-MM-dd')) {
      return false;
    }

    return true;
  }

  isValidoFechas(dateInicio: any, dateFin: any): boolean {
    if(dateFin!= " "){
      if ((dateInicio > dateFin)  ) {
        this.mostrarAlertaModal = true;
        this.tipoAlerta = 'danger';
        this.mensaje = 'La fecha de inicio no puede ser mayor a la fecha fin. ';
        this.cerrarAlerta();
        return false;
      }
      if (dateInicio == dateFin  ) {
        this.mostrarAlertaModal = true;
        this.tipoAlerta = 'danger';
        this.mensaje = 'La fecha de inicio y la fecha fin no pueden ser iguales. ';
        this.cerrarAlerta();
        return false;
      }
    }
    return true;
  }

  isValidoContrasenia(contrasenia: any, contraseniaconfirmar: any): boolean  {
    if (contrasenia === contraseniaconfirmar) {
      return true;
    }
    return false;
  }

  getTodayFechaNacimiento(): string {
    const fechaActual = this.datePipe.transform(new Date(), "yyyy-MM-dd").split('-')
    const dia = fechaActual[2]
    const mes = fechaActual[1];
    const anio = Number(fechaActual[0]) - 18;
    let fechaMaxima = anio + '-' + mes + '-' + dia;
  
    return new Date(fechaMaxima).toISOString().split('T')[0] 
  }

  getToday(): string { // Devuelve 4 formatos de fechas, y solo escogemos el primero [0], hasta donde termine en 'T'.
    const fechaActual = this.datePipe.transform(new Date(), "yyyy-MM-dd").split('-')
    let fecha = fechaActual[0] + '-' + fechaActual[1] + '-' + fechaActual[2];
    return new Date(fecha).toISOString().split('T')[0] 
 }

 //función que determinará el comportamiendo del input de la fecha final de estudio cuando se selecciona el checkbox
 procesoDatosCheckEstudio(){
  this.isCheckEstudio = !this.isCheckEstudio;//se cambia el valor de la variable a su opuesto
  //si el checkbox esta seleccionado se inhabilitado sino se habilita el input de la fecha de fin
  if(this.isCheckEstudio){
    this.estudiosForm.get('est_fech_fin').setValue(" ");
    this.estudiosForm.controls.est_fech_fin.disable();
  }
  else
    this.estudiosForm.controls.est_fech_fin.enable(); 
  }



  //función que determinará el comportamiendo del input de la fecha final de estudio cuando se selecciona el checkbox
  procesoDatosCheckExperiencia(){
    this.isCheckExperiencia = !this.isCheckExperiencia;//se cambia el valor de la variable a su opuesto
    //si el checkbox esta seleccionado se inhabilitado sino se habilita el input de la fecha de fin
    if(this.isCheckExperiencia){
      this.experienciaLaboralForm.get('fechaFin').setValue(" ");
      this.experienciaLaboralForm.controls.fechaFin.disable();
    }
    else
      this.experienciaLaboralForm.controls.fechaFin.enable(); 

  }

  /****   FUNCIONES PARA LOS STYLES CSS   *****/

  cambiarDeStyleDate() {
    this.opacarDateFechaNacimiento = false;
  }

  cambiarDeStyleDateInicioEstudio() {
    this.opacarDateFechaInicioEstudio = false;
  }

  cambiarDeStyleDateFinEstudio() {
    this.opacarDateFechaFinEstudio = false;
  }

  cambiarDeStyleDateInicioExperienciaLaboral() {
    this.opacarDateFechaInicioExperienciaLaboral = false;
  }

  cambiarDeStyleDateFinExperienciaLaboral() {
    this.opacarDateFechaFinExperienciaLaboral = false;
  }

  get est_tipo() {
    return this.estudiosForm.get('est_tipo');
  }

  get est_institucion() {
    return this.estudiosForm.get('est_institucion');
  }

  get est_fech_ini() {
    return this.estudiosForm.get('est_fech_ini');
  }

  get est_fech_fin() {
    return this.estudiosForm.get('est_fech_fin');
  }

  get est_descripcion() {
    return this.estudiosForm.get('est_descripcion');
  }

  get usu_apodo() {
    return this.usuarioForm.get('usu_apodo');
  }

  get contrasena() {
    return this.usuarioForm.get('contrasena');
  }

  get contrasenaConfirmar() {
    return this.usuarioForm.get('contrasenaConfirmar');
  }

  /*  FORMS DE DATOSPERSONALESFORM  */

  get direccionDP() {
    return this.datosPersonalesForm.get('direccionDP');
  }

  get nombre() {
    return this.datosPersonalesForm.get('nombre');
  }

  get apellidoPaterno() {
    return this.datosPersonalesForm.get('apellidoPaterno');
  }

  get dni() {
    return this.datosPersonalesForm.get('dni');
  }

  get rucD() {
    return this.datosPersonalesForm.get('rucD');
  }

  get idioma() {
    return this.datosPersonalesForm.get('idioma');
  }

  get apellidoMaterno() {
    return this.datosPersonalesForm.get('apellidoMaterno');
  }

  get date() {
    return this.datosPersonalesForm.get('date');
  }

  get direccion() {
    return this.datosPersonalesForm.get('direccion');
  }

  get correo() {
    return this.datosPersonalesForm.get('correo');
  }

  get celular() {
    return this.datosPersonalesForm.get('celular');
  }

  get pais() {
    return this.datosPersonalesForm.get('pais');
  }

  get departamento() {
    return this.datosPersonalesForm.get('departamento');
  }

  get provincia() {
    return this.datosPersonalesForm.get('provincia');
  }

  get distrito() {
    return this.datosPersonalesForm.get('distrito');
  }


  /*  FORMS DE EXPERIENCIAS LABORALES.  */

  get descripcion() {
    return this.experienciaLaboralForm.get('descripcion');
  }

  get lugarempresa() {
    return this.experienciaLaboralForm.get('lugarempresa');
  }

  get especialidad() {
    return this.experienciaLaboralForm.get('especialidad');
  }

  get fechaInicio() {
    return this.experienciaLaboralForm.get('fechaInicio');
  }

  get fechaFin() {
    return this.experienciaLaboralForm.get('fechaFin');
  }

  get nombreEL() {
    return this.experienciaLaboralForm.get('nombreEL');
  }

  get apellido() {
    return this.experienciaLaboralForm.get('apellido');
  }

  get correoEL() {
    return this.experienciaLaboralForm.get('correoEL');
  }

  get celularEL() {
    return this.experienciaLaboralForm.get('celularEL');
  }

  /* FORMS DE DATOS DE LA EMPRESA */
  get ruc() {
    return this.datosPersonalesForm.get('rucD');
  }
  get razonSocial() {
    return this.datosEmpresa.get('razonSocial');
  }
  get tipoEmpresa() {
    return this.datosEmpresa.get('tipoEmpresa');
  }

  validarCamposUsuario(){
    this.usuarioForm.controls.usu_apodo.setValidators([Validators.required, Validators.pattern('[a-zñáéíóúA-ZÑÁÉÍÓÚ0-9]+'), Validators.maxLength(15)]);
    this.usuarioForm.controls.usu_apodo.updateValueAndValidity();
    this.usuarioForm.controls.contrasena.setValidators([Validators.required,Validators.minLength(8), Validators.maxLength(20),passwordValidation()]);
    this.usuarioForm.controls.contrasena.updateValueAndValidity();
    this.usuarioForm.controls.contrasenaConfirmar.setValidators([Validators.required,Validators.minLength(8), Validators.maxLength(20)]);
    this.usuarioForm.controls.contrasenaConfirmar.updateValueAndValidity();
  
    this.datosPersonalesForm.controls.nombre.setValidators([Validators.required, Validators.pattern('[a-zñáéíóú A-ZÑÁÉÍÓÚ ]+'), Validators.maxLength(50)]);
    this.datosPersonalesForm.controls.nombre.updateValueAndValidity();
    this.datosPersonalesForm.controls.apellidoPaterno.setValidators([Validators.required, Validators.pattern('[a-zñáéíóú A-ZÑÁÉÍÓÚ ]+'), Validators.maxLength(30)]);
    this.datosPersonalesForm.controls.apellidoPaterno.updateValueAndValidity();
    this.datosPersonalesForm.controls.apellidoMaterno.setValidators([Validators.required, Validators.pattern('[a-zñáéíóú A-ZÑÁÉÍÓÚ ]+'), Validators.maxLength(30)]);
    this.datosPersonalesForm.controls.apellidoMaterno.updateValueAndValidity();
    this.datosPersonalesForm.controls.date.setValidators([Validators.required ]);
    this.datosPersonalesForm.controls.date.updateValueAndValidity();
    this.datosPersonalesForm.controls.dni.setValidators([Validators.required, Validators.pattern(/^([0-9])*$/), Validators.minLength(8),  Validators.maxLength(8)]);
    this.datosPersonalesForm.controls.dni.updateValueAndValidity();
    this.datosPersonalesForm.controls.rucD.setValidators([Validators.required, Validators.pattern(/^([0-9])*$/), Validators.maxLength(11), Validators.minLength(11)]);
    this.datosPersonalesForm.controls.rucD.updateValueAndValidity();
    this.datosPersonalesForm.controls.idioma.setValidators([Validators.required ]);
    this.datosPersonalesForm.controls.idioma.updateValueAndValidity();   
    this.datosPersonalesForm.controls.direccion.setValidators([Validators.required , Validators.pattern('^[a-zñáéíóú#°/,. A-ZÑÁÉÍÓÚ  0-9]+$'), Validators.maxLength(100)]);
    this.datosPersonalesForm.controls.direccion.updateValueAndValidity();
    this.datosPersonalesForm.controls.correo.setValidators([Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/), Validators.maxLength(60), Validators.email]);
    this.datosPersonalesForm.controls.correo.updateValueAndValidity();
    this.datosPersonalesForm.controls.celular.setValidators([Validators.required, Validators.pattern('[+][0-9]+'), Validators.maxLength(20), Validators.minLength(12)] );
    this.datosPersonalesForm.controls.celular.updateValueAndValidity();
    this.datosPersonalesForm.controls.pais.setValidators([Validators.required ]);
    this.datosPersonalesForm.controls.pais.updateValueAndValidity();
    this.datosPersonalesForm.controls.departamento.setValidators([Validators.required ]);
    this.datosPersonalesForm.controls.departamento.updateValueAndValidity();
    this.datosPersonalesForm.controls.provincia.setValidators([Validators.required ]);
    this.datosPersonalesForm.controls.provincia.updateValueAndValidity();
    this.datosPersonalesForm.controls.distrito.setValidators([Validators.required ]);
    this.datosPersonalesForm.controls.distrito.updateValueAndValidity();
    
    if(this.TIPO_POSTULANTE != 0){      
      this.datosEmpresa.controls.razonSocial.setValidators([Validators.required, Validators.pattern('[a-zñáéíóú A-ZÑÁÉÍÓÚ ]+'), Validators.maxLength(100)]);
      this.datosEmpresa.controls.razonSocial.updateValueAndValidity();
      
      this.datosEmpresa.controls.tipoEmpresa.setValidators(Validators.required);
      this.datosEmpresa.controls.tipoEmpresa.updateValueAndValidity();
    }
  }
  
  
  validarCamposEstudios(elimarVal?:boolean){
    this.estudiosForm.controls.est_tipo.setValidators([Validators.required, Validators.pattern('[a-zñáéíóúA-ZÑÁÉÍÓÚ ]+'), Validators.maxLength(20)]);
    this.estudiosForm.controls.est_institucion.setValidators([Validators.required, Validators.maxLength(20)]);
    this.estudiosForm.controls.est_fech_fin.setValidators(Validators.required);
    this.estudiosForm.controls.est_fech_ini.setValidators(Validators.required);
    this.estudiosForm.controls.est_descripcion.setValidators([Validators.required, Validators.maxLength(60)]);
    if(elimarVal){
      this.estudiosForm.controls.est_tipo.clearValidators();
      this.estudiosForm.controls.est_institucion.clearValidators();
      this.estudiosForm.controls.est_fech_fin.clearValidators();
      this.estudiosForm.controls.est_fech_ini.clearValidators();
      this.estudiosForm.controls.est_descripcion.clearValidators();
    }
    
    this.estudiosForm.controls.est_tipo.updateValueAndValidity();
    this.estudiosForm.controls.est_institucion.updateValueAndValidity();
    this.estudiosForm.controls.est_fech_fin.updateValueAndValidity();
    this.estudiosForm.controls.est_fech_ini.updateValueAndValidity();
    this.estudiosForm.controls.est_descripcion.updateValueAndValidity();
  }
  
  validarCamposExpLaborales(elimarVal?:boolean){
    this.experienciaLaboralForm.controls.descripcion.setValidators([Validators.required, Validators.maxLength(60)]);
    this.experienciaLaboralForm.controls.lugarempresa.setValidators([Validators.required, Validators.pattern('^[a-zñáéíóú A-ZÑÁÉÍÓÚ  0-9]+$'), Validators.maxLength(20)]);
    this.experienciaLaboralForm.controls.especialidad.setValidators([Validators.required, Validators.pattern('^[a-zñáéíóú A-ZÑÁÉÍÓÚ  0-9]+$'), Validators.maxLength(20)]);
    this.experienciaLaboralForm.controls.fechaInicio.setValidators([Validators.required]);
    this.experienciaLaboralForm.controls.fechaFin.setValidators([Validators.required]);
    this.experienciaLaboralForm.controls.nombreEL.setValidators([Validators.required, Validators.pattern('[a-zñáéíóú A-ZÑÁÉÍÓÚ ]+'), Validators.maxLength(50)]);
    this.experienciaLaboralForm.controls.apellido.setValidators([Validators.required, Validators.pattern('[a-zñáéíóú A-ZÑÁÉÍÓÚ ]+'), Validators.maxLength(30)]);
    this.experienciaLaboralForm.controls.correoEL.setValidators([  Validators.pattern(/^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/), Validators.maxLength(60)]);
    this.experienciaLaboralForm.controls.celularEL.setValidators([Validators.required, Validators.pattern('[+][0-9]+'), Validators.maxLength(20),Validators.minLength(12)]);

    if(elimarVal){

      this.experienciaLaboralForm.controls.descripcion.clearValidators();
      this.experienciaLaboralForm.controls.lugarempresa.clearValidators();
      this.experienciaLaboralForm.controls.especialidad.clearValidators();
      this.experienciaLaboralForm.controls.fechaInicio.clearValidators();
      this.experienciaLaboralForm.controls.fechaFin.clearValidators();
      this.experienciaLaboralForm.controls.nombreEL.clearValidators();
      this.experienciaLaboralForm.controls.apellido.clearValidators();
      this.experienciaLaboralForm.controls.correoEL.clearValidators();
      this.experienciaLaboralForm.controls.celularEL.clearValidators();
    }

    this.experienciaLaboralForm.controls.descripcion.updateValueAndValidity();
    this.experienciaLaboralForm.controls.lugarempresa.updateValueAndValidity();
    this.experienciaLaboralForm.controls.especialidad.updateValueAndValidity();
    this.experienciaLaboralForm.controls.fechaInicio.updateValueAndValidity();
    this.experienciaLaboralForm.controls.fechaFin.updateValueAndValidity();
    this.experienciaLaboralForm.controls.nombreEL.updateValueAndValidity();
    this.experienciaLaboralForm.controls.apellido.updateValueAndValidity();
    this.experienciaLaboralForm.controls.correoEL.updateValueAndValidity();
    this.experienciaLaboralForm.controls.celularEL.updateValueAndValidity();

  }

  abrirVentana(){
    window.open(this.rutaTerminosCondiciones, "_blank"); 
  }

  cerrarAlerta(){
    setTimeout(() => {
      this.mostrarAlerta=false;
      this.mostrarAlertaModal=false;
      this.mostrarAlertaTerminos=false;
    }, 5000);
  }
}
