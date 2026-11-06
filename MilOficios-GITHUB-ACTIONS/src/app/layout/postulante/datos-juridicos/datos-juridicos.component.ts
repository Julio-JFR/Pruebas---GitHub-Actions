import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbAlert, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/app/shared/guard/auth.service';
import { TipoEmpresa } from '../../tipo-empresa/tipo-empresa.model';
import { TipoEmpresaService } from '../../tipo-empresa/tipo-empresa.service';
import { PostulacionService } from '../postulacion/postulacion.service';
import { PostulanteService } from '../postulante.service';

@Component({
  selector: 'app-datos-juridicos',
  templateUrl: './datos-juridicos.component.html',
  styleUrls: ['./datos-juridicos.component.scss']
})
export class DatosJuridicosComponent implements OnInit {

  juridicoForm:FormGroup;
  TIPOS_EMPRESA:TipoEmpresa[];
  mostrarAlerta:boolean;
  estado_postulacion:number;
  tipoAlerta:string;
  mensajeAlerta:string;
  errorModal:boolean;
  loadingModal:boolean;
  mensajeModal:string;

  postulante;
  @ViewChild('selfClosingAlert', {static: false}) selfClosingAlert: NgbAlert; 

  constructor(private formBuilder:FormBuilder,private route: ActivatedRoute,private tipoEmpresaServicio: TipoEmpresaService,
    private modalService: NgbModal, private router: Router,
    private postulacionService: PostulacionService, private authService: AuthService,private postulanteService:PostulanteService ) { }

  ngOnInit(): void {
    this.obtenerTipoEmpresa();
   this.obtenerDetallesPostulante();
  }

  obtenerDetallesPostulante(){
    this.route.data.subscribe( (data: any) => {
      this.mostrarAlerta = false;
      this.cargarFormulario(data.postulanteSidebar['Resultado']);
      this.postulante=data.postulanteSidebar['Resultado'];
      if (data.postulanteSidebar.exito) {
        this.estado_postulacion = data.postulanteSidebar['Resultado']['POST_ESTADO'];// estado del postulante
        if (this.estado_postulacion == 2){
          this.mostrarAlerta=true;
          this.tipoAlerta = "warning";
          this.mensajeAlerta = "Tienes una postulación pendiente. Por favor, espera a que esta sea evaluada para que actualices tus datos.";
          this.cerrarAlerta();
        }
      } else{
        this.tipoAlerta = "danger";
        this.mostrarAlerta = true;
        this.mensajeAlerta = "Hubo un error en la conexión del servidor. Por favor, intente más tarde.";
        this.cerrarAlerta();
      }
    });
  }

  cargarFormulario(data?){
    this.juridicoForm = this.formBuilder.group(
      {
        POST_ID:[data ? data.POST_ID : 0],
        ruc: [data? (data.JUR_RUC ? data.JUR_RUC : data.POST_RUC): '', [Validators.required, Validators.pattern(/^([0-9])*$/), Validators.maxLength(11), Validators.minLength(11)]],
        razonSocial: [data ? data.JUR_RAZ_SOCIAL: '', [Validators.required, Validators.pattern('[a-zñáéíóú. A-ZÑÁÉÍÓÚ & 0-9]+'), Validators.maxLength(100)]],
        tipoEmpresa: [data ? data.TIP_EMP_ID: '', Validators.required]
      }
    );
  }

  obtenerTipoEmpresa() {
    this.tipoEmpresaServicio.getTipoEmpresa().subscribe( data => {
      this.TIPOS_EMPRESA = data['Resultado'];
    }, error => {
      if (error['error']['error'] !== undefined) {
        if (error['error']['error'] === 'error_deBD') {
            // this.mensajeAlerta = 'No se pudo obtener los datos, debido a una falla de conexión. Por favor, intente otra vez.';
        }
      } else {
        // this.mensajeAlerta = 'Hubo un error al intentar rescatar los tipos de empresa. Por favor, intente de nuevo';
      }
    } );
  }

  get ruc() {
    return this.juridicoForm.get('ruc');
  }
  get razonSocial() {
    return this.juridicoForm.get('razonSocial');
  }
  get tipoEmpresa() {
    return this.juridicoForm.get('tipoEmpresa');
  }



  open(content) {
    this.modalService.open(content);
  }
  // ***************************** FUNCION PARA POSTULAR ************************** */
  insertarPostulacion(){
    this.loadingModal = true;
    this.errorModal = false;
    this.postulacionService.insertarPostulacion(this.postulante['POST_ID'],this.postulante['POST_EMAIL'])
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
      this.postulanteService.estaBloqueado(this.postulante['POST_ID'])
      .subscribe(data => {
        resolve(data);
      }, error =>{
        reject(error);
      });
    });
    return promiseBloqueo;
  }

  actualizarPostulante(){
    this.postulanteService.actualizarPostulanteJuridico(this.juridicoForm.value)
    .subscribe((data)=>{
      let objeto = {
        POST_ID: this.juridicoForm.value.POST_ID,
        JUR_RUC: this.juridicoForm.value.ruc,
        JUR_RAZ_SOCIAL: this.juridicoForm.value.razonSocial,
        TIP_EMP_ID: this.juridicoForm.value.tipoEmpresa
      }

      this.mostrarAlerta = true;
      this.tipoAlerta = "success";
      this.mensajeAlerta = "Se ha actualizado correctamente el postulante";
      this.cerrarAlerta();
      this.cargarFormulario(objeto);
      this.cerrarAlerta();
    }, error=>{
      this.tipoAlerta = "danger"
      this.mostrarAlerta = true;
      if(error['error']['error'] !== undefined){
        if(error['error']['error'] === "error_deEstadoNoValidoBloqueo"){
          this.estado_postulacion = 3;//para indicar que es un postulante bloqueado, ya que si no se recarga la pagina no se actualiza dicha variable
          // this.modalService.open(this.contentPostulacion);
          }else if(error['error']['error'] === "error_deBD")
            this.mensajeAlerta = "Hubo un error al intentar ejecutar su solicitud para actualizar los datos del postulante. Por favor, intente de nuevo";
          else if(error['error']['error'] === "error_noExistenciaDeId")
            this.mensajeAlerta = "No se encontró registro del postulante para actualizar sus datos. Por favor, intente de nuevo.";
          else if(error['error']['error'] === "error_deCampo")
            this.mensajeAlerta = "Los datos ingresados deben respetar los formatos permitidos. Por favor, intente de nuevo.";
      }else{
        this.mensajeAlerta = "Hubo un error en la conexión del servidor. Por favor, intente más tarde.";
      }
      this.cerrarAlerta();
      // this.loadingPost = false;
    });
  }

  cerrarAlerta(){
    setTimeout(() => {
      this.mostrarAlerta=false;
      this.mensajeAlerta="";
    }, 5000);
  }

}
