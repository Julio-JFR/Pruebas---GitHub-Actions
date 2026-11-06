import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ExperienciaLaboral } from '../../experiencias-laborales/experiencia-laboral.model';
import { ExperienciasLaboralesService } from '../../experiencias-laborales/experiencias-laborales.service';
import { NgbAlert, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, Validators } from '@angular/forms';
import { StorageService } from '../../../helpers/storage.service';

@Component({
  selector: 'app-especialistas-working-info',
  templateUrl: './especialistas-working-info.component.html',
  styleUrls: ['./especialistas-working-info.component.scss']
})
export class EspecialistasWorkingInfoComponent implements OnInit {

  ESPECIALISTA_ID = 0;
  TIPO_ESPECIALISTA: string;//0 persona y 1 empresa
  EXPERIENCIAS_LABORALES: ExperienciaLaboral[];
  @ViewChild('selfClosingAlert', {static: false}) selfClosingAlert: NgbAlert; 
  NUEVA_EXPERIENCIA_LABORAL: ExperienciaLaboral = new ExperienciaLaboral();

  MENSAJE_CONFIRMACION: String;

  // Users list is loading
  cargandoDatos: boolean;
  cargandoGuardar: boolean;
  cargandoActualizar: boolean;

  experienciaLaboralForm: any;
  experienciaLaboralUpdateForm: any;

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;

  error: any;
  success: any;

  mensaje="";
  mostrarAlerta = false;
  tipoAlerta = '';

  // errorActualizar = [];

  //variables excepcionales para el checkbox para las fechas de fin en experiencia laboral 
  deshabilitarFechaFinExperiencia = false;
  isCheckExperiencia = false;// el checkbox de "en curso" para las fechas de fin estará true por defecto
  isCheckExperienciaActualizar = false;// checkbox para la actualizar el estudio

  constructor(
    private experienciasLaboralesService: ExperienciasLaboralesService,
    private storageService: StorageService,
    private router: Router,
    private datePipe: DatePipe,
    public modal: NgbModal,
    private formBuilder: FormBuilder
    ) { 
      this.TIPO_ESPECIALISTA = this.storageService.getString('ESP_TYPE');
    }

  ngOnInit(): void {
    this.cargandoDatos = false;
    this.cargandoGuardar = false;
    this.cargandoActualizar = false;
    this.ESPECIALISTA_ID = Number(localStorage.getItem("USE_ID"));
    this.getExperienciasLaborales();
    const emailFormat = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    this.experienciaLaboralForm =  this.formBuilder.group({
          exp_especialidad: ['', [Validators.required, Validators.maxLength(20), Validators.pattern('([a-zA-ZñÑáéíóúÁÉÍÓÚ\s][ ]*)+')]],
          exp_empresa: ['', [Validators.required, Validators.maxLength(20), Validators.pattern('([a-zA-ZñÑáéíóúÁÉÍÓÚ\s][ ]*)+')]],
          exp_fech_ini: ['', Validators.required],
          exp_fech_fin: ['', Validators.required],
          exp_descripcion: ['', [Validators.required, Validators.maxLength(60)]],
          cont_nombres: ['', [Validators.required, Validators.pattern('([a-zA-ZñÑáéíóúÁÉÍÓÚ\s][ ]*)+'), Validators.maxLength(50)]],
          cont_apellidos: ['', [Validators.required, Validators.pattern('([a-zA-ZñÑáéíóúÁÉÍÓÚ\s][ ]*)+'), Validators.maxLength(30)]],
          cont_email: ['', [Validators.required,Validators.pattern(emailFormat), Validators.maxLength(60), Validators.email]],
          cont_celular: ['', [Validators.required,Validators.pattern('[+][0-9]+'), Validators.maxLength(20),Validators.minLength(12)]]
    });
    this.experienciaLaboralUpdateForm =  this.formBuilder.group({
          exp_especialidad_update: ['', [Validators.required, Validators.maxLength(20), Validators.pattern('([a-zA-ZñÑáéíóúÁÉÍÓÚ\s][ ]*)+')]],
          exp_empresa_update: ['', [Validators.required, Validators.maxLength(20), Validators.pattern('([a-zA-ZñÑáéíóúÁÉÍÓÚ\s][ ]*)+')]],
          exp_fech_ini_update: ['', Validators.required],
          exp_fech_fin_update: ['', Validators.required],
          exp_descripcion_update: ['', [Validators.required, Validators.maxLength(60)]],
          cont_nombres_update: ['', [Validators.required, Validators.pattern('([a-zA-ZñÑáéíóúÁÉÍÓÚ\s][ ]*)+'), Validators.maxLength(50)]],
          cont_apellidos_update: ['', [Validators.required, Validators.pattern('([a-zA-ZñÑáéíóúÁÉÍÓÚ\s][ ]*)+'), Validators.maxLength(30)]],
          cont_email_update: ['', [ Validators.required,Validators.pattern(emailFormat), Validators.maxLength(60), Validators.email]],
          cont_celular_update: ['', [ Validators.required,Validators.pattern('[+][0-9]+'), Validators.maxLength(20),Validators.minLength(12)]]
    });
  }

