import { Component, OnInit } from '@angular/core';

import{TrabajosEnEjecucionService} from './trabajos-en-ejecucion.service';
import {StorageService} from '../../helpers/storage.service';


@Component({
  selector: 'app-trabajos-en-ejecucion',
  templateUrl: './trabajos-en-ejecucion.component.html',
  styleUrls: ['./trabajos-en-ejecucion.component.scss']
})
export class TrabajosEnEjecucionComponent implements OnInit {

  TRABAJOENEJECUCION;

  mostrarAlerta:boolean;
  tipoAlerta:string;
  mensaje:string;
  esInicializadoTrabajoConfirmado: boolean = true;

  Object = Object;
  isLoading:boolean = false;
  alertaMensaje = false;
  constructor(
    private storageService: StorageService,
    private trabajoEjecucionService:TrabajosEnEjecucionService
  ) { }

  ngOnInit(): void {
    this.trabajoEjecucionService.updateHeaders();
    if( this.storageService.hasKey('USER_FEL') || this.storageService.hasKey('MR')  ) { 
      this.TRABAJOENEJECUCION = this.storageService.getObjeto("TRA_CNF");
    } else {
      this.esInicializadoTrabajoConfirmado = false;
    }

    if ( this.storageService.getString("MR")=="1"|| this.storageService.hasKey("USER_FEL")  ){
      this.alertaMensaje = true;
    }
  }


  setCollapsed() {
    this.TRABAJOENEJECUCION['IS_COLLAPSED'] = false;
    this.TRABAJOENEJECUCION['IS_STYLE'] = false;
  }

  obtenerURL(SERE_ID, USU_ID) {
    this.isLoading = true;
    this.storageService.storeString('USE_CRO', 'H2aUzWe$nDjVRji1b5Z&8Y^h!FUJ5m!$I');
    this.storageService.storeString('servRealizadoID', SERE_ID);
    this.storageService.storeString('usuarioID', USU_ID);
  }



}
