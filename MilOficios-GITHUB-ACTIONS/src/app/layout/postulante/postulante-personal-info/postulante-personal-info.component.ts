import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbAlert, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { StorageService } from 'src/app/helpers/storage.service';
import { AuthService } from 'src/app/shared/guard/auth.service';
import { Distrito } from '../../distritos/distrito.model';
import { DistritosService } from '../../distritos/distritos.service';
import { Pais } from '../../paises/pais.model';
import { PaisesService } from '../../paises/paises.service';
import { Provincia } from '../../provincias/provincia.model';
import { ProvinciasService } from '../../provincias/provincias.service';
import { Region } from '../../regiones/region.model';
import { RegionesService } from '../../regiones/regiones.service';
import { PostulacionService } from '../postulacion/postulacion.service';
import { PostulanteService } from '../postulante.service';

@Component({
  selector: 'app-postulante-personal-info',
  templateUrl: './postulante-personal-info.component.html',
  styleUrls: ['./postulante-personal-info.component.scss']
})
export class PostulantePersonalInfoComponent implements OnInit {

  postulanteForm:FormGroup;
  maxFecha: string;
  id_postulante: number;
  paises: Pais[];
  regiones: Region[];
  provincias: Provincia[];
  distritos: Distrito[];
  postulante;

  tipoAlerta:string;
  alertaPostulacion:boolean;
  mensajeAlerta:string;
  estado_postulacion:number;
  alertaGeneral:boolean;

  //errores
  errorPost: boolean;
  mensajeErrorPostulante:string;
  
  errorModal:boolean;
  cargando:boolean;
  loadingModal:boolean;
  mensajeModal:string;
  @ViewChild('selfClosingAlert', {static: false}) selfClosingAlert: NgbAlert; 
  

  constructor(private formBuilder:FormBuilder,private datePipe: DatePipe,
    private paisService: PaisesService, private regionService: RegionesService,
    private provinciaService: ProvinciasService,private distritoService: DistritosService, 
    private storageService: StorageService,private postulanteService:PostulanteService,private modalService: NgbModal, private router: Router,
    private postulacionService: PostulacionService, private authService: AuthService, 
    private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.id_postulante = parseInt(this.storageService.getString('POST_ID'));

    this.route.data.subscribe( (data: any) => {
      this.alertaGeneral = false;
      this.postulante =data.postulanteSidebar['Resultado'];
      this.cargarFormulario(data.postulanteSidebar['Resultado']);
      if (data.postulanteSidebar.exito) {
        this.obtenerDatosPaises();
        this.estado_postulacion = data.postulanteSidebar['Resultado']['POST_ESTADO'];// estado del postulante
        if (this.estado_postulacion == 2){
          this.tipoAlerta = "warning";
          this.alertaPostulacion = true;
          this.mensajeAlerta = "Tienes una postulación pendiente. Por favor, espera a que esta sea evaluada para que actualices tus datos.";
        }
      } else{
        this.tipoAlerta = "danger";
        this.alertaGeneral = true;
        this.mensajeAlerta = "Hubo un error en la conexión del servidor. Por favor, intente más tarde.";
      }
    });
  }

