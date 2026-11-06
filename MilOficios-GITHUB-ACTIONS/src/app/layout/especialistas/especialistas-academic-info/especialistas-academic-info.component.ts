import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Estudio } from '../../estudios/estudio.model';
import { EstudiosService } from '../../estudios/estudios.service';
import { NgbAlert, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-especialistas-academic-info',
  templateUrl: './especialistas-academic-info.component.html',
  styleUrls: ['./especialistas-academic-info.component.scss']
})
export class EspecialistasAcademicInfoComponent implements OnInit {

  isCollapsed: boolean[];
  ESPECIALISTA_ID = 0;
  ESTUDIOS: Estudio[];
  nuevoEstudio: Estudio = new Estudio();

  MENSAJE_CONFIRMACION: string;
  TITULO_CONFIRMACION: string;
  @ViewChild('selfClosingAlert', {static: false}) selfClosingAlert: NgbAlert; 

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;

  // Users list is loading
  cargandoDatos: boolean;
  cargandoGuardar: boolean;
  cargandoActualizar: boolean;

  estudiosForm: any;
  estudiosUpdateForm: any;

  mensaje: any;
  error: any;
  success: any;

  mensajes:string = "";
  mostrarAlerta = false;
  tipoAlerta = '';

  // errorActualizar = ['fewfwefwe','aaaaaa','fewfwefwe','aaaaaa'];

   //variables excepcionales para el checkbox para las fechas de fin en estudio
   deshabilitarFechaFinEstudio = false;
   isCheckEstudio = false;// el checkbox de "en curso" para las fechas de fin estará true por defecto
   isCheckEstudioActualizar = false;// checkbox para la actualizar el estudio

  constructor(
    private router: Router,
    private estudiosService: EstudiosService,
    private datePipe: DatePipe,
    public modal: NgbModal,
    private formBuilder: FormBuilder
    ) { }

  ngOnInit(): void {
    this.cargandoDatos = false;
    this.cargandoGuardar = false;
    this.cargandoActualizar = false;
    this.ESPECIALISTA_ID = Number(localStorage.getItem("USE_ID"));
    this.getEstudios();
    this.estudiosForm =  this.formBuilder.group({
      est_tipo: [''],
      est_institucion: [''],
      est_fech_ini: [''],
      est_fech_fin: [''],
      est_descripcion: [''],
    });
    this.estudiosUpdateForm =  this.formBuilder.group({
      est_tipo_update: ['', [Validators.required, Validators.pattern('([a-zA-ZñÑáéíóúÁÉÍÓÚ\s][ ]*)+'), Validators.maxLength(20)]],
      est_institucion_update: ['', [Validators.required, Validators.maxLength(20)]],
      est_fech_ini_update: ['', Validators.required],
      est_fech_fin_update: ['', Validators.required],
      est_descripcion_update: ['', [Validators.required , Validators.maxLength(60)]],
    });
  }

  //función que determinará el comportamiendo del input de la fecha final de estudio cuando se selecciona el checkbox
  procesoDatosCheckEstudio(){
    this.isCheckEstudio = !this.isCheckEstudio;//se cambia el valor de la variable a su opuesto
    //si el checkbox esta seleccionado se inhabilitado sino se habilita el input de la fecha de fin
    if(this.isCheckEstudio)
      this.estudiosForm.controls.est_fech_fin.disable();
    else
      this.estudiosForm.controls.est_fech_fin.enable(); 

    if(this.isCheckEstudio)
      this.est_fech_fin.setValue('');
  }

  //función que determinará el comportamiendo del input de la fecha final de estudio cuando se selecciona el checkbox
  procesoDatosCheckEstudioUpdate(){
    this.isCheckEstudioActualizar = !this.isCheckEstudioActualizar;//se cambia el valor de la variable a su opuesto
    //si el checkbox esta seleccionado se inhabilitado sino se habilita el input de la fecha de fin

    if(this.isCheckEstudioActualizar){
      this.estudiosUpdateForm.controls.est_fech_fin_update.disable();
    }
    else{
      this.estudiosUpdateForm.controls.est_fech_fin_update.enable();
      this.est_fech_fin_update.setValue('');
    }

    if(this.isCheckEstudioActualizar)
      this.est_fech_fin_update.setValue('');
  }

