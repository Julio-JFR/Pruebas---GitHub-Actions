import { Component, ElementRef, OnInit, ViewChild, Renderer2  } from '@angular/core';

import { Router } from '@angular/router';
import { FormGroup, FormBuilder,  Validators } from '@angular/forms';
import { NgbAlert, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GooglePlaceDirective } from 'ngx-google-places-autocomplete';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import {SolicitudesService} from '../solicitudes/solicitudes.service';
import {SolicitudesModels} from '../solicitudes/solicitudes.models';
import {UbicacionModels} from '../ubicacion/ubicacion.models';
import {StorageService} from '../../helpers/storage.service';
import { EntidadServicio } from '../servicios/entidad-servicio';
import { NgxImageCompressService } from 'ngx-image-compress';


import {ClienteService} from '../clientes/cliente.service';
import {Cliente} from '../clientes/cliente.model';
import {CategoriaservicioserviceService} from '../categoria-servicio/categoriaservicioservice.service';
import {environment} from '../../../environments/environment';

import { DatePipe } from '@angular/common';
import { ConfiguracionesService } from '../configuraciones/configuraciones.service';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
@Component({
  selector: 'app-datos-servicios',
  templateUrl: './datos-servicios.component.html', 
  styleUrls: ['./datos-servicios.component.scss']
})


export class DatosServiciosComponent implements OnInit {

  /***** MODALES CON VIEWCHILD  ***/
  @ViewChild('modalCroquis') elementModalCroquis: ElementRef;
  @ViewChild('eliminar') elementModalEliminarFoto: ElementRef;
  @ViewChild('insertar') elementModalInsertar: ElementRef;
  @ViewChild("placesRef") placesRef : GooglePlaceDirective;
  @ViewChild("mapados") elementMapDos: ElementRef;
  @ViewChild('selfClosingAlert', {static: false}) selfClosingAlert: NgbAlert; 

  solicitudesModels: SolicitudesModels = new SolicitudesModels();
  ubicacion: UbicacionModels = new UbicacionModels();
  servicioSolicitado: EntidadServicio = new EntidadServicio();
  CLIENTE: Cliente = new Cliente();
  CAT_SER_ID:number;

  nombreCliente:string;
  celularCliente:string;
  clienteID:Number;
  categoriaServicioID:Number;
  direction: string;

  IMAGENES: any = [];
  imagenDefecto : boolean;
  IMAGENESFINALES: any = [];
  imagenAEliminar: string;
  seconds = true; // Es para habilitar la casilla de los segundos
  meridian = true; // Es para activar el boton AM o PM
  activeSliderId: string;


  cargandoDatos = true;
  tipoAlerta: string;
  mensaje: string;
  mensajeInicio: string;
  // mostrarAlertaConfiguracion: boolean = false;
  mostrarAlerta: boolean;
  mostrarAlertaUbicacion: boolean;
  cargaDeDato:boolean;
  invalido:boolean;

  esValidocambioCEL = true;
  esValidocambioNombreUsuario = true;
  esValidocambioServicio = true;

  //Clave configuracion
  claveConfiguracion:number;

  mostrarAlertaGoogle = false; // es para mostrar la alerta del estado que nos arroja google maps.
  origin: any;
  isBloqueoGeocalización: boolean = false;
  ubicacionDefault: string;
  mapa;
  marcadores = [];
  options = {
    componentRestrictions: {
      country: ['PE']  // solo mostrará lugares del Perú, si se quita country, se buscará sitios de todo el mundo.
    }
  };



  mostrarAlertaArchivo:boolean = false;
  clickeoMapa:boolean = false;
  mapaResumen:boolean = false;
  HORA_SERVICIO : string;
  esValidocambioDescipcionServicio: boolean;


  sizeMinimoACompress = 5;
  IMG_SERVICIO: any = null;
  NO_IMG = '../../../assets/images/no-img.png';
  isCollapsed = true;


