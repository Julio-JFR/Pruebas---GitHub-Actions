import { DatePipe } from '@angular/common';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Distrito } from '../../distritos/distrito.model';
import { DistritosService } from '../../distritos/distritos.service';
import { Pais } from '../../paises/pais.model';
import { PaisesService } from '../../paises/paises.service';
import { Provincia } from '../../provincias/provincia.model';
import { TipoEmpresa } from '../../tipo-empresa/tipo-empresa.model';
import { TipoEmpresaService } from '../../tipo-empresa/tipo-empresa.service';
import { ProvinciasService } from '../../provincias/provincias.service';
import { StorageService } from '../../../helpers/storage.service';
import { Region } from '../../regiones/region.model';
import { RegionesService } from '../../regiones/regiones.service';
import { Especialista } from '../especialista.model';
import { EspecialistasService } from '../especialistas.service';
import { NgbModal,NgbAlert } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-especialistas-personal-info',
  templateUrl: './especialistas-personal-info.component.html',
  styleUrls: ['./especialistas-personal-info.component.scss']
})
export class EspecialistasPersonalInfoComponent implements OnInit {

  ESPECIALISTA: Especialista = new Especialista();
  ID_ESPECIALISTA: number;

  PAISES: Pais[];
  REGIONES: Region[];
  PROVINCIAS: Provincia[];
  DISTRITOS: Distrito[];
  IDIOMAS: any;

  SEXO_ESPECIALISTA = [{'clave': 'M', 'nombre': 'Masculino'}, {'clave': 'F', 'nombre': 'Femenino'}];

  mensaje:string="";
  mostrarAlerta = false;
  tipoAlerta = '';

  maxFecha: string;

  // Users list is loading
  cargandoDatos: boolean;
  cargandoActualizarDatos: boolean;

  MENSAJE_CONFIRMACION: String;
  TIPO_ESPECIALISTA: string;

  especialistaForm: any;
  public datosEmpresaForm: FormGroup;
  TIPOS_EMPRESAS:TipoEmpresa[];

  @ViewChild('modalConfirmacion') elementModalConfirmacion: ElementRef;

  @ViewChild('selfClosingAlert', {static: false}) selfClosingAlert: NgbAlert; 
  // referencia al las artetas que se cierran solas despues de 30 segundos. 


  datosJuridicos: any = null;
  constructor(
    private especialistasService: EspecialistasService,
    private storageService: StorageService ,
    private router: Router,
    private datePipe: DatePipe,
    private paisesService: PaisesService,
    private regionesService: RegionesService,
    private provinciaService: ProvinciasService,
    private distritoService: DistritosService,
    private tipoEmpresaService: TipoEmpresaService,
    public modal: NgbModal,
    private formBuilder: FormBuilder
    ) { }

  ngOnInit(): void {
    this.cargandoDatos = false;
    this.cargandoActualizarDatos = false;
    this.obtenerFechaMinima();
    this.obtenerEspecialista();
    this.especialistaForm =  this.formBuilder.group({
      usu_nombres: [{value: '', disabled: true }, [Validators.required, Validators.pattern('([a-zA-ZñÑáéíóúÁÉÍÓÚ\s][ ]*)+'), Validators.maxLength(50)]],
      usu_dni: [{value: '', disabled: true }, [Validators.required, Validators.pattern('[0-9]+'), Validators.minLength(8), Validators.maxLength(8)]],
      usu_ape_pat: [{value: '', disabled: true }, [Validators.required, Validators.pattern('([a-zA-ZñÑáéíóúÁÉÍÓÚ\s][ ]*)+'), Validators.maxLength(30)]],
      usu_ape_mat: [{value: '', disabled: true }, [Validators.required, Validators.pattern('([a-zA-ZñÑáéíóúÁÉÍÓÚ\s][ ]*)+'), Validators.maxLength(30)]],
      usu_sexo: [{value: '', disabled: true }, Validators.required],
      usu_ruc: [{value: '', disabled: true }, [Validators.required, Validators.pattern('[0-9]+'), Validators.minLength(11), Validators.maxLength(11)]],
      idi_id: [{value: '', disabled: true }, Validators.required],
      pai_id: [{value: '', disabled: true }, Validators.required],
      reg_id: [{value: '', disabled: true }, Validators.required],
      pro_id: [{value: '', disabled: true }, Validators.required],
      dist_id: [{value: '', disabled: true }, Validators.required],
      usu_direccion: [{value: '', disabled: true }, [Validators.required, Validators.maxLength(150)]],
      usu_celular: [{value: '', disabled: true }, [Validators.required, Validators.pattern('[+][0-9]+'), , Validators.maxLength(20),Validators.minLength(12)]],
      usu_fech_nacimiento: [{value: '', disabled: true }, Validators.required],
    });
    this.TIPO_ESPECIALISTA = this.storageService.getString('ESP_TYPE');
    if( this.TIPO_ESPECIALISTA =='1'){
      this.inicializarDatosJurídicos();
      this.getTiposEmpresas();
    }
  }