  getEstudios() {
    this.cargandoDatos = true;
    this.estudiosService.getEstudiosEspecialista(this.ESPECIALISTA_ID).subscribe(
      (estudios) => {
        this.ESTUDIOS = estudios['Resultado'];
        this.convertDate();
        this.setCollapsedAll();
        this.setDisabled();
        this.cargandoDatos = false;
      }, (error) => {
        this.cargandoDatos = false;
        this.mostrarAlerta = true;
        this.tipoAlerta = 'danger';
        if (error['error']['error'] !== undefined) {
          if (error['error']['error'] === 'error_noExistenciaDeIdEsp') {
            this.mensajes = 'No se pudo obtener los estudios debido a que el especialista ya no se encuentra registrado. Por favor, intente de nuevo.';
          }
          else if (error['error']['error'] === 'error_deBD') {
            this.mensajes = 'Hubo un error al intentar ejecutar su solicitud para obtener los estudios del especialista. Por favor, intente de nuevo.';
          }
          else if (error['error']['error'] === 'error_deCampo') {
            this.mensajes = 'Los datos ingresados deben respetar los formatos permitidos. Por favor, intente de nuevo.';
          }
        } else {
          this.mensajes = 'Hubo un error al intentar obtener la información académica. Por favor, intente de nuevo';
        }
        this.cerrarAlerta();
    });
  }

  agregarEstudio() {
    this.actualizarValidaciones();
    if (this.estudiosForm.invalid) {
      this.estudiosForm.markAllAsTouched();
      return;
    }
    this.saveValuesEstudio();
    if (this.verificarFechasCrear()) {
      this.cargandoDatos = true;
      this.estudiosService.insertEstudios(this.nuevoEstudio, this.ESPECIALISTA_ID).subscribe(
        (mensaje) => {
          this.mostrarAlerta = true;
          this.tipoAlerta = 'success';
          this.mensajes = 'Estudios guardados correctamente';
          this.nuevoEstudio = new Estudio();
          this.estudiosForm.reset();
          this.cerrarAlerta();
          this.getEstudios();
          this.cargandoDatos = false;
          this.isCheckEstudio = false;
          this.estudiosForm.controls.est_fech_fin.enable(); 
        },
        (error) => {
          this.cargandoDatos = false;
          this.mostrarAlerta = true;
          this.tipoAlerta = 'danger';
          if (error['error']['error'] !== undefined) {
            if (error['error']['error'] === 'error_noExistenciaDeIdEsp') {
              this.mensajes = 'No se pudo guardar la información académica debido a que el especialista ya no se encuentra registrado. Por favor, intente de nuevo.';
            }
            else if (error['error']['error'] === 'error_deBD') {
              this.mensajes = 'Hubo un error al intentar ejecutar su solicitud para guardar la información académica. Por favor, intente de nuevo.';
            }
            else if (error['error']['error'] === 'error_deCampo') {
              this.mensajes = 'Los datos ingresados deben respetar los formatos permitidos. Por favor, intente de nuevo.';
            }
          } else {
            this.mensajes = 'Hubo un error al intentar guardar la información académica. Por favor, intente de nuevo';
          }
          this.cerrarAlerta();
      });
    }
  }

  actualizarValidaciones(){
    this.estudiosForm.controls.est_tipo.setValidators([Validators.required, Validators.pattern('([a-zA-ZñÑáéíóúÁÉÍÓÚ\s][ ]*)+'), Validators.maxLength(20)]);
    this.estudiosForm.controls.est_tipo.updateValueAndValidity();
    this.estudiosForm.controls.est_institucion.setValidators([Validators.required, Validators.maxLength(20)]);
    this.estudiosForm.controls.est_institucion.updateValueAndValidity();
    this.estudiosForm.controls.est_fech_ini.setValidators(Validators.required);
    this.estudiosForm.controls.est_fech_ini.updateValueAndValidity();
    this.estudiosForm.controls.est_fech_fin.setValidators(Validators.required);
    this.estudiosForm.controls.est_fech_fin.updateValueAndValidity();
    this.estudiosForm.controls.est_descripcion.setValidators([Validators.required , Validators.maxLength(60)]);
    this.estudiosForm.controls.est_descripcion.updateValueAndValidity();
  }

