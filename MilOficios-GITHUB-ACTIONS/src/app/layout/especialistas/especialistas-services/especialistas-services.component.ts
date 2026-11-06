import { DatePipe } from '@angular/common';
import { Component, OnInit,  ViewChild, ViewChildren, QueryList } from '@angular/core';
import { Router } from '@angular/router';
import { EspecialistasService } from '../especialistas.service';
import { ServicioRealizadoService } from '../../servicios/servicios-realizados/servicio-realizado.service';
import { sortableDirective, compare } from 'src/app/shared/modules/sortable/sortable.directive';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-especialistas-services',
  templateUrl: './especialistas-services.component.html',
  styleUrls: ['./especialistas-services.component.scss']
})
export class EspecialistasServicesComponent implements OnInit {

  ESPECIALISTA_ID = 0;
  SERVICIOS_REALIZADOS: any[];
  SERVICIOS_REALIZADOSFILTER: any[];
  EXISTEN_SERVICIOS_REALIZADOS = true;
  DURACION: string;
  MENSAJE = 'No se encontraron servicios realizados.';
  MENSAJE_CONFIRMACION = '';
  error: any;

  mensaje="";
  mostrarAlerta = false;
  tipoAlerta = '';

  // Users list is loading
  cargandoDatos: boolean;
  servicioSeleccionado!:any;
  // Pagination
  currentPage = 1;
  itemsPerPage = 5;
  @ViewChildren(sortableDirective) headers: QueryList<sortableDirective>;
  
  constructor(
    private especialistasService: EspecialistasService,
    private servicioRealizadoService: ServicioRealizadoService,
    private modalService: NgbModal,
    private router: Router,
    private datePipe: DatePipe
    ) { }

  ngOnInit(): void {
    this.cargandoDatos = false;  // Si el id se envió como parámetro y es un número entero
    this.ESPECIALISTA_ID = Number(localStorage.getItem("USE_ID"));
    this.getServiciosRealizados(this.ESPECIALISTA_ID);
  }

