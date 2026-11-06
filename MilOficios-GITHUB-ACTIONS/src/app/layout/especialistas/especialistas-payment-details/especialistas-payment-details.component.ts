import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup,FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal , NgbAlert } from '@ng-bootstrap/ng-bootstrap';
import { DatosBancarios } from '../../datos-bancarios/datos-bancarios';
import { EspecialistasService } from '../especialistas.service';

@Component({
  selector: 'app-especialistas-payment-details',
  templateUrl: './especialistas-payment-details.component.html',
  styleUrls: ['./especialistas-payment-details.component.scss']
})
export class EspecialistasPaymentDetailsComponent implements OnInit {

  ESPECIALISTA_ID = 0;
  DINERO_ACUMULADO = '';
  DETALLES_DE_PAGO: DatosBancarios;
  simboloMoneda: string;
  EXISTEN_METODOS_PAGO = true;
  MENSAJE = 'No se encontraron detalles de pago';
  MENSAJE_CONFIRMACION = '';
  error: any;

  mensaje="";
  mostrarAlerta = false;;
  tipoAlerta = '';
  mostrarAlertaModal = false;;
  tipoAlertaModal = '';


  cargandoDatos: boolean;
  cargandoEliminar: boolean;

  ACTUALIZAR_DATOS_PAGO = false;
  datosPagoForm: FormGroup;

  @ViewChild('modalEliminarCuentaBancaria') elementModalConfirmarEliminar: ElementRef;

  constructor(
    public modal: NgbModal,
    private especialistasService: EspecialistasService,
    private router: Router,
    private formBuilder: FormBuilder
    ) { }

    @ViewChild('selfClosingAlert', {static: false}) selfClosingAlert: NgbAlert; 
    // referencia al las artetas que se cierran solas despues de 30 segundos.

  ngOnInit(): void {
    this.cargandoDatos = false;
    this.cargandoEliminar = false;
    this.ESPECIALISTA_ID = Number(localStorage.getItem("USE_ID"));
    this.getDetallesPago(this.ESPECIALISTA_ID);
    this.getDineroAcumulado(this.ESPECIALISTA_ID)
    this.getMoneda();

    this.datosPagoForm =  this.formBuilder.group({
      cue_ban_nombre: [{value:'' , disabled: true}],
      cue_ban_titular: [{value:'' , disabled: true}],
      cue_ban_cci: [{value:'' , disabled: true}],
      cue_ban_numero: [{value:'' , disabled: true}],
    });
  }
  
  actualizarValidaciones(){
    this.datosPagoForm.controls.cue_ban_nombre.setValidators([Validators.required, Validators.pattern('([a-zA-ZñÑáéíóúÁÉÍÓÚ\s][ ]*)+'), Validators.maxLength(50)]);
    this.datosPagoForm.controls.cue_ban_nombre.updateValueAndValidity();
    this.datosPagoForm.controls.cue_ban_titular.setValidators([Validators.required, Validators.pattern('([a-zA-ZñÑáéíóúÁÉÍÓÚ\s][ ]*)+'), Validators.maxLength(35)]);
    this.datosPagoForm.controls.cue_ban_titular.updateValueAndValidity();
    this.datosPagoForm.controls.cue_ban_cci.setValidators([Validators.required, Validators.pattern('[0-9]+'), Validators.minLength(20), Validators.maxLength(20)]);
    this.datosPagoForm.controls.cue_ban_cci.updateValueAndValidity();
    this.datosPagoForm.controls.cue_ban_numero.setValidators([Validators.required, Validators.pattern('[0-9]+'), Validators.minLength(9), Validators.maxLength(20)]);
    this.datosPagoForm.controls.cue_ban_numero.updateValueAndValidity();
  }

  getDetallesPago(id: number) {
    this.cargandoDatos = true;
    this.especialistasService.getDetallesDePago(id).subscribe(
      (detallesDePago) => {
        this.DETALLES_DE_PAGO = detallesDePago['Resultado'];
        this.cargandoDatos = false;
        this.updateValuesEspecialista();
      },
      (error) => {
        this.cargandoDatos = false;
        this.mostrarAlerta = true;
        this.tipoAlerta = 'danger';

        if (error['error']['error'] !== undefined) {
          if (error['error']['error'] === 'error_noExistenciaDeIdEsp') {
            this.mensaje = 'No se pudo obtener los detalles de pago debido a que el especialista ya no se encuentra registrado. Por favor, intente de nuevo.';
          }
          else if (error['error']['error'] === 'error_deBD') {
            this.mensaje = 'Hubo un error al intentar ejecutar su solicitud para obtener los detalles de pago. Por favor, intente de nuevo.';
          }
          else if (error['error']['error'] === 'error_deCampo') {
            this.mensaje = 'Los datos ingresados deben respetar los formatos permitidos. Por favor, intente de nuevo.';
          }
        } else {
          this.mensaje = 'Hubo un error al intentar obtener los detalles de pago. Por favor, intente de nuevo';
        }
        this.cerrarAlerta();
      }
    );
  }