  obtenerEspecialista(){
    this.getEspecialista()
    .then(() => {
      if (this.ESPECIALISTA === undefined) {
        this.cargandoDatos = false;
        this.goToNotFound();
      } else {
        this.ID_ESPECIALISTA = this.ESPECIALISTA.ESP_ID;
        this.getIdiomas();
        this.getPaises();
        this.getRegiones(this.ESPECIALISTA.PAI_ID);
        this.getProvincias(this.ESPECIALISTA.REG_ID);
        this.getDistritos(this.ESPECIALISTA.PRO_ID);
        if (this.ESPECIALISTA.USU_FECH_NACIMIENTO !== '0000-00-00 00:00:00') {
          this.ESPECIALISTA.USU_FECH_NACIMIENTO = this.datePipe.transform(this.ESPECIALISTA.USU_FECH_NACIMIENTO, 'yyyy-MM-dd');
          this.usu_fech_nacimiento.setValue(this.ESPECIALISTA.USU_FECH_NACIMIENTO);
        } else {
          this.ESPECIALISTA.USU_FECH_NACIMIENTO = '0000-00-00';
          this.usu_fech_nacimiento.setValue(this.ESPECIALISTA.USU_FECH_NACIMIENTO);
        }
        this.updateValuesEspecialista();
        this.cargandoDatos = false;
      }
    })
    .catch(() => {
      this.cargandoDatos = false;
      this.goToNotFound();
    });
  }

  inicializarDatosJurídicos() {
    this.datosEmpresaForm = this.formBuilder.group(
      {
        razonSocial: [{value: '', disabled: true }, [Validators.required, Validators.pattern('[a-zñáéíóú. A-ZÑÁÉÍÓÚ & 0-9]+'), Validators.maxLength(100)]],
        tipoEmpresa: [{value: '', disabled: true }, Validators.required]
      }
    );
  }

  cerrarAlerta(){
    setTimeout(() => {
      if(this.selfClosingAlert) {
        this.selfClosingAlert.close();
      }
      }, 5000);
  }


  getTiposEmpresas(){
    this.tipoEmpresaService.getTipoEmpresa().subscribe(
      (tipoEmpresa) => {
        this.TIPOS_EMPRESAS = tipoEmpresa['Resultado'];
      },
      (error) => {
        this.mostrarAlerta = true;
          this.tipoAlerta = 'danger';
          if (error['error']['error'] !== undefined) {
            if (error['error']['error'] === 'error_deBD') {
              this.mensaje = 'Hubo un error al intentar ejecutar su solicitud para obtener los datos de  tipo de empresa. Por favor, intente de nuevo.';
            }
            else if (error['error']['error'] === 'error_deCampo') {
              this.mensaje = 'Hubo un error al intentar obtener los datos de tipo de empresa. Por favor, intente de nuevo.';
            }
          } 
          else {
              this.mensaje = 'Hubo un error al intentar obtener los datos de tipo de empresa. Por favor, intente de nuevo.';
          }
          this.cerrarAlerta();
      });
  }