  cargarFormulario(data ? ){
    const emailFormat = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    this.postulanteForm = this.formBuilder.group({
      post_id:[data ? data.POST_ID : 0],
      post_nombres: [data ? data.POST_NOMBRES.trim() : '', [Validators.required, Validators.pattern('([a-zA-ZñÑáéíóúÁÉÍÓÚ\s][ ]*)+'), Validators.maxLength(50)]],
      post_ape_pat: [data ? data.POST_APE_PAT.trim() : '', [Validators.required, Validators.pattern('([a-zA-ZñÑáéíóúÁÉÍÓÚ\s][ ]*)+'), Validators.maxLength(30)]],
      post_ape_mat: [data ? data.POST_APE_MAT.trim() : '', [Validators.required, Validators.pattern('([a-zA-ZñÑáéíóúÁÉÍÓÚ\s][ ]*)+'), Validators.maxLength(30)]],
      post_email: [data ? data.POST_EMAIL.trim() : '', [Validators.required, Validators.pattern(emailFormat), Validators.maxLength(60)]],
      post_celular: [data ? data.POST_CELULAR : '',[Validators.required, Validators.pattern('[+][0-9]+'), Validators.maxLength(20), Validators.minLength(12)]],
      post_dni: [data ? data.POST_DNI : '', [Validators.required, Validators.pattern('[0-9]+'), Validators.minLength(8), Validators.maxLength(8)]],
      post_ruc: [data ? data.JUR_RUC ? data.JUR_RUC.trim() : data.POST_RUC ? data.POST_RUC.trim() : '' : '', [Validators.required, Validators.pattern(/^([0-9])*$/), Validators.maxLength(11), Validators.minLength(11)]],
      post_sexo: [data ? data.POST_SEXO : '', Validators.required],
      post_nacimiento: [data ? data.POST_FECH_NACIMIENTO : '', Validators.required],
      post_direccion: [data ? data.POST_DIRECCION.trim() : '', [Validators.required,Validators.maxLength(150)]],
      post_pai_id: [data ? data.PAI_ID : '', Validators.required],
      post_reg_id: [data ? data.REG_ID : '', Validators.required],
      post_pro_id: [data ? data.PRO_ID : '', Validators.required],
      post_dist_id: [data ? data.DIST_ID : '', Validators.required]
    });
  }

  obtenerDetallesPostulante() {
    this.postulanteService.obtenerPostulante(this.id_postulante)
    .subscribe((data) => {
      this.postulante = data['Resultado'];
    },error => {

    });
  }

  obtenerFechaMinima() {
    const fechaActual = this.datePipe.transform(new Date(), "yyyy-MM-dd").split('-')
    const dia = fechaActual[2]
    const mes = fechaActual[1];
    const anio = Number(fechaActual[0]) - 18;

    this.maxFecha = anio + '-' + mes + '-' + dia;
  }

  obtenerDatosPaises() {
    this.paisService.getPaises().subscribe( data => {
      this.paises = data['Resultado'];
      if (this.post_reg_id.value) {
        this.obtenerRegiones(true);
      }
    }, error => {
      this.tipoAlerta = 'danger';
      this.alertaGeneral = true;
      if (error['error']['error'] !== undefined) {
        if (error['error']['error'] === 'error_deBD') {
            this.mensajeAlerta = 'No se pudo obtener los datos, debido a una falla de conexión. Por favor, intente otra vez.';
        }
      } else {
        this.mensajeAlerta = 'Hubo un error al intentar rescatar los países. Por favor, intente de nuevo';
      }
    } );
  }

  
  obtenerRegiones(validacion?:boolean){
    if (this.post_pai_id.value)
      this.regionService.getRegiones(this.post_pai_id.value).subscribe( data => {
        this.regiones = data['Resultado'];
        if (!validacion) {
          this.postulanteForm.get('post_pro_id').setValue(null);
          this.postulanteForm.get('post_dist_id').setValue(null);
        }
        if (this.post_pro_id.value) {
          this.obtenerProvincias(true);
        }

      }, error => {
        this.tipoAlerta = 'danger';
        this.alertaGeneral = true;
        if (error['error']['error'] !== undefined) {
          if (error['error']['error'] === 'error_deBD') {
              this.mensajeAlerta = 'No se pudo obtener los datos, debido a una falla de conexión. Por favor, intente otra vez.';
          } else if (error['error']['error'] === 'error_noExistenciaDeIdPai') {
            this.mensajeAlerta = 'No se pudo obtener las regiones . Por favor, intente con otra de nuevo.';
          } else if (error['error']['error'] === 'error_deCampo') {
            this.mensajeAlerta = error['error']['mensaje'];
          }
        } else {
          this.mensajeAlerta = 'Hubo un error al intentar rescatar las regiones. Por favor, intente de nuevo';
        }
      }
      );
  }

