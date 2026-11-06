import { Component, OnInit,ViewChild,ElementRef  } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';


import {TarjetaService} from '../../tarjetas/tarjeta.service';
import {Tarjeta} from '../../tarjetas/tarjeta.model';
import {TipoTarjetaService} from '../../tipo-tarjeta/tipo-tarjeta.service';
import {TipoTarjeta} from '../../tipo-tarjeta/tipo-tarjeta';
import * as moment from 'moment';


import { StorageService } from '../../../helpers/storage.service';
import {ClienteService} from '../cliente.service';

import {NgbAlert} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-cliente-payment',
  templateUrl: './cliente-payment.component.html',
  styleUrls: ['./cliente-payment.component.scss']
})
export class ClientePaymentComponent implements OnInit {

  @ViewChild('modalTarjeta') elementModalTarjeta: ElementRef;
  @ViewChild('modalEliminar') elementModalTarjetaEliminar: ElementRef;
  @ViewChild('modalActualizar') elementModalTarjetaActualizar: ElementRef;
  
  // referencia al las artetas que se cierran solas despues de 30 segundos. 

  TIPOS_TARJETAS = [
    {'id': 1, 'nombre': "Visa"},
    {'id': 2, 'nombre': "MasterCard"},
    {'id': 3, 'nombre': "Amex"},
    {'id': 4, 'nombre': "Diners"}
  ];
  

  MESES = [
    {"valor": "01", "mes": "Enero"},
    {"valor": "02", "mes": "Febrero"},
    {"valor": "03", "mes": "Marzo"},
    {"valor": "04", "mes": "Abril"},
    {"valor": "05", "mes": "Mayo"},
    {"valor": "06", "mes": "Junio"},
    {"valor": "07", "mes": "Julio"},
    {"valor": "08", "mes": "Agosto"},
    {"valor": "09", "mes": "Septiembre"},
    {"valor": "10", "mes": "Octubre"},
    {"valor": "11", "mes": "Noviembre"},
    {"valor": "12", "mes": "Diciembre"}
  ];



  tarjetaForm: FormGroup;
  tarjeta: Tarjeta = new Tarjeta();
  tarjetas: Tarjeta [];
  tiposTarjetas: TipoTarjeta [];
  tipoTarjetaModel: TipoTarjeta  = new TipoTarjeta();


  mostrarAlertaModal:boolean = false;
  tipoAlerta:string = null;
  mensajeModal:string = null;
  mostrarAlerta:boolean = false;
  mensaje:string = null;


  cargandoEnvioCulqi = false;
  cargando = false;

  MENSAJE = 'No se encontraron detalles de pago';
  EXISTEN_METODOS_PAGO = true;

  
  ISACTUALIZAR:boolean = false;

  TAR_ID_ELIMINAR:number;
  cargandoModal:boolean = false;
  correoNoEdit: boolean = true;
  CORREO_USU: string;
  idTarjeta: number;
  anios: number[] = [];


  constructor(
    private formBuilder: FormBuilder,
    private modal: NgbModal,
    private tarjetaService : TarjetaService,
    private tipoTarjeta: TipoTarjetaService,
    private localStorageService: StorageService,
    private clienteService:ClienteService
  ) { }

  ngOnInit(): void {
    this.clienteService.updateHeaders();
    this.inicializarTarjetaForm();
    this.listarTarjetas();
    
  }

  inspeccionadorElementoCorreo(correoValue){
    if(correoValue == this.CORREO_USU){
      this.correoNoEdit =true;
    } else{
      this.correoNoEdit =false;
    }
  
  }