  getEspecialista = () => {
    this.cargandoDatos = true;
    const especialistaPromise = new Promise((resolve, reject) => {
    this.especialistasService.getEspecialistaById(Number(localStorage.getItem("USE_ID"))).subscribe(
      (ESPECIALISTA) => {
        this.ESPECIALISTA = ESPECIALISTA['Resultado'][0];
        if(ESPECIALISTA['Resultado'][0].POST_TIPO == 1){
          this.datosJuridicos = {"razonSocial":ESPECIALISTA['Resultado'][0].JUR_RAZ_SOCIAL, "tipoEmpresa":ESPECIALISTA['Resultado'][0].TIP_EMP_ID}
          this.updateValuesEspecialistaJuridico();
        }
        this.cargandoDatos = false;
        resolve(this.ESPECIALISTA);
      },
      (error) => {
        this.cargandoDatos = false;
        this.mostrarAlerta = true;
        this.tipoAlerta = 'danger';
        if (error['error']['error'] !== undefined) {
          if (error['error']['error'] === 'error_noExistenciaDeIdEsp') {
            this.mensaje = 'No se pudo obtener los datos personales del especialista debido a que ya no se encuentra registrado. Por favor, intente de nuevo.';
          }
          else if (error['error']['error'] === 'error_deBD') {
            this.mensaje = 'Hubo un error al intentar ejecutar su solicitud para obtener los datos personales del especialista. Por favor, intente de nuevo.';
          }
          else if (error['error']['error'] === 'error_deCampo') {
            this.mensaje = 'Los datos ingresados deben respetar los formatos permitidos. Por favor, intente de nuevo.';
          }
        } 
        else {
          this.mensaje = 'Hubo un error al intentar obtener la información personal. Por favor, intente de nuevo';
        }
        this.cerrarAlerta();
      });
    });
    return especialistaPromise;
  }

  updateEspecialista() {
    if (this.especialistaForm.invalid) {
      this.especialistaForm.markAllAsTouched();
      return;
    }
    let datoJuridico = null;
    this.saveValuesEspecialista();
    this.verificarFecha();
    if (this.mostrarAlerta == false) {
      this.cargandoDatos = true;
      if( this.TIPO_ESPECIALISTA =='1'){
        datoJuridico ={ 
          "razonSocial":this.datosEmpresaForm.get('razonSocial').value,
          "tipoEmpresa":this.datosEmpresaForm.get('tipoEmpresa').value
        }
      }
      this.especialistasService.updateCuentaEspecialista( this.ESPECIALISTA, Number(localStorage.getItem("ESP_TYPE")), datoJuridico).subscribe(
        (mensaje) => {
          this.mensaje = 'Datos personales actualizados correctamente';
          this.mostrarAlerta = true;
          this.tipoAlerta = 'success';
          this.cerrarAlerta();
          this.getEspecialista()
          .then(() => {
            if (this.ESPECIALISTA.USU_FECH_NACIMIENTO !== '0000-00-00 00:00:00') {
              this.ESPECIALISTA.USU_FECH_NACIMIENTO = this.datePipe.transform(this.ESPECIALISTA.USU_FECH_NACIMIENTO, 'yyyy-MM-dd');
            } else {
              this.ESPECIALISTA.USU_FECH_NACIMIENTO = '0000-00-00';
            }
          });
          this.cargandoDatos = false;
        },
        (error) => {
          this.cargandoDatos = false;
          this.mostrarAlerta = true;
          this.tipoAlerta = 'danger';
          if (error['error']['error'] !== undefined) {
            if (error['error']['error'] === 'error_existenciaDeDni') {
              this.mensaje = 'No se pudo actualizar los datos debido a que el DNI ya se encuentra registrado. Por favor, intente de nuevo.';
            } else if (error['error']['error'] === 'error_deBD') {
              this.mensaje = 'Hubo un error al intentar ejecutar su solicitud. Por favor, intente de nuevo.';
            } else if (error['error']['error'] === 'error_deCampo') {
              this.mensaje = 'Los datos ingresados deben respetar los formatos permitidos. Por favor, intente de nuevo.';
            } else if (error['error']['error'] === 'error_existenciaDeRuc') {
              this.mensaje = 'No se pudo actualizar los datos debido a que el RUC ya se encuentra registrado. Por favor, intente de nuevo.';
            }
          } else {
            this.mensaje = 'Hubo un error al intentar actualizar los datos. Por favor, intente de nuevo';
          }
          this.cerrarAlerta();
      });
    }
  }