  actualizarEstudio(estudio: Estudio) {
    if (this.estudiosUpdateForm.invalid) {
      this.mostrarAlerta = true;
      this.tipoAlerta = 'danger';
      this.mensajes = 'Es necesario llenar todos los campos';
      this.estudiosUpdateForm.markAllAsTouched();
      this.cerrarAlerta();
      return;
    }

    this.saveValuesEstudioUpdate(estudio);
    if (this.verificarFechasActualizar(estudio)) {
      this.cargandoActualizar = true;
      if(estudio.EST_FECH_FIN === null) estudio.EST_FECH_FIN="";
      
      this.estudiosService.updateEstudios(estudio).subscribe(
        (mensaje) => {
          this.mostrarAlerta = true;
          this.tipoAlerta = 'success';
          this.mensajes = 'Estudios actualizados correctamente';
          this.getEstudios();
          this.cargandoActualizar = false;
          this.cerrarAlerta();
        },
        (error) => {
          this.cargandoActualizar = false;
          this.cargandoDatos = false;
          this.mostrarAlerta = true;
          this.tipoAlerta = 'danger';
          if (error['error']['error'] !== undefined) {
            if (error['error']['error'] === 'error_noExistenciaDeIdEst') {
              this.mensajes = 'No se pudo guardar la información académica debido a que no se encuentra registrada. Por favor, intente de nuevo.';
            }
            else if (error['error']['error'] === 'error_deBD') {
              this.mensajes = 'Hubo un error al intentar ejecutar su solicitud actualizar la información académica. Por favor, intente de nuevo.';
            }
            else if (error['error']['error'] === 'error_deCampo') {
              this.mensajes = 'Los datos ingresados deben respetar los formatos permitidos. Por favor, intente de nuevo.';
            }
          } else {
            this.mensajes = 'Hubo un error al intentar actualizar la información académica. Por favor, intente de nuevo';
          }
          this.cerrarAlerta();
      });
    }
  }

  goToNotFound() {
    this.router.navigate(['not-found']);
  }

  setCollapsed(estudio: Estudio) {    // Funcion para hacer que todos los deplegables estén colapsados, excepto el seleccionado. Se ejecuta al hacer clic en un deplegable
    for (let index = 0; index < this.ESTUDIOS.length; index++) {
      if(this.ESTUDIOS[index] != estudio) {
        this.ESTUDIOS[index]['IS_COLLAPSED'] = true;
      }
      else {
        estudio['IS_COLLAPSED'] = !estudio['IS_COLLAPSED'];
      }
    }
  }

  setCollapsedAll() {     // Funcion para hacer que todos los deplegables estén colapsados. Solo se ejecuta al iniciar
    for (let index = 0; index < this.ESTUDIOS.length; index++) {
      this.ESTUDIOS[index]['IS_COLLAPSED'] = true;
    }
  }

  setDisabled() {
    for (let index = 0; index < this.ESTUDIOS.length; index++) {
      this.ESTUDIOS[index]['IS_NOT_EDITABLE'] = true;
    }
  }

