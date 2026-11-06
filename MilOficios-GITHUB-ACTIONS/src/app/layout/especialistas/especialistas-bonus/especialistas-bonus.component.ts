import { Component, OnInit, ViewChild, ViewChildren, ElementRef, QueryList } from '@angular/core';
import { Router } from '@angular/router';
import { EspecialistasService } from '../especialistas.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DatePipe } from '@angular/common';
import { SolicitudPagoService } from '../../solicitudes-pagos/solicitud-pago.service';

import { StorageService } from 'src/app/helpers/storage.service';
import { sortableDirective, compare } from 'src/app/shared/modules/sortable/sortable.directive';
import { forkJoin, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-especialistas-bonus',
  templateUrl: './especialistas-bonus.component.html',
  styleUrls: ['./especialistas-bonus.component.scss']
})
export class EspecialistasBonusComponent implements OnInit {

  ESPECIALISTA_ID = 0;
  MONEDA_ESPECIALISTA = [];
  BONOSBD : any[];
  BONOS: any[] = [];
  BONOSVIGENTES: any[];
  listaBonosVigentesAuxiliar: any[] = [];
  BONOACTUAL: any;
  BONO: any;
  EXISTEN_BONUS = true;
  DURACION: string;
  MENSAJE = 'No se encontraron bonificaciones';
  SUMA_BONOS_ACTIVOS = 0.0;

  cargandoDatos: boolean;
  OPCION_FILTRO_TABLA: number = 4;
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;

  mostrarAlerta = false;
  mostrarAlertaModal = false;
  mostrarAlertaActualizar = false;
  tipoAlerta: string;
  tipoAlertaModal: string;
  tipoAlertaActualizar: string;
  mensajes:string = "";
  mensajesModal = [];

  idBonoCobrar = 0;
  comentarioPago: string = "";
  idsBonoPendientesPago = [];

  solicitudPendiente: string;

  DOMINIO = environment.domain_url;

  /******************** Variables de errores y carga para el pago modal****************************/
  errorModal: boolean;
  errorMensajeModal: string = "";
  loadingPago: boolean = false;

  MENSAJE_CONFIRMACION: string;
  TITULO_CONFIRMACION: string;
  pagoSeleccionado;
  // Sortable directive. To get the headers
  @ViewChildren(sortableDirective) headers: QueryList<sortableDirective>;

  @ViewChild('modalCuentaBancaria') modalCuentaBancaria: ElementRef;

  constructor(
    private especialistasService: EspecialistasService,
    private router: Router,
    private modalService: NgbModal,
    private solicitudPagoService: SolicitudPagoService,
    private storageService: StorageService,
    public modal: NgbModal,
    private datePipe: DatePipe
    ) { }

  ngOnInit(): void {
    this.cargandoDatos = false;
    this.ESPECIALISTA_ID = Number(localStorage.getItem("USE_ID"));
    this.obtenerBonosPendientes(this.ESPECIALISTA_ID);
    this.getMoneda(this.ESPECIALISTA_ID);
  }

  getBonos(id: number) {
    this.cargandoDatos = true;
    this.especialistasService.getBonos(id).subscribe(
      (BONOS) => {
        this.BONOSBD = BONOS['Resultado'].slice(); 
        this.BONOS = this.BONOSBD;
        this.verificarValidez();
        this.cargandoDatos = false;
        this.sumarBonosActivos();
      },
      (error) => {
        this.cargandoDatos = false;
        this.mostrarAlerta = true;
        this.tipoAlerta = 'danger';
        if (error['error']['error'] !== undefined) {
          if (error['error']['error'] === 'error_noExistenciaDeIdEsp') {
            this.mensajes = 'No se pudo obtener las bonificaciones debido a que el especialista ya no se encuentra registrado. Por favor, intente de nuevo.';
          }
          else if (error['error']['error'] === 'error_deBD') {
            this.mensajes = 'Hubo un error al intentar ejecutar su solicitud. Por favor, intente de nuevo.';
          }
          else if (error['error']['error'] === 'error_deCampo') {
            this.mensajes = 'Hubo un error al intentar obtener las bonificaciones. Por favor, intente de nuevo.';
          }
        } 
        else {
            this.mensajes = 'Hubo un error al intentar obtener las bonificaciones. Por favor, intente de nuevo.';
        }
        this.cerrarAlerta();
      }
    );
  }

  obtenerBonoActual(bono){
    this.BONOACTUAL = JSON.parse(JSON.stringify(bono));
  }