  getPaises() {
    this.paisesService.getPaises().subscribe(
      (paises) => {
        this.PAISES = paises['Resultado'];
    },
    (error) => {
      this.mostrarAlerta = true;
        this.tipoAlerta = 'danger';
        if (error['error']['error'] !== undefined) {
          if (error['error']['error'] === 'error_deBD') {
            this.mensaje = 'Hubo un error al intentar ejecutar su solicitud para obtener los países. Por favor, intente de nuevo.';
          }
          else if (error['error']['error'] === 'error_deCampo') {
            this.mensaje = 'Hubo un error al intentar obtener los países. Por favor, intente de nuevo.';
          }
        } 
        else {
          this.mensaje = 'Hubo un error al intentar obtener los países. Por favor, intente de nuevo.';
        }
        this.cerrarAlerta();
    });
  }

  getRegiones = (idPais: number) => {
    const regionesPromise = new Promise((resolve, reject) => {
      if (idPais != null && idPais !== undefined) {
        this.regionesService.getRegiones(idPais).subscribe(
          (regiones) => {
            this.REGIONES = regiones['Resultado'];
            resolve(this.REGIONES);
          },
          (error) => {
            this.mostrarAlerta = true;
              this.tipoAlerta = 'danger';
              if (error['error']['error'] !== undefined) {
                if (error['error']['error'] === 'error_noExistenciaDeIdPai') {
                  this.mensaje = 'No se pudo obtener las regiones debido a que no se encontró el país que le corresponde. Por favor, intente de nuevo.';
                }
                else if (error['error']['error'] === 'error_deBD') {
                  this.mensaje = 'Hubo un error al intentar ejecutar su solicitud para obtener las regiones. Por favor, intente de nuevo.';
                }
                else if (error['error']['error'] === 'error_deCampo') {
                  this.mensaje = 'Hubo un error al intentar obtener las regiones. Por favor, intente de nuevo.';
                }
              } 
              else {
                  this.mensaje = 'Hubo un error al intentar obtener las regiones. Por favor, intente de nuevo.';
              }
              this.cerrarAlerta();
          });
      }
    });
    return regionesPromise;
  }

  getProvincias = (idRegion: number) => {
    const provinciasPromise = new Promise((resolve, reject) => {
      if (idRegion != null && idRegion !== undefined) {
        this.provinciaService.getProvincias(idRegion).subscribe(
          (provincias) => {
            this.PROVINCIAS = provincias['Resultado'];
            resolve(this.PROVINCIAS);
          },
          (error) => {
            this.mostrarAlerta = true;
              this.tipoAlerta = 'danger';
              if (error['error']['error'] !== undefined) {
                if (error['error']['error'] === 'error_noExistenciaDeIdReg') {
                  this.mensaje = 'No se pudo obtener las provincias debido a que no se encontró la región que le corresponde. Por favor, intente de nuevo.';
                }
                else if (error['error']['error'] === 'error_deBD') {
                  this.mensaje = 'Hubo un error al intentar ejecutar su solicitud para obtener las provincias. Por favor, intente de nuevo.';
                }
                else if (error['error']['error'] === 'error_deCampo') {
                  this.mensaje = 'Hubo un error al intentar obtener las provincias. Por favor, intente de nuevo.';
                }
              } 
              else {
                  this.mensaje = 'Hubo un error al intentar obtener las provincias. Por favor, intente de nuevo.';
              }
              this.cerrarAlerta();
          });
      }
    });
    return provinciasPromise;
  }

