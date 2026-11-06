import { Component, OnInit, ViewChild, ViewChildren, ElementRef, QueryList } from '@angular/core';
import { Router, Data, ActivatedRoute } from '@angular/router';
import { sortableDirective, compare } from 'src/app/shared/modules/sortable/sortable.directive';
import { StorageService } from "../../../helpers/storage.service";

import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';


import {ClienteService} from '../cliente.service';
import {BonificacionService} from '../../bonificaciones/bonificacion.service';

import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-cliente-bonus',
  templateUrl: './cliente-bonus.component.html',
  styleUrls: ['./cliente-bonus.component.scss'],
  providers: [NgbModalConfig, NgbModal]
})
export class ClienteBonusComponent implements OnInit {

  ID_CLIENTE = 0;
  BONOS: any[];
  BONOSBD : any[];
  BONOSVIGENTES: any[];
  BONOACTUAL: any;
  MONEDA_CLIENTE: string;
  DURACION: string;
  MENSAJE = 'No se encontraron bonificaciones';

  // Users list is loading
  cargandoDatos: boolean;
  cargandoModal: boolean;

  bonosForm: any;
  monedaForm: any;

  mensaje: any;
  error: any;
  bon_id: number;

  mostrarAlerta = false;
  mensajeModal: string;
  tipoAlerta: string;
  errorModal: boolean;

  SUMA_BONOS_ACTIVOS = 0.0;

  MENSAJE_CONFIRMACION: string;
  TITULO_CONFIRMACION: string;

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;

  @ViewChild('modalConfirmacion') modalConfirmacion: ElementRef;

  // Sortable directive. To get the headers
  @ViewChildren(sortableDirective) headers: QueryList<sortableDirective>;

  constructor(
    private bonificacionService: BonificacionService,
    private router: Router,
    private routeActive: ActivatedRoute,
    config: NgbModalConfig, 
    private modalService: NgbModal,
    private datePipe: DatePipe,
    private clienteService:ClienteService,
    private storageService: StorageService
    ) {
      config.backdrop = 'static';
      config.keyboard = false;
    }

  ngOnInit(): void {
    this.clienteService.updateHeaders();
    this.cargandoDatos = false;
    this.routeActive.data.subscribe((data:Data)=>{
      if(data['simboloMoneda']==null){
        this.tipoAlerta = "danger";
        this.mostrarAlerta = true;
        this.mensaje = "Hubo un error al obtener el símbolo de la moneda del cliente. Por favor, intente de nuevo.";
      }else{
        if(data['simboloMoneda']['Resultado']!=null){
          this.MONEDA_CLIENTE = data['simboloMoneda']['Resultado'];   
        }else{
          this.tipoAlerta = "danger";
          this.mostrarAlerta = true;
          this.mensaje = "Hubo un error al obtener el símbolo de la moneda del cliente. Por favor, intente de nuevo.";
        }
      }
    })
    this.getBonos();
  }

  getBonos() {
    this.cargandoDatos = true;
    this.bonificacionService.listarBonos(Number(localStorage.getItem("USE_ID"))).subscribe(
      (BONOS) => {
        this.SUMA_BONOS_ACTIVOS = 0;
        this.BONOSBD = BONOS['Resultado'].slice(); 
        this.BONOS = this.BONOSBD;
        this.verificarValidez();
        this.cargandoDatos = false;
        this.sumarBonosActivos();
        this.cerrarAlerta();
      },
      (error) => {
        this.cargandoDatos = false;
        this.mostrarAlerta = true;
        this.tipoAlerta = 'danger';

        if (error['error']['error'] !== undefined) {
          if (error['error']['error'] === 'error_noExistenciaDeIdCli') {
            this.mensaje = 'No se pudo obtener las bonificaciones debido a que el cliente ya no se encuentra registrado. Por favor, intente de nuevo.';
          }
          else if (error['error']['error'] === 'error_deBD') {
            this.mensaje = 'Hubo un error al intentar ejecutar su solicitud. Por favor, intente de nuevo.';
          }
          else if (error['error']['error'] === 'error_deCampo') {
            this.mensaje = 'Hubo un error al intentar obtener las bonificaciones. Por favor, intente de nuevo.';
          }
        } 
        else {
            this.mensaje = 'Hubo un error al intentar obtener las bonificaciones. Por favor, intente de nuevo.';
        }
        this.cerrarAlerta();
      }
    );
  }

  obtenerBonoActual(bono){
    this.BONOACTUAL = JSON.parse(JSON.stringify(bono));
  }

  verificarValidez() {
    for (let index = 0; index < this.BONOS.length; index++) {
      const fechaActual = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
      if (this.BONOS[index]['BON_FECH_FIN'] >= fechaActual && this.BONOS[index]['BON_SALDO'] > 0) {
        this.BONOS[index]['IS_VALID'] = true;
        this.BONOS[index]['STATUS'] = 'Activo';
      } else {
        this.BONOS[index]['IS_VALID'] = false;
        this.BONOS[index]['STATUS'] = 'Inactivo';
      }
    }
    this.BONOS = this.BONOS.filter( bono => bono.IS_VALID).slice();
    this.BONOSVIGENTES = this.BONOS.slice();
  }

  sumarBonosActivos() {
    for (let index = 0; index < this.BONOSVIGENTES.length; index++) {
      this.SUMA_BONOS_ACTIVOS += Number(this.BONOSVIGENTES[index].BON_SALDO);
    }
  }

  devolverDinero(){
    this.errorModal = false;
    this.cargandoModal = true;
    this.bonificacionService.devolverDinero(this.bon_id)
    .subscribe( data => {
      this.cargandoModal = false;
      this.getBonos();
      this.modalService.dismissAll();
      this.modalService.open(this.modalConfirmacion);
    }, error => {
      this.errorModal = true;
      this.cargandoModal = false;
      this.mensajeModal = "Ocurrió un error durante su proceso de devolución. Por favor, intente de nuevo.";
    });
  }

  goToNotFound() {
    this.router.navigate(['not-found']);
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
    let BONOSVIGENTES: any[];
    // Sorting users
    if (direction === '') {
      this.BONOSVIGENTES = this.BONOS.slice();
    } else {
      this.BONOSVIGENTES = this.BONOS.slice().sort((a, b) => {
        const res = compare(a[column], b[column]);
        return direction === 'asc' ? res : -res;
      });
    }
  }
  
  /********************* Función para el modal ****************/
  open(content) {
    this.modalService.open(content);
  }

  cerrarAlerta(){
    setTimeout(() => {
      this.mostrarAlerta=false;
    }, 5000);
  }
}