  getDineroAcumulado(id: number) {
    this.especialistasService.getDineroAcumulado(id).subscribe(
      (dinero) => {
        this.DINERO_ACUMULADO = dinero['Resultado'];
      },
      (error) => {
        this.cargandoDatos = false;
        this.mostrarAlerta = true;
        this.tipoAlerta = 'danger';

        if (error['error']['error'] !== undefined) {
          if (error['error']['error'] === 'error_noExistenciaDeIdEsp') {
            this.mensaje = 'No se pudo obtener el dinero acumulado debido a que el especialista ya no se encuentra registrado. Por favor, intente de nuevo.';
          }
          else if (error['error']['error'] === 'error_deBD') {
            this.mensaje = 'Hubo un error al intentar ejecutar su solicitud para obtener el dinero acumulado. Por favor, intente de nuevo.';
          }
          else if (error['error']['error'] === 'error_deCampo') {
            this.mensaje = 'Los datos ingresados deben respetar los formatos permitidos. Por favor, intente de nuevo.';
          }
        } else {
          this.mensaje = 'Hubo un error al intentar obtener el dinero acumulado. Por favor, intente de nuevo';
        }
        this.cerrarAlerta();
      }
    );
  }

  getMoneda() {
    this.especialistasService.getMoneda(Number(localStorage.getItem("USE_ID"))).subscribe(
      (resultado) => {
        this.simboloMoneda = resultado["Resultado"][0]["MON_SIMBOLO"];
      },
      (error) => {
        this.simboloMoneda = 'S/.';
      }
    )
  }

  goToNotFound() {
    this.router.navigate(['not-found']);
  }

  guardarCuentaBancaria() {
    this.actualizarValidaciones();
    if(this.datosPagoForm.invalid){
      this.datosPagoForm.markAllAsTouched();
      this.tipoAlerta = 'danger';
      this.mostrarAlerta = true;
      this.mensaje = "Los datos ingresados deben respetar los formatos permitidos. Por favor, intente de nuevo.";
      this.cerrarAlerta();
    }else{
      this.cargandoDatos = true;
      if(this.DETALLES_DE_PAGO == null) {
        this.DETALLES_DE_PAGO = new DatosBancarios('0', '0', '0', '0');
        this.saveValuesEspecialista();
        this.insertarCuentaBancaria();
      }
      else {
        this.saveValuesEspecialista();
        this.actualizarCuentaBancaria();
      }
    }
  }
  cerrarAlerta(){
    setTimeout(() => {
      this.mostrarAlerta=false;
      this.mostrarAlertaModal=false;
      this.mensaje="";
    }, 5000);
  }

  insertarCuentaBancaria() {
    this.especialistasService.insertarCuentaBancaria(this.DETALLES_DE_PAGO, this.ESPECIALISTA_ID).subscribe(
      (resultado) => {
        this.cargandoDatos = false;
        this.mostrarAlerta = true;
        this.tipoAlerta = 'success';
        this.mensaje = "Cuenta bancaria agregada correctamente";
        this.cerrarAlerta();
        this.getDetallesPago(this.ESPECIALISTA_ID);
        this.getDineroAcumulado(this.ESPECIALISTA_ID);
        this.deshabilitarEdicion();
      },
      (error) => {
        this.cargandoDatos = false;
        this.mostrarAlerta = true;
        this.tipoAlerta = 'danger';
        
        if (error['error']['error'] !== undefined) {
          if (error['error']['error'] === 'error_noExistenciaDeCum') {
            this.mensaje = 'No existe la cuenta monetaria asociada con el especialista. Por favor, intente de nuevo.';
          } else if (error['error']['error'] === 'error_noExistenciaDeIdCum') {
            this.mensaje = 'Usted no tiene una cuenta monetaria asociada. Por favor, registre una e intente de nuevo.';
          } else if (error['error']['error'] === 'error_existenciaDeCueBan') {
            this.mensaje = 'Usted ya tiene una cuenta bancaria asociada. Por favor, elimínela e intente de nuevo.';
          } else if (error['error']['error'] === 'error_deCampo') {
            this.mensaje = 'Los datos ingresados deben respetar los formatos permitidos. Por favor, intente de nuevo.';
          }
        } else {
          this.mensaje = 'Hubo un error al intentar guardar la cuenta bancaria. Por favor, intente de nuevo';
        }
        this.cerrarAlerta();
        this.DETALLES_DE_PAGO = null;
      }
    )
  }

