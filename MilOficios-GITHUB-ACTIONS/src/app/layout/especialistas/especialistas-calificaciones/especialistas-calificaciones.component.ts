import { Component, OnInit, ViewChildren, ElementRef, QueryList } from '@angular/core';
import { CalificacionesService } from '../../calificaciones/calificaciones.service';
import {NgbRatingConfig} from '@ng-bootstrap/ng-bootstrap';
import { StorageService } from '../../../helpers/storage.service';

import { sortableDirective, compare } from 'src/app/shared/modules/sortable/sortable.directive';

@Component({
  selector: 'app-especialistas-calificaciones',
  templateUrl: './especialistas-calificaciones.component.html',
  styleUrls: ['./especialistas-calificaciones.component.scss']
})
export class EspecialistasCalificacionesComponent implements OnInit {
  currentRate = 1;
  /**************** Variables para las alertas*******************/
  mostrarAlerta = false;
  cargandoDatos: boolean;
  tipoAlerta: string;
  mensaje: string;

  /**************** Variables para la tabla*******************/
  calificacionesBD: any[];
  calificaciones: any[] = [];

  FILTRO_CALIFICACION: number = null;
  FILTRO_FECHA_INICIO: any = null;
  FILTRO_FECHA_FIN: any = null;
  ID_ESPECIALISTA: number;

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;

  // Sortable directive. To get the headers
  @ViewChildren(sortableDirective) headers: QueryList<sortableDirective>;
  
  constructor(private calificacionService: CalificacionesService, private storageService: StorageService, config: NgbRatingConfig) {
    config.max = 5;
    config.readonly = true;  
  }

  ngOnInit(): void {
    this.ID_ESPECIALISTA = parseInt(this.storageService.getString('USE_ID'));
    this.listarCalificaciones();
  }

  listarCalificaciones(){
    let fechaInicioAux = this.FILTRO_FECHA_INICIO;
    let fechaFinAux = this.FILTRO_FECHA_FIN;
    this.mostrarAlerta = false;
    this.cargandoDatos = true;
    this.calificacionService.listarCalificaciones(this.ID_ESPECIALISTA,this.FILTRO_CALIFICACION,this.FILTRO_FECHA_INICIO,this.FILTRO_FECHA_FIN)
    .subscribe( data =>{
      this.FILTRO_FECHA_INICIO = fechaInicioAux;
      this.FILTRO_FECHA_FIN = fechaFinAux;
      this.cargandoDatos = false;
      this.calificacionesBD = data['Resultado'];
      for(let i = 0; i < this.calificacionesBD.length; i++){
        this.calificacionesBD[i]['CA_CALIFICACION'] = parseInt(this.calificacionesBD[i]['CA_CALIFICACION']);
      }
      this.calificaciones = this.calificacionesBD.slice();
    },error =>{
      this.FILTRO_FECHA_INICIO = fechaInicioAux;
      this.FILTRO_FECHA_FIN = fechaFinAux;
      this.cargandoDatos = false;
      this.mostrarAlerta = true;
      this.tipoAlerta = "danger";
      if (error['error']['error'] !== undefined) {
        if (error['error']['error'] === 'error_noExistenciaDeIdEsp') {
          this.mensaje = "No se puede listar las calificaciones de una cuenta no existente. Por favor, intente de nuevo.";
        }
        else if (error['error']['error'] === 'error_deBD') {
          this.mensaje = "Hubo un error al intentar ejecutar su solicitud. Por favor, intente de nuevo."
        }
        else if (error['error']['error'] === 'error_deCampo') {
          this.mensaje = "Los datos ingresados deben respetar los formatos permitidos. Por favor, intente de nuevo.";
        }
      } 
      else {
          this.mensaje = "Hubo un error de conexión al intentar listar las calificaciones"
      }
      this.cerrarAlerta();
    }); 
  }

  // Sort items
  resetSorting(column: string) {
    this.headers.forEach(header => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });
  }

  sort({column, direction}: {column: string, direction: string}) {
    // Resetting other headers
    this.resetSorting(column);

    // Sorting users
    if (direction === '') {
      this.calificaciones = this.calificacionesBD.slice();
    } else {
      this.calificaciones = this.calificacionesBD.slice().sort((a, b) => {
        const res = compare(a[column], b[column]);
        return direction === 'asc' ? res : -res;
      });
    }
  }

  cerrarAlerta(){
    setTimeout(() => {
      this.mostrarAlerta=false;
      this.mensaje="";
    }, 5000);
  }
}
