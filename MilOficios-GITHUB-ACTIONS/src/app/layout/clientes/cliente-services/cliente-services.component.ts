

import { Component, OnInit,QueryList,ViewChild, ViewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import {ServicioRealizadoService} from '../../servicios/servicios-realizados/servicio-realizado.service';
import {ClienteService} from '../cliente.service';
import {StorageService} from '../../../helpers/storage.service';
import { sortableDirective } from 'src/app/shared/modules/sortable/sortable.directive';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-cliente-services',
  templateUrl: './cliente-services.component.html',
  styleUrls: ['./cliente-services.component.scss']
})
export class ClienteServicesComponent implements OnInit {

  ID_CLIENTE = 0;
  serviciosContratados: any[];
  DURACION: string;
  MENSAJE = 'No se encontraron servicios contratados';
  MENSAJE_CONFIRMACION = 'Hubo un error al intentar obtener los servicios realizados. Por favor, intente de nuevo';
  error: any;

  mensajes:string='';
  mostrarAlerta = false;;
  tipoAlerta = '';
  servicioSeleccionado!:any;

  // Users list is loading
  cargandoDatos: boolean;

  // Pagination
  currentPage = 1;
  itemsPerPage = 5;
  @ViewChildren(sortableDirective) headers: QueryList<sortableDirective>;


  constructor(
    private router: Router,
    private modalService: NgbModal,
    private clienteService: ClienteService,
    private servicioRealizadoService:ServicioRealizadoService,
    private localStorage: StorageService
  ) { }
  ngOnInit(): void {
    this.cargandoDatos = false;
    this.clienteService.updateHeaders();
    this.getServiciosContratados();
  }

  getServiciosContratados() {
    this.cargandoDatos = true;
    this.servicioRealizadoService.getServiciosContratados(Number(this.localStorage.getString("USE_ID"))).subscribe(
      (serviciosContratados) => {
        this.serviciosContratados = serviciosContratados['Resultado'];
        this.setCollapsed();
        this.cargandoDatos = false;
      },
      (error) => {
        this.cargandoDatos = false;
        this.mostrarAlerta = true;
          this.tipoAlerta = 'danger';
          if (error['error']['error'] !== undefined) {
            if (error['error']['error'] === 'error_noExistenciaDeIdCli') {
              this.mensajes= 'No se pudo obtener los sevicios contratados debido a que el cliente ya no se encuentra registrado. Por favor, intente de nuevo.';
              return;
            }
            else if (error['error']['error'] === 'error_deBD') {
              this.mensajes= 'Hubo un error al intentar ejecutar su solicitud para obtener los servicios contratados. Por favor, intente de nuevo.';
              return;
            }
            else if (error['error']['error'] === 'error_deCampo') {
              this.mensajes= 'Hubo un error al intentar obtener los servicios contratados. Por favor, intente de nuevo';
              return;
            }
          } 
          else {
              this.mensajes= 'Hubo un error al intentar obtener los servicios contratados. Por favor, intente de nuevo.';
              return;
          }   
      }
      
    );
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
    // if (direction === '') {
    //   this.BONOSVIGENTES = this.BONOS.slice();
    // } else {
    //   this.BONOSVIGENTES = this.BONOS.slice().sort((a, b) => {
    //     const res = compare(a[column], b[column]);
    //     return direction === 'asc' ? res : -res;
    //   });
    // }
  }
    
  goToNotFound() {
    this.router.navigate(['not-found']);
  }

  setCollapsed() {
    for (let index = 0; index < this.serviciosContratados.length; index++) {
      this.serviciosContratados[index]['IS_COLLAPSED'] = true;
    }
  }

  open(content,modal) {
    this.servicioSeleccionado = content;
    this.servicioSeleccionado['inicioEstimado'] = this.obtenerFecha(content.SERE_FECH_INI_ESTIMADA);
    this.servicioSeleccionado['finEstimado'] = this.obtenerFecha(content.SERE_FECH_FIN_ESTIMADA);

    this.servicioSeleccionado['solFecha'] = this.obtenerFecha(content.SOL_FECHA_SERVICIO);
    this.servicioSeleccionado['solRegistro'] = this.obtenerFecha(content.SOL_FECHA_REGISTRO);
    this.modalService.open(modal);
  }
  
  private obtenerFecha(fecha:string){
    let arrayFecha = fecha.split(' ')[0].split('/').reverse();
    arrayFecha[0] = '20'+arrayFecha[0];
    return arrayFecha.join('-');
  }
}