  servicioRemoto=false;
  mostrarCasillaRemoto: number;
  valiodoMapa:boolean = false;

  public clienteForm: FormGroup;
  public servicioForm: FormGroup;
  public otroContactoForm: FormGroup;
  invalido_dir: boolean = false;
  DOMINIO = environment.domain_url;
  imagenInvalida:boolean = false;
  limiteDiasMaximo:number;

  constructor(
    private formBuilder: FormBuilder,
    public modal: NgbModal,
    private solicitudservice: SolicitudesService,
    private imageCompress: NgxImageCompressService,
    private localStorageService: StorageService,
    private clienteService:ClienteService ,
    private router:Router ,
    private datePipe: DatePipe,
    private elemtMap2: ElementRef,
    private renderer: Renderer2,
    private categoriaServicioService:CategoriaservicioserviceService,
    private configuracionService: ConfiguracionesService,
    private notificacionesService:NotificacionesService
    
  ) { 
    this.obtenerUbicacion();
  }

  ngOnInit(): void {
    this.inicializarServicioForm();
    this.inicializarClientesForm();
    this.solicitudservice.updateHeaders();
    this.obtenerDatosCliente();
    this.obtenerConfiguraciones();
    this.obtenerCategoriaServicio(Number(this.servicioSolicitado["CAT_ID"]), Number(this.servicioSolicitado["SER_ID"])  );
    this.mostrarCasillaRemoto = this.servicioSolicitado.SER_REMOTO;
    if(this.servicioSolicitado.SER_REMOTO===1){
      this.servicioRemoto = true;
    }
    this.imagenDefecto = true;
    this.mostrarCasillaRemoto == 1 ? this.valiodoMapa=true: this.valiodoMapa=false;
  }
  
  
  obtenerCambioCelular(valorFormulario, valorReal){
    if(valorFormulario == valorReal){
      this.esValidocambioCEL = true;
    } else{
      this.esValidocambioCEL = false;
    }
  }

  obtenerCambioNombreUsuario(valorFormulario, valorReal){
    if(valorFormulario == valorReal){
      this.esValidocambioNombreUsuario = true;
    } else{
      this.esValidocambioNombreUsuario = false;
    }
  }


  obtenerCambioNombreServicio(valorFormulario, valorReal){
    if(valorFormulario == valorReal){
      this.esValidocambioServicio = true;
    } else{
      this.esValidocambioServicio = false;
    }
  }

  obtenerCambioDescripcionServicio(valorFormulario, valorReal){

    if(valorFormulario == valorReal){
      this.esValidocambioDescipcionServicio = true;
    } else{
      this.esValidocambioDescipcionServicio = false;
    }
  }

  obtenerDatosCliente(){
    let id =Number(localStorage.getItem('USE_ID')); 
    let typeUser =Number(localStorage.getItem('USE_TYPE')); 
    this.clienteService.getClienteById(id, typeUser).subscribe(
      (cliente) => {
        this.CLIENTE = cliente['Resultado'][0];
        this.cargandoDatos = false;
        this.updateValues();
        this.inicializarClientesForm();
        if(this.servicioSolicitado.SER_REMOTO==1)
          this.clienteForm.patchValue({remoto:{value:true,disabled:true}})
      },
      (error) => {
        this.cargandoDatos = false;
        this.mostrarAlerta = true;
        this.tipoAlerta = 'danger';
        if (error['error']['error'] !== undefined) {
          if (error['error']['error'] === 'error_noExistenciaDeIdCli') {
            this.mensajeInicio = 'No se pudo obtener los datos personales del cliente debido a que ya no se encuentra registrado. Por favor, intente de nuevo.';
          }
          else if (error['error']['error'] === 'error_deBD') {
            this.mensajeInicio = 'Hubo un error al intentar ejecutar su solicitud para obtener los datos personales del cliente. Por favor, intente de nuevo.';
          }
          else if (error['error']['error'] === 'error_deCampo') {
            this.mensajeInicio = 'Los datos ingresados deben respetar los formatos permitidos. Por favor, intente de nuevo.';
          }
        } else {
            this.mensajeInicio = 'Hubo un error al intentar obtener la información personal. Por favor, intente de nuevo';
        }
        this.cerrarAlerta();
      });

  }