  obtenerProvincias(validacion?:boolean){
    if (this.post_reg_id.value)
      this.provinciaService.getProvincias(this.post_reg_id.value).subscribe( data => {
        this.provincias = data['Resultado'];
        if (!validacion) {
          this.postulanteForm.get('post_dist_id').setValue(null);
        }
        if (this.post_dist_id.value) {
          this.obtenerDistritos();
        }
      }, error => {
        this.tipoAlerta = 'danger';
        this.alertaGeneral = true;
        if (error['error']['error'] !== undefined) {
          if (error['error']['error'] === 'error_deBD') {
              this.mensajeAlerta = 'No se pudo obtener los datos, debido a una falla de conexión. Por favor, intente otra vez.';
          } else if (error['error']['error'] === 'error_noExistenciaDeIdReg') {
            this.mensajeAlerta = 'No se pudo obtener las provincias. Por favor, intente con otra vez.';
          } else if (error['error']['error'] === 'error_deCampo') {
            this.mensajeAlerta = 'Los datos ingresados deben respetar los formatos permitidos. Por favor, intente de nuevo.';
          }
        } else {
          this.mensajeAlerta = 'Hubo un error al intentar rescatar las provincias. Por favor, intente de nuevo';
        }
      }
      );
  }

  obtenerDistritos(){
    if (this.post_pro_id.value)
      this.distritoService.getDistrito(this.post_pro_id.value).subscribe( data => {
        this.distritos = data['Resultado'];
      }, error => {
        this.tipoAlerta = 'danger';
        this.alertaGeneral = true;
        if (error['error']['error'] !== undefined) {
          if (error['error']['error'] === 'error_deBD') {
              this.mensajeAlerta = 'No se pudo obtener los datos, debido a una falla de conexión. Por favor, intente otra vez.';
          } else if (error['error']['error'] === 'error_noExistenciaDeIdPro') {
            this.mensajeAlerta = 'No se pudo obtener los distritos. Por favor, intente de nuevo.';
          } else if (error['error']['error'] === 'error_deCampo') {
            this.mensajeAlerta = 'Los datos ingresados deben respetar los formatos permitidos. Por favor, intente de nuevo.';
          }
        } else {
          this.mensajeAlerta = 'Hubo un error al intentar rescatar los distritos. Por favor, intente de nuevo';
        }
      });
  }

  actualizarPostulante(){
    this.cargando=true;
    this.postulanteService.actualizarPostulanteInfo(this.postulanteForm.value)
    .subscribe((data)=>{
      this.cargando=false;
      this.alertaGeneral = true;
      this.tipoAlerta = "success";
      this.mensajeAlerta = "Se ha actualizado correctamente el postulante";
      this.cerrarAlerta();
      this.obtenerDetallesPostulante();
    }, error=>{
      if(error['error']['error'] !== undefined){
        this.cargando=false;
        this.errorPost = true;
        this.tipoAlerta = "danger"
        this.cerrarAlerta();
        if(error['error']['error'] === "error_deEstadoNoValidoBloqueo"){
          this.errorPost = false;//se pone false para que no aparezca el elemento de alerta
          this.estado_postulacion = 3;//para indicar que es un postulante bloqueado, ya que si no se recarga la pagina no se actualiza dicha variable
          // this.modalService.open(this.contentPostulacion);
        }else if(error['error']['error'] === "error_deBD")
          this.mensajeErrorPostulante = "Hubo un error al intentar ejecutar su solicitud para actualizar los datos del postulante. Por favor, intente de nuevo";
        else if(error['error']['error'] === "error_noExistenciaDeId")
          this.mensajeErrorPostulante = "No se encontró registro del postulante para actualizar sus datos. Por favor, intente de nuevo.";
        else if(error['error']['error'] === "error_deCampo")
          this.mensajeErrorPostulante = "Los datos ingresados deben respetar los formatos permitidos. Por favor, intente de nuevo.";
        else if(error['error']['error'] === "error_deExistenciaDeEmail"){
          this.mensajeErrorPostulante = "El email ya existe. Por favor , ingrese nuevamente";}
        else if(error['error']['error'] === "error_deExistenciaDeDNI")
          this.mensajeErrorPostulante = "El DNI ya existe. Por favor , ingrese nuevamente";
          else if(error['error']['error'] === "error_deExistenciaDeRUC")
            this.mensajeErrorPostulante = "El RUC ya existe. Por favor , ingrese nuevamente";
      }else{
        this.tipoAlerta = "danger"
        this.alertaGeneral = true;
        this.mensajeAlerta = "Hubo un error en la conexión del servidor. Por favor, intente más tarde.";
      }
      // this.loadingPost = false;
    });
  }