  getDistritos = (idProvincia: number) => {
  const distritosPromise = new Promise((resolve, reject) => {
    if (idProvincia != null && idProvincia !== undefined) {
      this.distritoService.getDistrito(idProvincia).subscribe(
        (distritos) => {
          this.DISTRITOS = distritos['Resultado'];
          resolve(this.DISTRITOS);
        },
        (error) => {
          this.mostrarAlerta = true;
            this.tipoAlerta = 'danger';
            if (error['error']['error'] !== undefined) {
              if (error['error']['error'] === 'error_noExistenciaDeIdPro') {
                this.mensaje = 'No se pudo obtener los distritos debido a que no se encontró la provincia que le corresponde. Por favor, intente de nuevo.';
              }
              else if (error['error']['error'] === 'error_deBD') {
                this.mensaje = 'Hubo un error al intentar ejecutar su solicitud para obtener los distritos. Por favor, intente de nuevo.';
              }
              else if (error['error']['error'] === 'error_deCampo') {
                this.mensaje = 'Hubo un error al intentar obtener los distritos. Por favor, intente de nuevo.';
              }
            } 
            else {
                this.mensaje = 'Hubo un error al intentar obtener los distritos. Por favor, intente de nuevo.';
            }
            this.cerrarAlerta();
      });
    }
    });
    return distritosPromise;
  }

  cambiarPais() {
    this.REGIONES = [];
    this.PROVINCIAS = [];
    this.DISTRITOS = [];

    this.reg_id.setValue(null);
    this.pro_id.setValue(null);
    this.dist_id.setValue(null);

    if (this.pai_id.value != null || this.pai_id.value !== undefined) {
      this.ESPECIALISTA.PAI_ID = this.pai_id.value;
      this.getRegiones(this.pai_id.value);
    }
  }

  cambiarRegion() {
    this.PROVINCIAS = [];
    this.DISTRITOS = [];

    this.pro_id.setValue(null);
    this.dist_id.setValue(null);

    if (this.reg_id.value != null || this.reg_id.value !== undefined) {
      this.ESPECIALISTA.REG_ID = this.reg_id.value;
      this.getProvincias(this.reg_id.value);
    }
  }

  cambiarProvincia() {
    this.DISTRITOS = [];

    this.dist_id.setValue(null);

    if (this.pro_id.value != null || this.pro_id.value !== undefined) {
      this.ESPECIALISTA.PRO_ID = this.pro_id.value;
      this.getDistritos(this.pro_id.value);
    }
  }

  getIdiomas() {
    this.especialistasService.getIdiomas().subscribe(
      (idiomas) => {
        this.IDIOMAS = idiomas['Resultado'];
      },
      (error) => {
        this.mostrarAlerta = true;
        this.tipoAlerta = 'danger';
        if (error['error']['error'] !== undefined) {
          if (error['error']['error'] === 'error_deBD') {
            this.mensaje = 'Hubo un error al intentar ejecutar su solicitud para obtener los idiomas. Por favor, intente de nuevo.';
          }
        } 
        else {
            this.mensaje = 'Hubo un error al intentar obtener los idiomas. Por favor, intente de nuevo.';
        }
        this.cerrarAlerta();
      }
    );
  }

  goToNotFound() {
    this.router.navigate(['not-found']);
  }

  get usu_nombres() {
    return this.especialistaForm.get('usu_nombres');
  }

  get usu_dni() {
    return this.especialistaForm.get('usu_dni');
  }

  get usu_ape_pat() {
    return this.especialistaForm.get('usu_ape_pat');
  }

  get usu_ape_mat() {
    return this.especialistaForm.get('usu_ape_mat');
  }

  get usu_sexo() {
    return this.especialistaForm.get('usu_sexo');
  }

  get usu_ruc() {
    return this.especialistaForm.get('usu_ruc');
  }

  get idi_id() {
    return this.especialistaForm.get('idi_id');
  }

  get pai_id() {
    return this.especialistaForm.get('pai_id');
  }

  get reg_id() {
    return this.especialistaForm.get('reg_id');
  }

  get pro_id() {
    return this.especialistaForm.get('pro_id');
  }

  get dist_id() {
    return this.especialistaForm.get('dist_id');
  }

  get usu_direccion() {
    return this.especialistaForm.get('usu_direccion');
  }

  get usu_celular() {
    return this.especialistaForm.get('usu_celular');
  }

  get usu_fech_nacimiento() {
    return this.especialistaForm.get('usu_fech_nacimiento');
  }

  /* FORMS DE DATOS DE LA EMPRESA */