  getMoneda(id: number) {
    this.cargandoDatos = true;
    this.especialistasService.getMoneda(id).subscribe(
      (MONEDA_ESPECIALISTA) => {
        this.MONEDA_ESPECIALISTA = MONEDA_ESPECIALISTA['Resultado'][0];
      },
      (error) => {
        this.cargandoDatos = false;
        this.mostrarAlertaModal = true;
        this.tipoAlertaModal = 'danger';

        if (error['error']['error'] !== undefined) {
          if (error['error']['error'] === 'error_noExistenciaDeIdEsp') {
            this.mensajesModal.push('No se pudo obtener las el tipo de moneda debido a que el especialista ya no se encuentra registrado. Por favor, intente de nuevo.');
          }
          else if (error['error']['error'] === 'error_deBD') {
            this.mensajesModal.push('Hubo un error al intentar ejecutar su solicitud. Por favor, intente de nuevo.');
          }
          else if (error['error']['error'] === 'error_deCampo') {
            this.mensajesModal.push('Hubo un error al intentar obtener el tipo de moneda. Por favor, intente de nuevo.');
          }
        } 
        else {
          this.mensajesModal.push('Hubo un error al intentar obtener el tipo de moneda. Por favor, intente de nuevo.');
        }
      }
    );
  }
  
  goToNotFound() {
    this.router.navigate(['not-found']);
  }
  
  verificarValidez() {
    for (let index = 0; index < this.BONOS.length; index++) {
      const fechaActual = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
      if (this.BONOS[index]['BON_FECH_FIN'] >= fechaActual && this.BONOS[index]['BON_SALDO'] > 0 || (this.BONOS[index]['BON_SALDO'] == 0 && this.BONOS[index]['BON_TIPO'] == 0 )) {//verificar
        //se coloca este código para que los bonos de tipo pago que no se hicieron una solicitud y su fecha de fin ya expiró, entonces que no se muestre
        if(this.BONOS[index]['BON_FECH_FIN'] < fechaActual){
          this.BONOS[index]['IS_VALID'] = false;
          this.BONOS[index]['STATUS'] = 'Inactivo';
        }else{
          this.BONOS[index]['IS_VALID'] = true;
          this.BONOS[index]['STATUS'] = 'Activo';
        }
      } else {
        this.BONOS[index]['IS_VALID'] = false;
        this.BONOS[index]['STATUS'] = 'Inactivo';
      }
    }
    this.BONOS = this.BONOS.filter( bono => bono.IS_VALID).slice();
    this.BONOSVIGENTES = this.BONOS.slice();
  }

  sumarBonosActivos() {
    this.SUMA_BONOS_ACTIVOS = 0;
    for (let index = 0; index < this.BONOSVIGENTES.length; index++) {
      if(this.BONOSVIGENTES[index]['IS_VALID'] || (this.BONOSVIGENTES[index]['BON_TIPO'] == 0 && this.BONOSVIGENTES[index]['BON_TIPO'])){
        this.SUMA_BONOS_ACTIVOS += Number(this.BONOSVIGENTES[index].BON_SALDO);
      }
    }
  }
  
  solicitarPago(){
    this.errorModal = false;
    this.loadingPago = true;
    this.solicitudPagoService.insertarSolicitudPago(parseInt(this.storageService.getString('USE_ID')),this.idBonoCobrar,this.comentarioPago, this.pagoSeleccionado? this.pagoSeleccionado.SOL_PAG_ID : 0)
    .subscribe( data => {
      this.loadingPago = false;
      this.obtenerBonosPendientes(this.ESPECIALISTA_ID);
      this.modal.dismissAll();
    }, error => {
      this.loadingPago = false;
      if (error['error']['error'] !== undefined) {
        if (error['error']['error'] === 'error_deBD') {
          this.errorModal = true;
          this.errorMensajeModal = 'Hubo un error de base de datos al intentar insertar la solicitud de pago. Por favor, intente de nuevo.';
        }
        else if (error['error']['error'] === 'error_deCampo') {
          this.errorModal = true;
          this.errorMensajeModal = 'Los datos ingresados deben respetar los formatos permitidos. Por favor, intente de nuevo.';
        }else if(error['error']['error'] === 'error_noExisten ciaDatos'){
          this.modalService.dismissAll();
          this.modalService.open(this.modalCuentaBancaria);
        }
      } else {
        this.errorModal = true;
        this.errorMensajeModal = 'Hubo un error de conexión. Por favor, intente de nuevo';
      }
      this.cerrarAlerta();
    });
  }
  
