import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RealizarServicioComponent } from './realizar-servicio.component';
import { RealizarServicioRoutingModule } from './realizar-servicio-routing.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PageHeaderModule } from '../../shared/modules/page-header/page-header.module';

import {DirectivasModule} from '../../shared/directivas/directivas.module';
import { AlertaModalModule } from 'src/app/shared/modules/alerta-modal/alerta-modal.module';
@NgModule({
  declarations: [RealizarServicioComponent],
  imports: [
    CommonModule,DirectivasModule,
    FormsModule, PageHeaderModule,
    ReactiveFormsModule,
    RealizarServicioRoutingModule,
    NgbModule,
    AlertaModalModule
  ]
})
export class RealizarServicioModule { }