  get razonSocial() {
    return this.datosEmpresaForm.get('razonSocial');
  }
  get tipoEmpresa() {
    return this.datosEmpresaForm.get('tipoEmpresa');
  }

  updateValuesEspecialistaJuridico(){
    this.razonSocial.setValue(this.datosJuridicos.razonSocial);
    this.tipoEmpresa.setValue(this.datosJuridicos.tipoEmpresa);
    this.datosEmpresaForm.enable();
  }

  updateValuesEspecialista() {
    this.usu_nombres.setValue(this.ESPECIALISTA.USU_NOMBRES);
    this.usu_dni.setValue(this.ESPECIALISTA.USU_DNI);
    this.usu_ape_pat.setValue(this.ESPECIALISTA.USU_APE_PAT);
    this.usu_ape_mat.setValue(this.ESPECIALISTA.USU_APE_MAT);
    this.usu_sexo.setValue(this.ESPECIALISTA.USU_SEXO);
    this.usu_ruc.setValue(this.ESPECIALISTA.JUR_RUC ? this.ESPECIALISTA.JUR_RUC : this.ESPECIALISTA.USU_RUC);
    this.idi_id.setValue(this.ESPECIALISTA.IDI_ID);
    this.pai_id.setValue(this.ESPECIALISTA.PAI_ID);
    this.reg_id.setValue(this.ESPECIALISTA.REG_ID);
    this.pro_id.setValue(this.ESPECIALISTA.PRO_ID);
    this.dist_id.setValue(this.ESPECIALISTA.DIST_ID);
    this.usu_direccion.setValue(this.ESPECIALISTA.USU_DIRECCION);
    this.usu_celular.setValue(this.ESPECIALISTA.USU_CELULAR);
    this.usu_fech_nacimiento.setValue(this.ESPECIALISTA.USU_FECH_NACIMIENTO);

    this.especialistaForm.enable();
  }

  saveValuesEspecialista() {
    this.ESPECIALISTA.USU_NOMBRES = this.usu_nombres.value;
    this.ESPECIALISTA.USU_DNI = this.usu_dni.value;
    this.ESPECIALISTA.USU_APE_PAT = this.usu_ape_pat.value;
    this.ESPECIALISTA.USU_APE_MAT = this.usu_ape_mat.value;
    this.ESPECIALISTA.USU_SEXO = this.usu_sexo.value;
    this.ESPECIALISTA.IDI_ID = this.idi_id.value;
    this.ESPECIALISTA.USU_RUC = this.usu_ruc.value;
    this.ESPECIALISTA.PAI_ID = this.pai_id.value;
    this.ESPECIALISTA.REG_ID = this.reg_id.value;
    this.ESPECIALISTA.PRO_ID = this.pro_id.value;
    this.ESPECIALISTA.DIST_ID = this.dist_id.value;
    this.ESPECIALISTA.USU_DIRECCION = this.usu_direccion.value;
    this.ESPECIALISTA.USU_CELULAR = this.usu_celular.value;
    this.ESPECIALISTA.USU_FECH_NACIMIENTO = this.usu_fech_nacimiento.value;
  }

  verificarFecha() {
    const fechaActual = new Date();

    if (this.ESPECIALISTA.USU_FECH_NACIMIENTO >= this.datePipe.transform(fechaActual.toDateString(), 'yyyy-MM-dd')) {
      this.mensaje =  'La fecha de nacimiento no es válida';
      this.tipoAlerta = 'danger';
      this.mostrarAlerta = true;
      this.cerrarAlerta();
    }
    if (this.maxFecha < this.ESPECIALISTA.USU_FECH_NACIMIENTO) {
      this.mensaje = 'Debe ser mayor de edad. Fecha de nacimiento no válida. Por favor, intente de nuevo.';
      this.tipoAlerta = 'danger';
      this.mostrarAlerta = true;
      this.cerrarAlerta();
    }
  }

  obtenerFechaMinima() {
    const fechaActual = this.datePipe.transform(new Date(), "yyyy-MM-dd").split('-')
    const dia = fechaActual[2]
    const mes = fechaActual[1];
    const anio = Number(fechaActual[0]) - 18;

    this.maxFecha = anio + '-' + mes + '-' + dia;
 }

}
