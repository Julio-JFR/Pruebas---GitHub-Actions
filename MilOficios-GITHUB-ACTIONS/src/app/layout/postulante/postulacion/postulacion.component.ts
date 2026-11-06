import { Component, ElementRef, OnInit,ViewChild } from '@angular/core';
import { NgbModalConfig, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/app/authorization/auth.service';
import { RoutingService } from 'src/app/helpers/routing.service';
import { Postulacion } from './postulacion.model';
import { PostulacionService } from './postulacion.service';
import { StorageService } from '../../../helpers/storage.service';
@Component({
  selector: 'app-postulacion',
  templateUrl: './postulacion.component.html',
  styleUrls: ['./postulacion.component.scss']
})
export class PostulacionComponent implements OnInit {

  //Variables para las postulaciones
  postulaciones: Postulacion[] = [];
  id_postulante: number = parseInt(this.storageService.getString('POST_ID'));
  detalle_postulacion: Postulacion;

  error: boolean;
  mensajeError: string;

  //variable para loading
  loading: boolean;
  currentPage = 1;
  itemsPerPage = 10;
  estado_postulante_actual: number;

  @ViewChild('contentBloqueo') contentBloqueo: ElementRef;

  constructor(config: NgbModalConfig, private modalService: NgbModal, private storageService: StorageService, 
    private postulacionService: PostulacionService, private authService: AuthService, private routingService: RoutingService) { }

  ngOnInit(): void {
    this.listarPostulacionesPorPostulante();
  }

  listarPostulacionesPorPostulante(){
    this.error = false;
    this.loading = true;
    this.postulacionService.listarPostulacionesPorPostulante(this.id_postulante)
    .subscribe((data)=>{
      this.loading = false;
      this.postulaciones = data['Resultado'];
      if(this.postulaciones[this.postulaciones.length-1]['POST_ESTADO'] == 3)
        this.open(this.contentBloqueo);
    }, error=>{
      this.error = true;
      this.loading = false;
      if(error['error']['error'] !== undefined){
        if(error['error']['error'] === "error_deBD")
          this.mensajeError = "Hubo un error al intentar ejecutar su solicitud. Por favor, intente de nuevo";
        else if(error['error']['error'] === "error_deCampo")
          this.mensajeError = "Los datos ingresados deben respetar los formatos permitidos. Por favor, intente de nuevo.";
      }else{
        this.mensajeError = "Hubo un error al intentar listar las postulaciones del postulante en el servidor. Por favor, intente de nuevo";
      }
      this.cerrarAlerta();
    });
  }
  obtenerPostulacionActual(postulacion){
    this.detalle_postulacion = JSON.parse(JSON.stringify(postulacion));
  }

  redirigirBloqueo(){
    this.authService.onLoggedout();
    this.modalService.dismissAll();
    this.routingService.replace(['/home']);
  }

  // ***************************** FUNCION PARA EL MODAL ************************** */
  open(content) {
    this.modalService.open(content);
  }

  cancelarPostulacion(){
    this.postulacionService.cancelarPostulacion(this.id_postulante).subscribe({
      next:(value) =>{
          
      },
    })
  }

  cerrarAlerta(){
    setTimeout(() => {
      this.error=false;
    }, 5000);
}

}