  //función que determinará el comportamiendo del input de la fecha final de la experiencia laboral cuando se selecciona el checkbox
  procesoDatosCheckExperiencia(){
    this.isCheckExperiencia = !this.isCheckExperiencia;//se cambia el valor de la variable a su opuesto
    //si el checkbox esta seleccionado se inhabilitado sino se habilita el input de la fecha de fin
    if(this.isCheckExperiencia)
      this.experienciaLaboralForm.controls.exp_fech_fin.disable();
    else
      this.experienciaLaboralForm.controls.exp_fech_fin.enable(); 

    if(this.isCheckExperiencia)
      this.exp_fech_fin.setValue('');
  }

  //función que determinará el comportamiendo del input de la fecha final de la experiencia laboral cuando se selecciona el checkbox
  procesoDatosCheckEstudioUpdate(){
    this.isCheckExperienciaActualizar = !this.isCheckExperienciaActualizar;//se cambia el valor de la variable a su opuesto
    //si el checkbox esta seleccionado se inhabilitado sino se habilita el input de la fecha de fin
    if(this.isCheckExperienciaActualizar)
      this.experienciaLaboralUpdateForm.controls.exp_fech_fin_update.disable();
    else{
      this.experienciaLaboralUpdateForm.controls.exp_fech_fin_update.enable(); 
      this.exp_fech_fin_update.setValue('');
    }
      

    if(this.isCheckExperienciaActualizar)
      this.exp_fech_fin_update.setValue('');
  }