  listarTarjetas(){
    this.cargando = true;
    this.tarjetaService.listarTarjetas(Number(this.localStorageService.getString("USE_ID"))).subscribe( data => {
      this.tarjetas =  data["Resultado"];
      if (this.tarjetas.length <= 0) {
        this.EXISTEN_METODOS_PAGO = false;
        this.obtenerCorreoCliente();
      } else {
        this.EXISTEN_METODOS_PAGO = true;
        this.CORREO_USU = this.tarjetas["0"]['USU_EMAIL'];
      }
      if(this.tarjetas.length > 3 ){
        this.mostrarAlertaModal = true;
        this.mensajeModal = "Usted no puede ingresar más tarjetas.";
      } else{
        this.mostrarAlertaModal = false;
      }
      this.cargando = false;
    }, error => {
      this.mostrarAlerta = true;
      this.tipoAlerta = 'danger';
      if (error['error']['error'] !== undefined) {
        if (error['error']['error'] === 'error_deCampo') {
          this.mensaje = 'Los valores enviados deben respetar los formatos permitidos. Por favor, intente de nuevo.';
        }
        else if (error['error']['error'] === 'error_deBD') {
          this.mensaje = 'Hubo un error al intentar ejecutar su solicitud para obtener los datos de las tarjetas. Por favor, intente de nuevo.';
        } else if (error['error']['error'] === 'error_noExistenciaDeIdCli') {
          this.mensaje = 'No existe datos con el cliente solicitado. Por favor, intente con otro dato.';
        }
      } 
      else {
          this.mensaje = 'Hubo un error al intentar listar los datos de las tarjetas. Por favor, intente de nuevo.';
      }
    });
  }

  obtenerCorreoCliente(){
    this.cargando = true;
    this.clienteService.obtenerCliente(Number(localStorage.getItem("USE_ID"))).subscribe(
      (CLIENTE) => {
        this.CORREO_USU = CLIENTE["Resultado"][0].USU_EMAIL;
      },
      (error) => {
        this.cargando = false;
        this.mostrarAlerta = true;
        this.tipoAlerta = 'danger';
        if (error['error']['error'] !== undefined) {
          if (error['error']['error'] === 'error_noExistenciaDeIdCli') {
            this.mensaje = 'No se pudo obtener los datos de usuario del cliente debido a que ya no se encuentra registrado. Por favor, intente de nuevo.';
          }
          else if (error['error']['error'] === 'error_deBD') {
            this.mensaje = 'Hubo un error al intentar ejecutar su solicitud para obtener los datos de usuario del especialista. Por favor, intente de nuevo.';
          }
          else if (error['error']['error'] === 'error_deCampo') {
            this.mensaje = 'Los datos ingresados deben respetar los formatos permitidos. Por favor, intente de nuevo.';
          }
        } 
        else  {
          this.mensaje = 'Hubo un error al intentar obtener los datos de usuario. Por favor, intente de nuevo';
        }
      });
  }

  inicializarTarjetaForm(){

    let anio = this.generarAnios();

    this.tarjetaForm = this.formBuilder.group({
      nameTitular:[''],
      cardNumber:[''],
      cvv:[''],
      mesExpiracion:[''],
      anioExpiracion: [anio],
      correo: [''],
      TIP_TAR_ID:[0]
    });

  }
  
