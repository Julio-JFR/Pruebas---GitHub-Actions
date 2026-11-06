import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


import { SolicitarServicioRoutingModule } from './solicitar-servicio-routing.module';
import { SolicitarServicioComponent } from './solicitar-servicio.component';
import { PageHeaderModule } from '../../shared/modules/page-header/page-header.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';


import {DirectivasModule} from '../../shared/directivas/directivas.module';
import { AlertaModalModule } from 'src/app/shared/modules/alerta-modal/alerta-modal.module';
@NgModule({
  declarations: [SolicitarServicioComponent],
  imports: [
    CommonModule,  PageHeaderModule,
    SolicitarServicioRoutingModule, NgbModule,
    FormsModule, DirectivasModule,
    AlertaModalModule
  ]
})
export class SolicitarServicioModule { }