  getExperienciasLaborales() {
    this.cargandoDatos = true;
    this.experienciasLaboralesService.getExperienciasLaboralesEspecialista(this.ESPECIALISTA_ID).subscribe(
      (EXPERIENCIAS_LABORALES) => {
        this.EXPERIENCIAS_LABORALES = EXPERIENCIAS_LABORALES['Resultado'];
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
            this.mensaje = 'No se pudo obtener la información laboral debido a que el especialista ya no se encuentra registrado. Por favor, intente de nuevo.';
          }
          else if (error['error']['error'] === 'error_deBD') {
            this.mensaje = 'Hubo un error al intentar ejecutar su solicitud para obtener la información laboral. Por favor, intente de nuevo.';
          }
          else if (error['error']['error'] === 'error_deCampo') {
            this.mensaje = 'Los datos ingresados deben respetar los formatos permitidos. Por favor, intente de nuevo.';
          }
        } else {
          this.mensaje = 'Hubo un error al intentar obtener la información laboral. Por favor, intente de nuevo';
        }
        this.cerrarAlerta();
    });
  }

  agregarExperienciaLaboralConContacto() {
    if (this.experienciaLaboralForm.invalid) {
      this.mostrarAlerta = true;
      this.tipoAlerta = 'danger';
      this.mensaje = 'Es necesario llenar todos los campos';
      this.experienciaLaboralForm.markAllAsTouched();
      this.cerrarAlerta();
      return;
    }

    this.saveValuesExperienciaLaboral();

    if (this.verificarFechasCrear()) {
      this.cargandoDatos = true;
      this.experienciasLaboralesService.insertExperienciasLaboralesConContactos(this.NUEVA_EXPERIENCIA_LABORAL, this.ESPECIALISTA_ID)
      .subscribe(
        (mensaje) => {
          this.mostrarAlerta = true;
          this.tipoAlerta = 'success';
          this.mensaje = 'Experiencia laboral con contacto creado correctamente';
          this.NUEVA_EXPERIENCIA_LABORAL = new ExperienciaLaboral();
          this.experienciaLaboralForm.reset();
          this.getExperienciasLaborales();
          this.cerrarAlerta();
          this.cargandoDatos = false;
          this.isCheckExperiencia = false;
          this.experienciaLaboralForm.controls.exp_fech_fin.enable(); 
        },
        (error) => {
          this.cargandoDatos = false;
          this.mostrarAlerta = true;
          this.tipoAlerta = 'danger';
          if (error['error']['error'] !== undefined) {
            if (error['error']['error'] === 'error_noExistenciaDeIdEsp') {
              this.mensaje = 'No se pudo guardar la experiencia laboral debido a que el especialista ya no se encuentra registrado. Por favor, intente de nuevo.';
            }
            else if (error['error']['error'] === 'error_deBD') {
              this.mensaje = 'Hubo un error al intentar ejecutar su solicitud para guardar la experiencia laboral. Por favor, intente de nuevo.';
            }
            else if (error['error']['error'] === 'error_deCampo') {
              this.mensaje = 'Los datos ingresados deben respetar los formatos permitidos. Por favor, intente de nuevo.';
            }
          } else {
            this.mensaje = 'Hubo un error al intentar crear la experiencia laboral. Por favor, intente de nuevo';
          }
          this.cerrarAlerta();
      });
    }else
    this.cerrarAlerta();
  }

  actualizarExperienciaLaboral (experienciaLaboral: ExperienciaLaboral) {
    if (this.experienciaLaboralUpdateForm.invalid) {
      this.mostrarAlerta = true;
      this.tipoAlerta = 'danger';
      this.mensaje = 'Es necesario llenar todos los campos';
      this.experienciaLaboralUpdateForm.markAllAsTouched();
      this.cerrarAlerta();
      return;
    }
    this.saveValuesExperienciaLaboralUpdate(experienciaLaboral);    
    if(experienciaLaboral.EXP_FECH_FIN === null ) experienciaLaboral.EXP_FECH_FIN = "";
    
    if (this.verificarFechasActualizar(experienciaLaboral)) {
      this.cargandoActualizar = true;
      this.experienciasLaboralesService.updateExperienciaLaboralConContactos(experienciaLaboral).subscribe(
        (mensaje) => {
          this.mostrarAlerta = true;
          this.tipoAlerta = 'success';
          this.mensaje = 'Experiencia laboral con contacto actualizado correctamente';
          this.getExperienciasLaborales();
          this.cargandoActualizar = false;
          this.cerrarAlerta();
        },
        (error) => {
          this.cargandoActualizar = false;
          this.mostrarAlerta = true;
          this.tipoAlerta = 'danger';
          if (error['error']['error'] !== undefined) {
            if (error['error']['error'] === 'error_noExistenciaDeIdExp') {
              this.mensaje = 'No se pudo actualizar la experiencia laboral debido a que no se encuentra registrada. Por favor, intente de nuevo.';
            }
            else if (error['error']['error'] === 'error_deBD') {
              this.mensaje = 'Hubo un error al intentar ejecutar su solicitud actualizar la experiencia laboral. Por favor, intente de nuevo.';
            }
            else if (error['error']['error'] === 'error_deCampo') {
              this.mensaje = 'Los datos ingresados deben respetar los formatos permitidos. Por favor, intente de nuevo.';
            }
          } else {
            this.mensaje = 'Hubo un error al intentar actualizar la experiencia laboral. Por favor, intente de nuevo';
          }
          this.cerrarAlerta();
      });
    }else
      this.cerrarAlerta();
  }

  goToNotFound() {
    this.router.navigate(['not-found']);
  }

  setCollapsed(experienciaLaboral: ExperienciaLaboral) {
    for (let index = 0; index < this.EXPERIENCIAS_LABORALES.length; index++) {
      if(this.EXPERIENCIAS_LABORALES[index] != experienciaLaboral) {
        this.EXPERIENCIAS_LABORALES[index]['IS_COLLAPSED'] = true;
      }
      else {
        experienciaLaboral['IS_COLLAPSED'] = !experienciaLaboral['IS_COLLAPSED'];
      }
    }
  }

  setCollapsedAll() {
      for (let index = 0; index < this.EXPERIENCIAS_LABORALES.length; index++) {
        this.EXPERIENCIAS_LABORALES[index]['IS_COLLAPSED'] = true;
      }
  }

  convertDate() {
    for (let index = 0; index < this.EXPERIENCIAS_LABORALES.length; index++) {
      this.EXPERIENCIAS_LABORALES[index].EXP_FECH_INI = this.datePipe.transform(this.EXPERIENCIAS_LABORALES[index].EXP_FECH_INI, 'yyyy-MM-dd');
      this.EXPERIENCIAS_LABORALES[index].EXP_FECH_FIN = this.datePipe.transform(this.EXPERIENCIAS_LABORALES[index].EXP_FECH_FIN, 'yyyy-MM-dd');
    }
  }

  setDisabled() {
    for (let index = 0; index < this.EXPERIENCIAS_LABORALES.length; index++) {
      this.EXPERIENCIAS_LABORALES[index]['IS_NOT_EDITABLE'] = true;
    }
  }

  get exp_especialidad() {
    return this.experienciaLaboralForm.get('exp_especialidad');
  }

  get exp_empresa() {
    return this.experienciaLaboralForm.get('exp_empresa');
  }

  get exp_fech_ini() {
    return this.experienciaLaboralForm.get('exp_fech_ini');
  }

  get exp_fech_fin() {
    return this.experienciaLaboralForm.get('exp_fech_fin');
  }

  get exp_descripcion() {
    return this.experienciaLaboralForm.get('exp_descripcion');
  }

  get cont_nombres() {
    return this.experienciaLaboralForm.get('cont_nombres');
  }

  get cont_apellidos() {
    return this.experienciaLaboralForm.get('cont_apellidos');
  }

  get cont_email() {
    return this.experienciaLaboralForm.get('cont_email');
  }

  get cont_celular() {
    return this.experienciaLaboralForm.get('cont_celular');
  }

  get exp_especialidad_update() {
    return this.experienciaLaboralUpdateForm.get('exp_especialidad_update');
  }

  get exp_empresa_update() {
    return this.experienciaLaboralUpdateForm.get('exp_empresa_update');
  }

  get exp_fech_ini_update() {
    return this.experienciaLaboralUpdateForm.get('exp_fech_ini_update');
  }

  get exp_fech_fin_update() {
    return this.experienciaLaboralUpdateForm.get('exp_fech_fin_update');
  }

  get exp_descripcion_update() {
    return this.experienciaLaboralUpdateForm.get('exp_descripcion_update');
  }

  get cont_nombres_update() {
    return this.experienciaLaboralUpdateForm.get('cont_nombres_update');
  }

  get cont_apellidos_update() {
    return this.experienciaLaboralUpdateForm.get('cont_apellidos_update');
  }

  get cont_email_update() {
    return this.experienciaLaboralUpdateForm.get('cont_email_update');
  }

  get cont_celular_update() {
    return this.experienciaLaboralUpdateForm.get('cont_celular_update');
  }

  updateValuesExperienciaLaboral() {
    this.exp_especialidad.setValue(this.NUEVA_EXPERIENCIA_LABORAL.EXP_ESPECIALIDAD);
    this.exp_empresa.setValue(this.NUEVA_EXPERIENCIA_LABORAL.EXP_EMPRESA);
    this.exp_fech_ini.setValue(this.NUEVA_EXPERIENCIA_LABORAL.EXP_FECH_INI);
    this.exp_fech_fin.setValue(this.NUEVA_EXPERIENCIA_LABORAL.EXP_FECH_FIN);
    this.exp_descripcion.setValue(this.NUEVA_EXPERIENCIA_LABORAL.EXP_DESCRIPCION);
    this.cont_nombres.setValue(this.NUEVA_EXPERIENCIA_LABORAL.CONT_NOMBRES);
    this.cont_apellidos.setValue(this.NUEVA_EXPERIENCIA_LABORAL.CONT_APELLIDOS);
    this.cont_email.setValue(this.NUEVA_EXPERIENCIA_LABORAL.CONT_EMAIL);
    this.cont_celular.setValue(this.NUEVA_EXPERIENCIA_LABORAL.CONT_CELULAR);
  }

  saveValuesExperienciaLaboral() {
    this.NUEVA_EXPERIENCIA_LABORAL.EXP_ESPECIALIDAD = this.exp_especialidad.value;
    this.NUEVA_EXPERIENCIA_LABORAL.EXP_EMPRESA = this.exp_empresa.value;
    this.NUEVA_EXPERIENCIA_LABORAL.EXP_FECH_INI = this.exp_fech_ini.value;
    this.NUEVA_EXPERIENCIA_LABORAL.EXP_FECH_FIN = this.exp_fech_fin.value;
    this.NUEVA_EXPERIENCIA_LABORAL.EXP_DESCRIPCION = this.exp_descripcion.value;
    this.NUEVA_EXPERIENCIA_LABORAL.CONT_NOMBRES = this.cont_nombres.value;
    this.NUEVA_EXPERIENCIA_LABORAL.CONT_APELLIDOS = this.cont_apellidos.value;
    this.NUEVA_EXPERIENCIA_LABORAL.CONT_EMAIL = this.cont_email.value;
    this.NUEVA_EXPERIENCIA_LABORAL.CONT_CELULAR = this.cont_celular.value;
  }

  updateValuesExperienciaLaboralUpdate(experienciaLaboral: ExperienciaLaboral) {
    this.exp_especialidad_update.setValue(experienciaLaboral.EXP_ESPECIALIDAD);
    this.exp_empresa_update.setValue(experienciaLaboral.EXP_EMPRESA);
    this.exp_fech_ini_update.setValue(experienciaLaboral.EXP_FECH_INI);
    this.exp_fech_fin_update.setValue(experienciaLaboral.EXP_FECH_FIN);
    this.exp_descripcion_update.setValue(experienciaLaboral.EXP_DESCRIPCION);
    this.cont_nombres_update.setValue(experienciaLaboral.CONT_NOMBRES);
    this.cont_apellidos_update.setValue(experienciaLaboral.CONT_APELLIDOS);
    this.cont_email_update.setValue(experienciaLaboral.CONT_EMAIL);
    this.cont_celular_update.setValue(experienciaLaboral.CONT_CELULAR);
    if(this.exp_fech_fin_update.value == null){
      this.isCheckExperienciaActualizar = true;
      this.experienciaLaboralUpdateForm.controls.exp_fech_fin_update.disable();
    }else{
      this.isCheckExperienciaActualizar = false;
      this.experienciaLaboralUpdateForm.controls.exp_fech_fin_update.enable();
    }
  }

  saveValuesExperienciaLaboralUpdate(experienciaLaboral: ExperienciaLaboral) {
    experienciaLaboral.EXP_ESPECIALIDAD = this.exp_especialidad_update.value;
    experienciaLaboral.EXP_EMPRESA = this.exp_empresa_update.value;
    experienciaLaboral.EXP_FECH_INI = this.exp_fech_ini_update.value;
    experienciaLaboral.EXP_FECH_FIN = this.exp_fech_fin_update.value;
    experienciaLaboral.EXP_DESCRIPCION = this.exp_descripcion_update.value;
    experienciaLaboral.CONT_NOMBRES = this.cont_nombres_update.value;
    experienciaLaboral.CONT_APELLIDOS = this.cont_apellidos_update.value;
    experienciaLaboral.CONT_EMAIL = this.cont_email_update.value;
    experienciaLaboral.CONT_CELULAR = this.cont_celular_update.value;
  }

  verificarFechasCrear() {
    const fechaActual = new Date();
    const fechaFin = this.isCheckExperiencia ? new Date() : this.NUEVA_EXPERIENCIA_LABORAL.EXP_FECH_FIN;
    if (this.NUEVA_EXPERIENCIA_LABORAL.EXP_FECH_INI > fechaFin) {
      this.mostrarAlerta=true;
      this.tipoAlerta='danger';
      this.mensaje = 'La fecha de inicio no puede ser mayor a la fecha de finalización';
      return false;
    }
    if (this.NUEVA_EXPERIENCIA_LABORAL.EXP_FECH_FIN >  this.datePipe.transform(fechaActual.toDateString(), 'yyyy-MM-dd')) {
      this.mostrarAlerta=true;
      this.tipoAlerta='danger';
      this.mensaje = 'La fecha de finalización no puede ser mayor a la fecha actual';
      return false;
    }
    
    return true;
  }

  verificarFechasActualizar(experienciaLaboral: ExperienciaLaboral) {
    const fechaActual = new Date();
    const fechaFin = this.isCheckExperienciaActualizar ? new Date() : new Date(experienciaLaboral.EXP_FECH_FIN);
    if (new Date(experienciaLaboral.EXP_FECH_INI) > fechaFin) {
      this.mostrarAlerta=true;
      this.tipoAlerta='danger';
      this.mensaje = 'La fecha de inicio no puede ser mayor a la fecha de finalización';
      return false;
    }
    if (experienciaLaboral.EXP_FECH_FIN >=  this.datePipe.transform(fechaActual.toDateString(), 'yyyy-MM-dd')) {
      this.mostrarAlerta=true;
      this.tipoAlerta='danger';
      this.mensaje = 'La fecha de finalización no puede ser mayor o igual a la fecha actual';
      return false;
    }    
    return true;
  }

  cerrarAlerta(){
    setTimeout(() => {
      this.mostrarAlerta=false;
      this.mensaje='';
      }, 3000);
  }

}