  getServiciosRealizados(id: number) {
    this.servicioRealizadoService.updateHeaders();
    this.cargandoDatos = true;
    this.servicioRealizadoService.getServiciosRealizados(id).subscribe(
      (SERVICIOS_REALIZADOS) => {
        this.SERVICIOS_REALIZADOS = SERVICIOS_REALIZADOS['Resultado'];
        this.converirFechas();
        this.setCollapsed();
        this.cargandoDatos = false;
        this.SERVICIOS_REALIZADOSFILTER = SERVICIOS_REALIZADOS['Resultado'];;
      },
      (error) => {
        this.cargandoDatos = false;
        this.mostrarAlerta = true;
        this.tipoAlerta = 'danger';
        if (error['error']['error'] !== undefined) {
          if (error['error']['error'] === 'error_noExistenciaDeIdEsp') {
            this.mensaje = 'No se pudo obtener los servicios realizados debido a que el especialista ya no se encuentra registrado. Por favor, intente de nuevo.';
          }
          else if (error['error']['error'] === 'error_deBD') {
            this.mensaje = 'Hubo un error al intentar ejecutar su solicitud para obtener los servicios realizados. Por favor, intente de nuevo.';
          }
          else if (error['error']['error'] === 'error_deCampo') {
            this.mensaje = 'Los datos ingresados deben respetar los formatos permitidos. Por favor, intente de nuevo.';
          }
        } else {
          this.mensaje = 'Hubo un error al intentar obtener los servicios realizados. Por favor, intente de nuevo.';
        }
        this.cerrarAlerta();
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
    if (direction === '') {
      this.SERVICIOS_REALIZADOS = this.SERVICIOS_REALIZADOSFILTER.slice();
    } else {
      this.SERVICIOS_REALIZADOS = this.SERVICIOS_REALIZADOSFILTER.slice().sort((a, b) => {
        const res = compare(a[column], b[column]);
        return direction === 'asc' ? res : -res;
      });
    }
  }
  
  goToNotFound() {
    this.router.navigate(['not-found']);
  }

  setCollapsed() {
    for (let index = 0; index < this.SERVICIOS_REALIZADOS.length; index++) {
      this.SERVICIOS_REALIZADOS[index]['IS_COLLAPSED'] = true;
    }
  }

  converirFechas() {
    for (let index = 0; index < this.SERVICIOS_REALIZADOS.length; index++) {
      let tiempoTranscurrido =  ( new Date(this.SERVICIOS_REALIZADOS[index]['SERE_FECH_FIN_REAL']).getTime() - new Date(this.SERVICIOS_REALIZADOS[index]['SERE_FECH_INI_REAL']).getTime()) / 1000;
      if (this.SERVICIOS_REALIZADOS[index]['SERE_FECH_INI_REAL'] !== '0000-00-00 00:00:00') {
        this.SERVICIOS_REALIZADOS[index]['SERE_FECH_INI_REAL'] = this.datePipe.transform(this.SERVICIOS_REALIZADOS[index]['SERE_FECH_INI_REAL'], 'dd/MM/yy HH:mm');
      }
      if (this.SERVICIOS_REALIZADOS[index]['SERE_FECH_FIN_REAL'] !== '0000-00-00 00:00:00') {
        this.SERVICIOS_REALIZADOS[index]['SERE_FECH_FIN_REAL'] = this.datePipe.transform(this.SERVICIOS_REALIZADOS[index]['SERE_FECH_FIN_REAL'], 'dd/MM/yy HH:mm');
      }
      if (this.SERVICIOS_REALIZADOS[index]['SERE_FECH_INI_ESTIMADA'] !== '0000-00-00 00:00:00') {
        this.SERVICIOS_REALIZADOS[index]['SERE_FECH_INI_ESTIMADA'] = this.datePipe.transform(this.SERVICIOS_REALIZADOS[index]['SERE_FECH_INI_ESTIMADA'], 'dd/MM/yy HH:mm');
      }
      if (this.SERVICIOS_REALIZADOS[index]['SERE_FECH_FIN_ESTIMADA'] !== '0000-00-00 00:00:00') {
        this.SERVICIOS_REALIZADOS[index]['SERE_FECH_FIN_ESTIMADA'] = this.datePipe.transform(this.SERVICIOS_REALIZADOS[index]['SERE_FECH_FIN_ESTIMADA'], 'dd/MM/yy HH:mm');
      }
      if (this.SERVICIOS_REALIZADOS[index]['SOL_FECHA_SERVICIO'] !== '0000-00-00 00:00:00') {
        this.SERVICIOS_REALIZADOS[index]['SOL_FECHA_SERVICIO'] = this.datePipe.transform(this.SERVICIOS_REALIZADOS[index]['SOL_FECHA_SERVICIO'], 'dd/MM/yy HH:mm');
      }
      if (this.SERVICIOS_REALIZADOS[index]['SOL_FECHA_REGISTRO'] !== '0000-00-00 00:00:00') {
        this.SERVICIOS_REALIZADOS[index]['SOL_FECHA_REGISTRO'] = this.datePipe.transform(this.SERVICIOS_REALIZADOS[index]['SOL_FECHA_REGISTRO'], 'dd/MM/yy HH:mm');
      }

      //
      this.SERVICIOS_REALIZADOS[index]['DURACION_DIAS'] = Math.round(tiempoTranscurrido / 86400000);
      tiempoTranscurrido -= ((tiempoTranscurrido / 86400000) * tiempoTranscurrido);
      this.SERVICIOS_REALIZADOS[index]['DURACION_HORAS'] = Math.round(tiempoTranscurrido / 3600000);
      tiempoTranscurrido -= ((tiempoTranscurrido / 3600000) * tiempoTranscurrido);
      this.SERVICIOS_REALIZADOS[index]['DURACION_MINUTOS'] = Math.round(tiempoTranscurrido / 60);
    }
  }

  open(content,modal) {
    this.servicioSeleccionado = content;
    this.servicioSeleccionado['inicioEstimado'] = this.obtenerFecha(content.SERE_FECH_INI_ESTIMADA);
    this.servicioSeleccionado['finEstimado'] = this.obtenerFecha(content.SERE_FECH_FIN_ESTIMADA);

    this.servicioSeleccionado['solFecha'] = this.obtenerFecha(content.SOL_FECHA_SERVICIO);
    this.servicioSeleccionado['solRegistro'] = this.obtenerFecha(content.SOL_FECHA_REGISTRO);

    this.servicioSeleccionado['descripcionDuracion']= this.calcularTiempoDuracion();
    this.modalService.open(modal);
  }

  private calcularTiempoDuracion():string{
    const diasServ = this.servicioSeleccionado['DURACION_DIAS'];
    const horasServ = this.servicioSeleccionado['DURACION_HORAS'];
    const minutosServ = this.servicioSeleccionado['DURACION_MINUTOS'];
    const dias = diasServ!=0 ? (diasServ == 1 ? diasServ+ ' día' : diasServ+' días') : '';
    const horas = horasServ!=0 ? (horasServ == 1 ? horasServ+ ' hora' : horasServ+' horas') : '';
    const minutos = minutosServ!=0 ? (minutosServ == 1 ? minutosServ+ ' minuto' : minutosServ+' minutos') : '';

    return (dias+horas+minutos);
  }
  
  private obtenerFecha(fecha:string){
    let arrayFecha = fecha.split(' ')[0].split('/').reverse();
    arrayFecha[0] = '20'+arrayFecha[0];
    return arrayFecha.join('-');
  }

  cerrarAlerta(){
    setTimeout(() => {
      this.mostrarAlerta=false;
      this.mensaje="";
    }, 5000);
  }
}