  convertDate() {
    for (let index = 0; index < this.ESTUDIOS.length; index++) {
      this.ESTUDIOS[index].EST_FECH_INI = this.datePipe.transform(this.ESTUDIOS[index].EST_FECH_INI, 'yyyy-MM-dd');
      this.ESTUDIOS[index].EST_FECH_FIN = this.datePipe.transform(this.ESTUDIOS[index].EST_FECH_FIN, 'yyyy-MM-dd');
    }
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

  get est_tipo_update() {
    return this.estudiosUpdateForm.get('est_tipo_update');
  }

  get est_institucion_update() {
    return this.estudiosUpdateForm.get('est_institucion_update');
  }

  get est_fech_ini_update() {
    return this.estudiosUpdateForm.get('est_fech_ini_update');
  }

  get est_fech_fin_update() {
    return this.estudiosUpdateForm.get('est_fech_fin_update');
  }

  get est_descripcion_update() {
    return this.estudiosUpdateForm.get('est_descripcion_update');
  }

  updateValuesEstudio() {
    this.est_tipo.setValue(this.nuevoEstudio.EST_TIPO);
    this.est_institucion.setValue(this.nuevoEstudio.EST_INSTITUCION);
    this.est_fech_ini.setValue(this.nuevoEstudio.EST_FECH_INI);
    this.est_fech_fin.setValue(this.nuevoEstudio.EST_FECH_FIN);
    this.est_descripcion.setValue(this.nuevoEstudio.EST_DESCRIPCION);
  }

  saveValuesEstudio() {
    this.nuevoEstudio.EST_TIPO = this.est_tipo.value;
    this.nuevoEstudio.EST_INSTITUCION = this.est_institucion.value;
    this.nuevoEstudio.EST_FECH_INI = this.est_fech_ini.value;
    this.nuevoEstudio.EST_FECH_FIN = this.est_fech_fin.value;
    this.nuevoEstudio.EST_DESCRIPCION = this.est_descripcion.value;
  }

  updateValuesEstudioUpdate(estudio: Estudio) {
    this.est_tipo_update.setValue(estudio.EST_TIPO);
    this.est_institucion_update.setValue(estudio.EST_INSTITUCION);
    this.est_fech_ini_update.setValue(estudio.EST_FECH_INI);
    this.est_fech_fin_update.setValue(estudio.EST_FECH_FIN);
    this.est_descripcion_update.setValue(estudio.EST_DESCRIPCION);
    if(this.est_fech_fin_update.value == null){
      this.isCheckEstudioActualizar = true;
      this.estudiosUpdateForm.controls.est_fech_fin_update.disable();
    }else{
      this.isCheckEstudioActualizar = false;
      this.estudiosUpdateForm.controls.est_fech_fin_update.enable();
    }
  }

  saveValuesEstudioUpdate(estudio: Estudio) {
    estudio.EST_TIPO = this.est_tipo_update.value;
    estudio.EST_INSTITUCION = this.est_institucion_update.value;
    estudio.EST_FECH_INI = this.est_fech_ini_update.value;
    estudio.EST_FECH_FIN = this.est_fech_fin_update.value;
    estudio.EST_DESCRIPCION = this.est_descripcion_update.value;
  }

  verificarFechasCrear() {
    const fechaActual = new Date();
    const fechaFin = this.isCheckEstudio ? this.datePipe.transform(fechaActual.toDateString(), 'yyyy-MM-dd') :  this.nuevoEstudio.EST_FECH_FIN;

    if (this.nuevoEstudio.EST_FECH_INI > fechaFin) {
      this.mostrarAlerta=true;
      this.tipoAlerta='danger';          
      this.mensajes = 'La fecha de inicio no puede ser mayor a la fecha de finalización';
      this.cerrarAlerta();
      
      return false;
    }
    if (this.nuevoEstudio.EST_FECH_FIN >= this.datePipe.transform(fechaActual.toDateString(), 'yyyy-MM-dd')) {
      this.mostrarAlerta=true;
      this.tipoAlerta='danger';
      this.mensajes = 'La fecha de finalización no puede ser mayor o igual a la fecha actual';
      this.cerrarAlerta();    
      return false;
    }
    
    return true;
  }

  verificarFechasActualizar(estudio: Estudio):boolean {
    const fechaActual = new Date();
    const fechaFin = this.isCheckEstudioActualizar ? this.datePipe.transform(fechaActual.toDateString(), 'yyyy-MM-dd') : estudio.EST_FECH_FIN;
    if (estudio.EST_FECH_INI > fechaFin) {
      this.mostrarAlerta=true;
      this.tipoAlerta='danger';
      this.mensajes = 'La fecha de inicio no puede ser mayor a la fecha de finalización';
      this.cerrarAlerta();
      return false;
    }
    if (estudio.EST_FECH_FIN >= this.datePipe.transform(fechaActual.toDateString(), 'yyyy-MM-dd')) {
      this.mostrarAlerta=true;
      this.tipoAlerta='danger';
      this.mensajes = 'La fecha de finalización no puede ser mayor o igual a la fecha actual';
      this.cerrarAlerta();
      return false;
    }
    return true;
  }

  cerrarAlerta(){
    setTimeout(() => {
      this.mostrarAlerta=false;
      this.mensajes="";
    }, 5000);
  }

}