  obtenerCategoriaServicio(CAT_ID:number, SER_ID:number){
    this.categoriaServicioService.obtenerCategoriaServicioID(CAT_ID, SER_ID).subscribe( data => {
      this.CAT_SER_ID = data["resultado"]["CAT_SER_ID"];
    }, error => {
        this.cargandoDatos = false;
        this.mostrarAlerta = true;
        this.tipoAlerta = 'danger';
        if (error['error']['error'] !== undefined) {
          if (error['error']['error'] === 'error_noExistenciaDeIdServicio') {
            this.mensajeInicio = 'No se pudo obtener los datos debido que no existe el servicio solicitado. Por favor, intente de nuevo.';
          } else if (error['error']['error'] === 'error_noExistenciaDeIdCategoria') {
            this.mensajeInicio = 'No se pudo obtener los datos debido que no existe la categoría solicitada. Por favor, intente de nuevo.';
          }
          else if (error['error']['error'] === 'error_deBD') {
            this.mensajeInicio = 'Hubo un error al intentar ejecutar su solicitud para obtener los datos personales del cliente. Por favor, intente de nuevo.';
          }
          else if (error['error']['error'] === 'error_deCampo') {
            this.mensajeInicio = 'Los datos ingresados deben respetar los formatos permitidos. Por favor, intente de nuevo.';
          }
        } else {
            this.mensajeInicio = 'Hubo un error al intentar obtener la información personal. Por favor, intente de nuevo';
        }
        this.cerrarAlerta();
    });
  }


  inicializarClientesForm() {
    this.nombreCliente = this.CLIENTE.USU_NOMBRES ? this.CLIENTE.USU_NOMBRES+" "+this.CLIENTE.USU_APE_PAT+" "+this.CLIENTE.USU_APE_MAT : "";
    this.celularCliente = this.CLIENTE.USU_CELULAR ;
    this.direction = this.CLIENTE.USU_DIRECCION;
    this.clienteForm =  this.formBuilder.group({
      nombreCompleto:  [this.nombreCliente ],
      celular: [this.celularCliente, [ Validators.required ,Validators.pattern('[+][0-9]+'), Validators.minLength(12) , Validators.maxLength(20)] ],
      direccion: [this.direction, [Validators.pattern('^[a-zñáéíóú#°/,-. A-ZÑÁÉÍÓÚ  0-9]+$') , Validators.maxLength(100)]],
      fecha: ['', [Validators.required ]],
      hora:[{ "hour": 0, "minute": 0, "second": 0 }, [Validators.required ]],
      descripcion:['' , [ Validators.required , Validators.pattern('^[a-zñáéíóú., A-ZÑÁÉÍÓÚ  0-9]+$'), Validators.maxLength(200)]],
      nombre_otroContacto: ['', [ Validators.pattern('[a-zñáéíóú A-ZÑÁÉÍÓÚ ]+$'), Validators.maxLength(50) ]],
      celular_otroContacto:['', [ Validators.pattern('[+][0-9]+'), Validators.minLength(12) , Validators.maxLength(20) ]],
      remoto: [{value:this.servicioSolicitado.SER_REMOTO==1,disabled:this.servicioSolicitado.SER_REMOTO==1}],
      direccion_remota:['Servicio remoto']
    });
  }