  actualizarCuentaBancaria() {
    this.especialistasService.actualizarCuentaBancaria(this.DETALLES_DE_PAGO).subscribe(
      (resultado) => {
        this.cargandoDatos = false;
        this.mostrarAlerta = true;
        this.tipoAlerta = 'success';
        this.mensaje = "Cuenta bancaria actualizada correctamente";
        this.cerrarAlerta();
        this.getDetallesPago(this.ESPECIALISTA_ID);
        this.getDineroAcumulado(this.ESPECIALISTA_ID);
        this.deshabilitarEdicion();
      },
      (error) => {
        this.cargandoDatos = false;
        this.mostrarAlerta = true;
        this.tipoAlerta = 'danger';
        
        if (error['error']['error'] !== undefined) {
          if (error['error']['error'] === 'error_noExistenciaDeIdCueBan') {
            this.mensaje = 'No se encontró la cuenta bancaria que desea actualizar. Por favor, intente de nuevo.';
          } else if (error['error']['error'] === 'error_deCampo') {
            this.mensaje = 'Los datos ingresados deben respetar los formatos permitidos. Por favor, intente de nuevo.';
          }
        } else {
          this.mensaje = 'Hubo un error al intentar guardar la cuenta bancaria. Por favor, intente de nuevo';
        }
        this.cerrarAlerta();
      }
    )
  }

  eliminarCuentaBancaria() {
    this.cargandoEliminar = true;
    this.saveValuesEspecialista();
    this.especialistasService.eliminarCuentaBancaria(this.DETALLES_DE_PAGO.CUE_BAN_ID).subscribe(
      (resultado) => {
        this.cargandoEliminar = false;
        this.mostrarAlertaModal = true;
        this.tipoAlertaModal = 'success';
        this.mensaje = "Cuenta bancaria eliminada correctamente";
        this.cerrarAlerta();
        this.getDetallesPago(this.ESPECIALISTA_ID);
        this.getDineroAcumulado(this.ESPECIALISTA_ID);
        this.deshabilitarEdicion();
        this.clearValuesEspecialista();
        this.DETALLES_DE_PAGO = null;
        this.modal.dismissAll();
        this.datosPagoForm.reset();
      },
      (error) => {
        this.cargandoEliminar = false;
        this.mostrarAlertaModal = true;
        this.tipoAlertaModal = 'danger';

        if (error['error']['error'] !== undefined) {
          if (error['error']['error'] === 'error_noExistenciaDeIdCueBan') {
            this.mensaje = 'No se encontró la cuenta bancaria que desea eliminar. Por favor, intente de nuevo.';
          } else if (error['error']['error'] === 'error_deCampo') {
            this.mensaje = 'Los datos ingresados deben respetar los formatos permitidos. Por favor, intente de nuevo.';
          }
        } else {
          this.mensaje = 'Hubo un error al intentar eliminar la cuenta bancaria. Por favor, intente de nuevo';
        }
        this.cerrarAlerta();
      }
    );
  }

  confirmarEliminar() {
    this.modal.open(this.elementModalConfirmarEliminar);
  }

  habilitarDeshabilitarEdicion() {
    if(this.ACTUALIZAR_DATOS_PAGO) {
      this.cue_ban_nombre.enable();
      this.cue_ban_titular.enable();
      this.cue_ban_cci.enable();
      this.cue_ban_numero.enable();
    }
    else {
      this.cue_ban_nombre.disable();
      this.cue_ban_titular.disable();
      this.cue_ban_cci.disable();
      this.cue_ban_numero.disable();
    }
  }

  deshabilitarEdicion() {
    this.ACTUALIZAR_DATOS_PAGO = false;
    this.cue_ban_nombre.disable();
    this.cue_ban_titular.disable();
    this.cue_ban_cci.disable();
    this.cue_ban_numero.disable();
  }

  get cue_ban_nombre() {
    return this.datosPagoForm.get('cue_ban_nombre');
  }

  get cue_ban_titular() {
    return this.datosPagoForm.get('cue_ban_titular');
  }

  get cue_ban_cci() {
    return this.datosPagoForm.get('cue_ban_cci');
  }

  get cue_ban_numero() {
    return this.datosPagoForm.get('cue_ban_numero');
  }

  updateValuesEspecialista() {
    if(this.DETALLES_DE_PAGO != null) {
      this.cue_ban_nombre.setValue(this.DETALLES_DE_PAGO.CUE_BAN_NOMBRE);
      this.cue_ban_titular.setValue(this.DETALLES_DE_PAGO.CUE_BAN_TITULAR);
      this.cue_ban_cci.setValue(this.DETALLES_DE_PAGO.CUE_BAN_CCI);
      this.cue_ban_numero.setValue(this.DETALLES_DE_PAGO.CUE_BAN_NUMERO);
    }
  }

  saveValuesEspecialista() {
    this.DETALLES_DE_PAGO.CUE_BAN_NOMBRE = this.cue_ban_nombre.value;
    this.DETALLES_DE_PAGO.CUE_BAN_TITULAR = this.cue_ban_titular.value;
    this.DETALLES_DE_PAGO.CUE_BAN_CCI = this.cue_ban_cci.value;
    this.DETALLES_DE_PAGO.CUE_BAN_NUMERO = this.cue_ban_numero.value;
  }

  clearValuesEspecialista() {
    this.cue_ban_nombre.setValue('');
    this.cue_ban_titular.setValue('');
    this.cue_ban_cci.setValue('');
    this.cue_ban_numero.setValue('');
  }
}