  cerrarAlerta(){
    setTimeout(() => {
      if(this.selfClosingAlert) {
        this.selfClosingAlert.close();
      }
      }, 5000);
  }

  /* GET PARA EL FORMULARIO DEL POSTULANTE */
  get post_nombres(){
    return this.postulanteForm.get('post_nombres');
  }
  get post_ape_pat(){
    return this.postulanteForm.get('post_ape_pat');
  }
  get post_ape_mat(){
    return this.postulanteForm.get('post_ape_mat');
  }
  get post_email(){
    return this.postulanteForm.get('post_email');
  }
  get post_celular(){
    return this.postulanteForm.get('post_celular');
  }
  get post_dni(){
    return this.postulanteForm.get('post_dni');
  }
  get post_ruc() {
    return this.postulanteForm.get('post_ruc');
  }
  
  get post_sexo(){
    return this.postulanteForm.get('post_sexo');
  }
  get post_nacimiento(){
    return this.postulanteForm.get('post_nacimiento');
  }
  get post_direccion(){
    return this.postulanteForm.get('post_direccion');
  }
  get post_pai_id(){
    return this.postulanteForm.get('post_pai_id');
  }
  get post_reg_id(){
    return this.postulanteForm.get('post_reg_id');
  }
  get post_pro_id(){
    return this.postulanteForm.get('post_pro_id');
  }
  get post_dist_id(){
    return this.postulanteForm.get('post_dist_id');
  }

  open(content) {
    this.modalService.open(content);
  }
  // ***************************** FUNCION PARA POSTULAR ************************** */
  insertarPostulacion(){
    this.loadingModal = true;
    this.errorModal = false;
    this.postulacionService.insertarPostulacion(this.id_postulante,this.postulante['POST_EMAIL'])
    .subscribe((data)=>{
      this.loadingModal = false;
      this.modalService.dismissAll();
      this.router.navigate(['postulante/postulacion']);
    },error=>{
      if(error['error']['error'] !== undefined){
        if(error['error']['error'] === "error_deEstadoNoValidoBloqueo"){
          this.mensajeModal = "Su cuenta ha sido bloqueada. Por favor, comuníquese con un administrador.";
          this.obtenerDetallesPostulante();
        }if(error['error']['error'] === "error_deBD")
          this.mensajeModal = "Hubo un error al intentar ejecutar su solicitud para realización la postulación. Por favor, intente de nuevo";
        else if(error['error']['error'] === "error_deCampo")
          this.mensajeModal = "Los datos ingresados deben respetar los formatos permitidos. Por favor, intente de nuevo.";  
        else if(error['error']['error'] === "error_noExistenciaDeId")
          this.mensajeModal = "No se encontró registro del postulante para realizar su postulación. Por favor, intente de nuevo.";
        else if(error['error']['error'] === "error_dePostulacionPendiente")
          this.mensajeModal = "No puede postular cuando se tiene una postulación pendiente. Por favor, espere a que un administrador analice su postulación.";
      }else{
        this.mensajeModal = "Hubo un error al intentar postular. Por favor, intente de nuevo";
      }
      this.errorModal = true;
      this.loadingModal = false;
    });
  }
  
  cerrarSesion(){
    this.modalService.dismissAll();
    this.authService.logout();
  }

  // ***************************** FUNCION PARA COMPROBAR SI EL POSTULANTE ESTÁ BLOQUEADO O NO ************************** */
  estaBloqueado = () => {
    const promiseBloqueo = new Promise((resolve,reject) => {
      this.postulanteService.estaBloqueado(this.id_postulante)
      .subscribe(data => {
        resolve(data);
      }, error =>{
        reject(error);
      });
    });
    return promiseBloqueo;
  }
}