  verificarTarjeta(){
    this.validarCampos();
    if(this.tarjetaForm.invalid){
      this.tarjetaForm.markAllAsTouched();
      return;
    }
    
    this.guardarDatos();
    this.cargandoEnvioCulqi = true;
    this.tarjetaService.verificacionTarjeta(this.tarjeta ).subscribe( data=> {
      this.cargandoEnvioCulqi = false;
      this.TIPOS_TARJETAS.forEach( tipo => {
        if(tipo.nombre == data['iin']['card_brand']){
          this.idTarjeta = tipo.id;
          this.tarjeta.TIP_TAR_ID = tipo.id.toString();
        }
      });
      this.cerrarAlerta();
      if(this.ISACTUALIZAR == false){
        this.insertarTarjetas();
      } else{
        this.ISACTUALIZAR =  false;
        this.actualizar();
      }
    }, error => {
      this.cargandoEnvioCulqi = false;
      this.mostrarAlertaModal = true;
      this.tipoAlerta = 'warning';
      this.mensajeModal = error.error.user_message;

      if(error['error']['object'] != undefined) {
        if(error['error']['type'] == 'parameter_error'){
          if (error['error']['code'] === 'invalid_expiration_year') {
            this.mensajeModal = error['error']['user_message'];
          } else if (error['error']['code'] === 'invalid_expiration_month') {
            this.mensajeModal = error['error']['user_message'];
          } else if (error['error']['code'] === 'invalid_cvv') {
            this.mensajeModal = error['error']['user_message'];
          } else if (error['error']['code'] === 'invalid_number') {
            this.mensajeModal = error['error']['user_message'];
          } else {
            this.mensajeModal = 'Datos no válidos. Por favor, intentelo nuevamente.';
          }
        }
         else if (error['error']['type'] == 'card_error'){ 
          this.mensajeModal = '¡Uh! Tu tarjeta fue rechazada. Estás utilizando una tarjeta real para procesar pagos de prueba.';
        } else if (error['error']['type'] == 'authentication_error'){
          this.mensajeModal = 'La petición no pudo ser procesada, debido a la key. Actualice e intentalo más tarde.';
        } else if (error['error']['type'] == 'api_error'){
          this.mensajeModal = 'Hubo un error temporal con los servidores. Por favor, intentelo más tarde.';
        } else if (error['error']['type'] == 'limit_api_error'){
          this.mensajeModal = 'Estás haciendo muchas peticiones rápidamente, intentelo más tarde.';
        } else if (error['error']['type'] == 'resource_error'){
          this.mensajeModal = 'El recurso no fue encontrado, es inválido o tiene un estado diferente al permitido.';
        } else if (error['error']['decline_code'] == 'expired_card'){
          this.mensajeModal = 'Tarjeta vencida. La tarjeta está vencida o la fecha de vencimiento ingresada es incorrecta.';
        } else if (error['error']['decline_code'] == 'stolen_card'){
          this.mensajeModal = 'Tarjeta robada. La tarjeta fue bloqueada y reportada al banco emisor como una tarjeta robada.';
        } else if (error['error']['decline_code'] == 'lost_card'){
          this.mensajeModal = 'Tarjeta perdida. La tarjeta fue bloqueada y reportada al banco emisor como una tarjeta perdida.';
        } else if (error['error']['decline_code'] == 'incorrect_cvv' || error['error']['decline_code'] == 'invalid_cvv' ){
          this.mensajeModal = 'CVV incorrecto.El código de seguridad de la tarjeta es incorrecta.';
        } else if (error['error']['decline_code'] == 'too_many_attempts_cvv'  ){
          this.mensajeModal = 'Exceso CVV. Ha intentado demasiadas veces ingresar el código de seguridad de la tarjeta.';
        }
      } else{ 
        this.mensajeModal = 'Hubo un error en la conexión. Por favor, intente de nuevo.'
      }
      
    } );
  }

  guardarDatos(){
    this.tarjeta.TAR_NUMERO = this.cardNumber.value;
    this.tarjeta.TAR_CVV = this.cvv.value;
    this.tarjeta.TAR_ANIO = this.anioExpiracion.value;
    this.tarjeta.TAR_MES = this.mesExpiracion.value;
    this.tarjeta.TAR_CORREO = this.correo.value;
    this.tarjeta.TAR_TITULAR = this.nameTitular.value;

  }

  //Esta función genera los años desde el actual hasta 5 años mayores
  generarAnios(): number {
    let currentYear = parseInt(moment(new Date()).format('YYYY'));

    
    for(let i=0;i<5;i++){
      this.anios[i] = currentYear+i;
    }
    
    return this.anios[0];
  }