  obtenerBonosPendientes(id: number){
    this.cargandoDatos = true;

    const peticion1 = this.solicitudPagoService.obtenerBonosPendientes(parseInt(this.storageService.getString('USE_ID')));
    const peticion2 = this.especialistasService.getBonos(id);

    //ejecutar varias peticiones en paralelo y subscribirse una sola vez
    forkJoin([peticion1,peticion2]).subscribe(
      data => {
        this.cargandoDatos = false;
        this.idsBonoPendientesPago = data[0]['Resultado'];
        this.BONOSBD = data[1]['Resultado'];
        this.BONOS = this.BONOSBD.slice();
        this.verificarValidez();
        this.sumarBonosActivos();
        this.desaparecerIconos();
        this.listaBonosVigentesAuxiliar = this.BONOSVIGENTES.slice();
      }, 
      error => {
        this.cargandoDatos = false;
        this.mostrarAlerta = true;
        if (error['error']['error'] !== undefined) {
          if(error['error']['error'] == "error_deBD"){
            this.mensajes = 'Hubo un error en la base de datos al intentar obtener las bonificaciones. Por favor, intente de nuevo.';
          }else if (error['error']['error'] === 'error_noExistenciaDeIdEsp') {
            this.mensajes = 'No se pudo obtener las bonificaciones debido a que el especialista ya no se encuentra registrado. Por favor, intente de nuevo.';
          }else{
            this.mensajes = 'Hubo un error al intentar obtener las bonificaciones pendientes de cobro. Por favor, intente de nuevo.';
          }
        } 
        else {
            this.mensajes = 'Hubo un error de conexión intentar obtener las bonificaciones pendientes de cobro. Por favor, intente de nuevo.';
        }
        this.cerrarAlerta();
      }
    );
  }

  filtrarTablaBono(){
    this.BONOSVIGENTES = this.listaBonosVigentesAuxiliar.slice();
    if (this.OPCION_FILTRO_TABLA !=4) this.BONOSVIGENTES = this.BONOSVIGENTES.filter(bono => bono['SOL_PAG_ESTADO'] == this.OPCION_FILTRO_TABLA);
  }

  //verifica cuales son los bonos de pago que estan en pendiente, aceptado o rechazado y se le agrega un atributo al arreglo BONOS
  desaparecerIconos(){
    let bonoEncontrado; 
    this.BONOSVIGENTES.map( bono => {
      bonoEncontrado = this.idsBonoPendientesPago.find((objeto)=>{ return objeto.BON_ID == bono.BON_ID});
      if( bonoEncontrado != undefined){
        bono['SOL_PAG_ESTADO'] = bonoEncontrado['SOL_PAG_ESTADO'];
        bono['SOL_MOTIVO_RECHAZO'] = (bonoEncontrado['SOL_PAG_ESTADO'] == 2)?bonoEncontrado['SOL_MOTIVO_RECHAZO']:"";
        bono['SOL_FOTO_ACEPTAR'] = (bonoEncontrado['SOL_FOTO_ACEPTAR'] != null)? this.DOMINIO + bonoEncontrado['SOL_FOTO_ACEPTAR']: null
      }else{
        if(bono['BON_TIPO'] == 0 ){
          bono['SOL_PAG_ESTADO'] = 3;
          bono['SOL_MOTIVO_RECHAZO'] = "";
          bono['SOL_FOTO_ACEPTAR'] = ""
        }else{
          bono['SOL_PAG_ESTADO'] = -1;
          bono['SOL_MOTIVO_RECHAZO'] = "";
          bono['SOL_FOTO_ACEPTAR'] = "";
        }
      }
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
      this.BONOSVIGENTES = this.BONOS.slice();
    } else {
      this.BONOSVIGENTES = this.BONOS.slice().sort((a, b) => {
        const res = compare(a[column], b[column]);
        return direction === 'asc' ? res : -res;
      });
    }
  }

  /********************* Función para el modal ****************/
  open(content,pago?) {
    if (pago){
      const bono = this.idsBonoPendientesPago.filter(bon=> bon.BON_ID == pago.BON_ID && bon.SOL_PAG_ESTADO == pago.SOL_PAG_ESTADO);
      if (bono.length>0)
        this.pagoSeleccionado = bono[0];
    }
    this.modalService.open(content);
    this.comentarioPago='';
  }

  cerrarAlerta(){
    setTimeout(() => {
      this.mostrarAlerta=false;
      this.errorModal=false;
      this.mensajes="";
    }, 5000);
  }
}