  inicializarServicioForm(){
    if( this.localStorageService.hasKey("SERVICIO") ){
      this.servicioSolicitado = this.localStorageService.getObjeto("SERVICIO");
    }
    let nombre_servicio = this.servicioSolicitado["SER_NOMBRES"];
    let descripcionServicio = this.servicioSolicitado["SER_DESCRIPCION"];
    this.IMG_SERVICIO =  this.servicioSolicitado["SER_IMG"];
    this.servicioForm =  this.formBuilder.group({
      nombreServicio:[nombre_servicio ],
      descripcionServicio: [ descripcionServicio ]
    });
  }


  obtenerFechaActual(): string {
    const fechaActual = this.datePipe.transform(new Date(), "yyyy-MM-dd").split('-')
        let fecha = fechaActual[0] + '-' + fechaActual[1] + '-' + fechaActual[2];
        return new Date(fecha).toISOString().split('T')[0] 
  }

  handleAddressChange (address: Address) { // Método que obtendrá la dirección del lugar seleccionado en el mapa.
    this.origin.lat = Number(address.geometry.location.lat());
    this.origin.lng = Number(address.geometry.location.lng());
    this.cargarMapa();
  }
  
  

  obtenerUbicacion() { // Inicializar el mapa con la geocalización.

    if (navigator.geolocation) { // Verifica si el usuario permitió la geocalización.
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.origin = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
      } ,
      () => {
        this.isBloqueoGeocalización = true;
        this.mostrarAlertaGoogle = true;
        this.tipoAlerta = 'danger';
        this.mensaje = ' Advertencia: El servicio de geocalización no se puede realizar, debido que bloqueó la ubicación.  ';
        this.cerrarAlerta();
      }  );

    } else {
      this.mostrarAlertaGoogle = true;
      this.tipoAlerta = 'danger';
      this.mensaje = ' Error: El navegador no soporta la geocalización.  ';
      this.cerrarAlerta();
    }
  }

  cargarMapaResumen() {
    
    this.mapaResumen = true;

    const mapa2 = new google.maps.Map(
      document.getElementById("mapdos") as HTMLElement,
      {
        zoom: 10,
        center: this.origin,
        gestureHandling: "none"
      }
    );
      

    this.marcador(this.origin, mapa2);

  }

  cargarMapa() {

    this.mapa = new google.maps.Map(
      document.getElementById("map") as HTMLElement,
      {
        zoom: 15,
        center: this.origin
      }
    );

    this.marcador(this.origin,this.mapa);
    if(this.clickeoMapa)this.cargarMapaResumen();

    // El siguiente se ejecutará siempre y cuando se haga click en el mapa. 
    this.mapa.addListener( "click", (e) => {
      this.eliminarMarcadores();
      this.marcador(e.latLng, this.mapa);
      this.origin = {
        lat: e.latLng.lat(), // Obtengo la latitud del evento
        lng: e.latLng.lng() // Obtengo la longitud del evento
      };
      //this.clickeoMapa = true;
    })
    
  }
  
  obtenerCoordenadas(){
    this.renderer.removeClass(this.elementMapDos.nativeElement,"invisibleMapa" );
    this.clickeoMapa = true;
    this.modal.dismissAll();
    this.cargarMapaResumen();
  }

  marcador(coordenadas, mapa){
    
    const map = mapa;
    const marcador = new google.maps.Marker({
      position: coordenadas,
      map,
    });
    
    this.marcadores.push(marcador); // Almacenamos los marcadores que se generarán. 
  }


  setMap(ref){
    for (let i = 0; i < this.marcadores.length; i++) {
      this.marcadores[i].setMap(ref); 
    }
  }
  
  eliminarMarcadores(){
    this.setMap(null); 
    this.marcadores = []; // reseteamos el array de marcadores
  }

  
  abrirModalCroquis(){

    if (this.isBloqueoGeocalización === false ) {
      this.modal.open(this.elementModalCroquis, {size: 'lg'});
      this.ubicacionDefault = this.clienteForm.get('direccion').value;
      this.cargarMapa();
    } else{
      this.mostrarAlertaGoogle = true;
      this.tipoAlerta = 'danger';
      this.mensaje = ' Debido a que bloqueó el acceso a su ubicación, no puede utilizar la funcionalidad del mapa ' +
                     ' . Permita acceder a su ubicación, para utilizar la funcionalidad. ';
      this.cerrarAlerta();
    }
  }

  abrirModalInsertar(){
    if (this.clienteForm.invalid) {
      if(this.clickeoMapa==false || this.IMAGENES.length==0)
        this.imagenInvalida = true;
      this.clienteForm.markAllAsTouched();
      return;
    }

    if (this.clienteForm.controls.remoto.value==null ||  this.clienteForm.controls.remoto.value==false) {
      if(this.clickeoMapa==false || this.IMAGENES.length==0){
        this.imagenInvalida = true;
        return;
      }
    }else{
      this.imagenInvalida = false;
    }

    this.mostrarAlerta = false;
    if(this.clienteForm.get('direccion').value === ''){
      this.invalido_dir = true;
    }
    
    let horaActual = new Date();
    horaActual.setMinutes(horaActual.getMinutes() + this.claveConfiguracion);
    let fechaActual2 = new Date();
    let horaMaxima = fechaActual2.getDate();
    let diaBuscado = horaMaxima + this.limiteDiasMaximo;
    fechaActual2.setDate(diaBuscado);
    if (new Date(this.clienteForm.get('fecha').value + ' ' + this.convertirFormt24AFormat12())  < horaActual || new Date(this.clienteForm.get('fecha').value + ' ' + this.convertirFormt24AFormat12()) > fechaActual2) {
      this.mostrarAlertaGoogle=true;
      this.tipoAlerta='danger';
      this.mensaje = 'Se necesita hacer la solicitud del servicio con un mínimo de '+this.claveConfiguracion +' minutos de anticipación y en un rango de '+this.limiteDiasMaximo+' días.';
      this.cerrarAlerta();
    }else{
      this.modal.open(this.elementModalInsertar );
    }
  }

  abrirModalImagen(imagen){
    this.imagenAEliminar = imagen.IMG;
    this.modal.open(this.elementModalEliminarFoto);
  }

  closeModal(): any {
    this.mostrarAlerta = false;
    this.modal.dismissAll();
  }

  obtenerExtension(tipoDeArhivo): string{
    return tipoDeArhivo.toString().split('/')[1].toUpperCase();
  }

  async cargarImagenes(event) {
    this.mostrarAlertaArchivo = false;
    let archivos = event.target.files;
    let type = "";
    let cantidadImagenes = 1; 
    let cantidadTotal = this.IMAGENES.length + archivos.length;
    if (archivos.length !== 0  ) {
      for(let imagen of archivos ){
        if (cantidadImagenes <=5 && this.IMAGENES.length <5 && cantidadTotal<=5) {
          type = this.obtenerExtension(imagen.type);
          if ( type == 'PNG'|| type == 'JPG' || type == 'JPEG') {
            let reader = new FileReader(); 
            reader.onload = await  this.convertirABinario.bind(this);
            reader.readAsDataURL(imagen);
          } else {
            this.mensaje = 'Error! : solo se admite imágenes con extensiones .png, .jpeg, .jpg';
            this.mostrarAlertaArchivo = true;
          }
        } else {
          type = this.obtenerExtension(imagen.type);
          if( type == 'PNG'|| type == 'JPG' || type == 'JPEG'){
            this.mensaje = 'Error!. Solo puede ingresar como máximo 5 imagenes.';
            this.mostrarAlertaArchivo = true;
          }else{
            this.mensaje = 'Error!. Solo se admite imágenes con extensiones .png, .jpeg, .jpg .';
            this.mostrarAlertaArchivo = true;
          }
        }
        cantidadImagenes++;
      }
    } else {
      this.mensaje = 'No se subió ningún archivo.';
      this.mostrarAlertaArchivo = true;
    }
  }

  convertirABinario(readerEvent) {

    let extension = readerEvent.srcElement.result.slice(11,14).toUpperCase();
    if (extension == "JPE"){
      extension = "JPEG"
    }

    let binaryString =  readerEvent.target.result;
    let pesoEnMB = this.imageCompress.byteCount(binaryString)/(1024*1024);

    if ( pesoEnMB >= this.sizeMinimoACompress ){
      this.comprimirImagen(binaryString, extension);
    } else {
      this.IMAGENES.push({EXT: extension, IMG: binaryString});
    }

  }

  comprimirImagen(image, extension) {
    // ARGUMENTOS PARA EL MÉTODO COMPRESSFILE. 
    //P1 = la imagen en base 64, P3= El tamaño de la imagen en radios. 
    // P4 = La calidad de la imagen. 
    this.imageCompress.compressFile(image, -1,20 , 30).then(
    result => {
      this.IMAGENES.push({EXT: extension, IMG: result});
    });
  }


  eliminarImagen(){
    let i=0;

    this.IMAGENES.forEach(image => {
      if(image.IMG == this.imagenAEliminar){ //  Se compara las imagenes en base 64.
        this.IMAGENES.splice(i,1); 
      }
      i++;
    });
    this.closeModal();
    (<HTMLInputElement>document.getElementById('resetInput')).value = "";
  }
  

  obtenerbase64Valida(){
    

    this.IMAGENES.forEach(image => {
      this.IMAGENESFINALES.push({EXT: image.EXT , IMG: image.IMG.toString().split(',')[1]});
    });
  }


  enviarDatos(){
   
    if ((this.clickeoMapa == true  && !this.servicioRemoto)|| this.servicioRemoto) {
      
      if(!this.servicioRemoto){
        this.obtenerbase64Valida();
        this.ubicacion.UBI_LATITUD = this.origin.lat;
        this.ubicacion.UBI_LONGITUD = this.origin.lng;
        if(this.clienteForm.get('direccion').value === ''){
          this.mostrarAlerta = true;
          this.mensaje = "No se ingresó la dirección. Por favor, vuelva a intentarlo.";
          this.tipoAlerta = 'danger';
          this.cerrarAlerta();
          return ;
        }else{
          this.ubicacion.UBI_DIRECCION = this.clienteForm.get('direccion').value;
        }
        this.solicitudesModels.SOL_DESCRIPCION =  this.clienteForm.get('descripcion').value;

        if(this.clienteForm.get('fecha').value !== ""){
          this.solicitudesModels.SOL_FECHA_SERVICIO =  this.clienteForm.get('fecha').value;
        }
        this.solicitudesModels.CLI_ID = Number(localStorage.getItem('USE_ID'));
        this.solicitudesModels.CAT_SER_ID = this.CAT_SER_ID;
        if(this.clienteForm.get('hora').value !== ""){
          this.solicitudesModels.SOL_HORA_SERVICIO = this.HORA_SERVICIO; 
        }
        this.solicitudesModels.SOL_NOMBRE_CONTACTO = this.clienteForm.get('nombre_otroContacto').value;
        this.solicitudesModels.SOL_CELULAR_CONTACTO = this.clienteForm.get('celular_otroContacto').value;
        this.localStorageService.remove("SERVICIO");
        
        this.cargaDeDato =true;
        this.solicitudservice.insertar(this.solicitudesModels,this.ubicacion, this.IMAGENESFINALES,this.CLIENTE['USU_EMAIL']).subscribe( data => {
          this.cargaDeDato =false;
          this.modal.dismissAll();
          this.goToMisSolicitudes();
        }, error => {
          this.cargaDeDato = false;
          this.mostrarAlerta = true;
          this.tipoAlerta = 'danger';
          this.invalido = false;
          if (error['error']['error'] !== undefined) {
            if (error['error']['error'] === 'error_BD') {
              this.mensaje = 'No se pudo realizar la comunicación interna .Por favor, intente de nuevo.';
            } else if (error['error']['error'] === 'error_deCampo') {
              this.mensaje = 'Los valores de los parámetros enviados deben respetar los formatos permitidos. Por favor, intente de nuevo.';
            } else if (error['error']['error'] === 'error_noExistenciaDeIdCategoriaServicio') {
              this.mensaje = 'No existe una categoría-servicio enviado. Por favor, intente de nuevo.';
            } else if (error['error']['error'] === 'error_noExistenciaDeIdCliente') {
              this.mensaje = 'No existe un cliente con la información enviada. Por favor, intente de nuevo.';
            }
          } else {
            this.mensaje = 'Hubo un error al intentar insertar los datos. Por favor, intente de nuevo ';
          }
          this.cerrarAlerta();
        });

      }else{
        this.obtenerbase64Valida();
        this.ubicacion.UBI_DIRECCION = this.clienteForm.get('direccion_remota').value;
        this.solicitudesModels.SOL_DESCRIPCION =  this.clienteForm.get('descripcion').value;
        if(this.clienteForm.get('fecha').value !== ""){
          this.solicitudesModels.SOL_FECHA_SERVICIO =  this.clienteForm.get('fecha').value;
        }
        this.solicitudesModels.CLI_ID = Number(localStorage.getItem('USE_ID'));
        this.solicitudesModels.CAT_SER_ID = this.CAT_SER_ID;
        if(this.clienteForm.get('hora').value !== ""){
          this.solicitudesModels.SOL_HORA_SERVICIO = this.HORA_SERVICIO; 
        }
        this.solicitudesModels.SOL_NOMBRE_CONTACTO = this.clienteForm.get('nombre_otroContacto').value;
        this.solicitudesModels.SOL_CELULAR_CONTACTO = this.clienteForm.get('celular_otroContacto').value;
        this.localStorageService.remove("SERVICIO");
        this.cargaDeDato =true;
        this.solicitudservice.insertarRemoto(this.solicitudesModels,this.ubicacion, this.IMAGENESFINALES,this.CLIENTE['USU_EMAIL']).subscribe( data => {
          if (data.exito) 
            this.notificacionesService.insertarNotificacion(true);
            
          this.cargaDeDato =false;
          this.modal.dismissAll();
          this.goToMisSolicitudes();
        }, error => {
          this.cargaDeDato = false;
          this.mostrarAlerta = true;
          this.tipoAlerta = 'danger';
          this.invalido = false;
          if (error['error']['error'] !== undefined) {
            if (error['error']['error'] === 'error_BD') {
              this.mensaje = 'No se pudo realizar la comunicación interna .Por favor, intente de nuevo.';
            } else if (error['error']['error'] === 'error_deCampo') {
              this.mensaje = 'Los valores de los parámetros enviados deben respetar los formatos permitidos. Por favor, intente de nuevo.';
            } else if (error['error']['error'] === 'error_noExistenciaDeIdCategoriaServicio') {
              this.mensaje = 'No existe una categoría-servicio enviado. Por favor, intente de nuevo.';
            } else if (error['error']['error'] === 'error_noExistenciaDeIdCliente') {
              this.mensaje = 'No existe un cliente con la información enviada. Por favor, intente de nuevo.';
            }
          } else {
            this.mensaje = 'Hubo un error al intentar insertar los datos. Por favor, intente de nuevo ';
          }
          this.cerrarAlerta();
        });
      }
      
      
    } else {
      this.mostrarAlerta = true;
      this.tipoAlerta = 'danger';
      this.mensaje = "Debe seleccionar su ubicación en el mapa";
      this.cerrarAlerta();
    }
    

  }

  convertirFormt24AFormat12(): string {
    let AMPM = ' AM';
    let hora = this.clienteForm.get('hora').value.hour;
    let horaF = this.clienteForm.get('hora').value.hour;
    let minuto = this.clienteForm.get('hora').value.minute;
    let segundo = this.clienteForm.get('hora').value.second;

    
    if (hora >= 13) {
      hora = hora - 12;
      if(hora<= 9){
        hora = '0' + hora;
      }
      AMPM = ' PM';
    } else if (hora < 10  ) {
      hora = '0' + hora;
    } else if (hora == 12){
      AMPM = ' PM';
    }
    
    horaF = horaF < 10 ? "0" + horaF : horaF;
    minuto = minuto < 10 ? "0" + minuto : minuto;
    segundo = segundo < 10 ? "0" + segundo : segundo;
    
    this.HORA_SERVICIO = horaF + ":" + minuto + ":" + segundo;
   
    let format12Hrs = hora + ':' + minuto + ':' + segundo + AMPM;
    
    return format12Hrs;
  }

  obtenerConfiguraciones(){
    this.configuracionService.listar().subscribe(data=> {
      this.claveConfiguracion = Number(data['Resultado'].filter(data => data['CONF_CLAVE'] =='LIM_INI_SERE')[0]['CONF_VALOR']);
      this.limiteDiasMaximo = Number(data['Resultado'][12]['CONF_VALOR']);
    }, error => {
      this.mostrarAlerta = true;
      this.tipoAlerta = 'danger';
      if (error['error']['error'] !== undefined) {
        if (error['error']['error'] === 'error_deBD') {
          this.mensaje = 'No se pudo realizar la comunicación interna para aceptar la solicitud. Por favor, intente de nuevo';
        }
      } else {
        this.mensaje = 'Hubo un error al intentar aceptar la solicitud. Por favor, intente de nuevo';
      }
      this.cerrarAlerta();
    });
  }

  updateValues(){
    this.celular.setValue(this.CLIENTE.USU_CELULAR);
    this.direccion.setValue(this.CLIENTE.USU_DIRECCION);
  }

  goToMisSolicitudes(){
    this.router.navigate(['app/cliente/mis-solicitudes']);
    // sessionStorage.setItem('validacionSuccess','1');
  }

  cerrarAlerta(){
    setTimeout(() => {
      this.mostrarAlertaGoogle=false;
      this.mostrarAlerta=false;
    }, 5000);
  }

  /*********************      MÉTODOS GET PARA EL FORMULARIO CLIENTE     ****************************** */


  get nombreCompleto() {
    return this.clienteForm.get('nombreCompleto');
  }

  get celular() {
    return this.clienteForm.get('celular');
  }

  get direccion() {
    return this.clienteForm.get('direccion');
  }

  get fecha() {
    return this.clienteForm.get('fecha');
  }

  get hora() {
    return this.clienteForm.get('hora');
  }
  
  get descripcion() {
    return this.clienteForm.get('descripcion');
  }

  get nombre_otroContacto(){
    return this.clienteForm.get('nombre_otroContacto');
  }

  get celular_otroContacto(){
    return this.clienteForm.get('celular_otroContacto');
  }
    

    /*********************      MÉTODOS GET PARA EL FORMULARIO SERVICIOS     ****************************** */


  

  get nombreServicio() {
    return this.servicioForm.get('nombreServicio');
  }

  get descripcionServicio() {
    return this.servicioForm.get('descripcionServicio');
  }

   
  /************************************  **************************/
  get remoto(){
    return this.clienteForm.controls.remoto;
  }
  get direccion_remota(){
    return this.clienteForm.get('direccion_remota');

  }
  checkServicioRemoto(){
    if(this.servicioSolicitado.SER_REMOTO==1)return;
    this.servicioRemoto = !this.servicioRemoto; // se cambia el valor de la variable a su opuesto
    this.clickeoMapa = !this.clickeoMapa;
    this.valiodoMapa = !this.valiodoMapa;
  }

}