  insertarTarjetas(){
    this.tarjetaService.insertarTarjeta(this.tarjeta, Number(this.localStorageService.getString("USE_ID")) ,Number(this.tarjeta.TIP_TAR_ID) ).subscribe( data => {
      this.modal.dismissAll();
      this.mostrarAlerta = true;
      this.tipoAlerta = 'success';
      this.mensaje = 'Tarjeta de crédito agregada exitosamente.';
      this.cerrarAlerta();
      this.listarTarjetas();
    }, error => {
      this.cargando = false;
      this.mostrarAlerta = true;
      this.tipoAlerta = 'warning';
      if (error['error']['error'] !== undefined) {
        if (error['error']['error'] === 'error_deCampo') {
          this.mensaje = 'Los valores enviados deben respetar los formatos permitidos. Por favor, intente de nuevo.';
        }
        else if (error['error']['error'] === 'error_deBD') {
          this.mensaje = 'Hubo un error al intentar ejecutar su solicitud. Por favor, intente de nuevo.';
        } else if (error['error']['error'] === 'error_noExistenciaDeIdCli') {
          this.mensaje = 'No existe datos con el cliente solicitado. Por favor, intente con otro dato.';
        }
      } 
      else {
          this.mensaje = 'Hubo un error al intentar registrar los datos. Por favor, intente de nuevo.';
      }
    });
  }


  abrirModalTarjeta(){
    this.resetear();
    this.tarjetaForm.reset();
    if(this.tarjetas.length>=3) {
      this.mostrarAlertaModal = true
      this.mensajeModal = "Usted no puede ingresar más tarjetas.";
    };
    this.mostrarAlertaModal = false;
    this.ISACTUALIZAR = false;
    this.modal.open(this.elementModalTarjeta);
    this.correo.setValue(this.CORREO_USU  );
  }


  abrirModalActualizarTarjeta(TARJETA){
    this.mostrarAlertaModal = false;
    this.mostrarAlertaModal = false;
    this.ISACTUALIZAR = true;
    this.tarjeta.TAR_ID = TARJETA.TAR_ID;
    this.tarjetaForm = this.formBuilder.group({
      nameTitular:[''],
      cardNumber:[''],
      cvv:[''],
      mesExpiracion:[TARJETA.TAR_MES],
      anioExpiracion: [ TARJETA.TAR_ANIO],
      correo: [this.CORREO_USU ],
      TIP_TAR_ID: [TARJETA.TIP_TAR_ID ]
    });
    
    this.modal.open(this.elementModalTarjeta);
  }


  abrirModalEliminarTarjeta(tarjeta){
    this.mostrarAlertaModal=false;
    this.TAR_ID_ELIMINAR = tarjeta.TAR_ID;
    this.modal.open(this.elementModalTarjetaEliminar );
  }


  cerrarModal(){
    this.modal.dismissAll();
  }


  eliminar(){
    this.cargandoModal = true;
    this.tarjetaService.eliminarTarjeta(Number(localStorage.getItem("USE_ID")), this.TAR_ID_ELIMINAR).subscribe( data => {
      this.modal.dismissAll();
      this.cargandoModal = false;
      this.listarTarjetas();
      this.mostrarAlerta = true;
      this.tipoAlerta = 'success';
      this.mensaje = 'Se ha eliminado la tarjeta de manera exitosa.';
      this.cerrarAlerta();
    }, error => {
      this.cargandoModal = false;
      this.mostrarAlertaModal = true;
      this.tipoAlerta = 'warning';
      if (error['error']['error'] !== undefined) {
        if (error['error']['error'] === 'error_noExistenciaDeIdCli') {
          this.mensajeModal = 'El cliente enviado no existe. Por favor, intente con otro.';
        } else if (error['error']['error'] === 'error_noExistenciaDeIdTarj') {
          this.mensajeModal = 'La tarjeta enviada no existe. Por favor, intente con otro.';
        } else if (error['error']['error'] === 'error_deBD') {
          this.mensajeModal = 'Hubo un error al intentar ejecutar su solicitud. Por favor, intente de nuevo.';
        }
        else if (error['error']['error'] === 'error_deCampo') {
          this.mensajeModal = 'Los datos ingresados deben respetar los formatos permitidos. Por favor, intente de nuevo.';
        }
      } 
      else  {
        this.mensajeModal = 'Hubo un error al intentar realizar su solicitud. Por favor, intente de nuevo';
      }
    });
  }


  actualizar(){
    this.cargandoModal = true;
    this.tarjetaService.actualizarTarjeta(this.tarjeta, Number(localStorage.getItem("USE_ID"))).subscribe(data => {
      this.cargandoModal = false;
      this.modal.dismissAll();
      this.mostrarAlerta = true;
      this.tipoAlerta = 'success';
      this.mensaje = 'Tarjeta de crédito actualizada exitosamente.';
      this.listarTarjetas();
      this.cerrarAlerta();
    }, error=> {
      this.cargandoModal = false;
      this.mostrarAlerta = true;
      this.tipoAlerta = 'danger';
      if (error['error']['error'] !== undefined) {
        if (error['error']['error'] === 'error_noExistenciaDeIdCli') {
          this.mensaje = 'El cliente enviado no existe. Por favor, intente con otro.';
        }
        else if (error['error']['error'] === 'error_deBD') {
          this.mensaje = 'Hubo un error al intentar ejecutar su solicitud. Por favor, intente de nuevo.';
        }
        else if (error['error']['error'] === 'error_deCampo') {
          this.mensaje = 'Los datos ingresados deben respetar los formatos permitidos. Por favor, intente de nuevo.';
        }
      } else  {
        this.mensaje = 'Hubo un error al intentar ejecutar su solicitud. Por favor, intente de nuevo';
      }
      });
  }

  cerrarAlerta(){
    setTimeout(() => {
      this.mostrarAlerta=false;
      this.mostrarAlertaModal=false;
    }, 5000);
  }

  resetear(){
    this.nameTitular.setValue(null);
    this.cardNumber.setValue(null);
    this.cvv.setValue(null);
    this.mesExpiracion.setValue(null);
    this.anioExpiracion.setValue(null);
  }



  get nameTitular() {
    return this.tarjetaForm.get('nameTitular');
  }


  get cardNumber() {
    return this.tarjetaForm.get('cardNumber');
  }


  get cvv() {
    return this.tarjetaForm.get('cvv');
  }


  get mesExpiracion() {
    return this.tarjetaForm.get('mesExpiracion');
  }


  get anioExpiracion() {
    return this.tarjetaForm.get('anioExpiracion');
  }


  get correo() {
    return this.tarjetaForm.get('correo');
  }


  validarCampos(){
    const emailFormat = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    this.tarjetaForm.controls.nameTitular.setValidators([Validators.required, Validators.pattern('^[a-zñáéíóú A-ZÑÁÉÍÓÚ]+$'), Validators.maxLength(100)]);
    this.tarjetaForm.controls.nameTitular.updateValueAndValidity();
    this.tarjetaForm.controls.cardNumber.setValidators([Validators.required,Validators.pattern('[0-9]+'), Validators.minLength(13), Validators.maxLength(16)]);
    this.tarjetaForm.controls.cardNumber.updateValueAndValidity();

    this.tarjetaForm.controls.cvv.setValidators([Validators.required,Validators.pattern('[0-9]+'),Validators.minLength(3), Validators.maxLength(4)]);
    this.tarjetaForm.controls.cvv.updateValueAndValidity();

    this.tarjetaForm.controls.mesExpiracion.setValidators([Validators.required, Validators.maxLength(2)]);
    this.tarjetaForm.controls.mesExpiracion.updateValueAndValidity();

    this.tarjetaForm.controls.anioExpiracion.setValidators([Validators.required,Validators.pattern('[0-9]+'),Validators.minLength(4), Validators.maxLength(4)]);
    this.tarjetaForm.controls.anioExpiracion.updateValueAndValidity();

    this.tarjetaForm.controls.correo.setValidators([Validators.required, Validators.pattern(emailFormat),Validators.minLength(5), Validators.maxLength(50), Validators.email]);
    this.tarjetaForm.controls.correo.updateValueAndValidity();
  }

}
