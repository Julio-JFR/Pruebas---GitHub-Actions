import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ClienteMisSolicitudesRoutingModule } from './cliente-mis-solicitudes-routing.module';
import { ClienteMisSolicitudesComponent } from './cliente-mis-solicitudes.component';

import { PageHeaderModule } from '../../../shared';
import { ServicioRealizadoService } from '../../servicios/servicios-realizados/servicio-realizado.service'; // TEMPORAL
import { NgbModule, NgbTooltipModule} from '@ng-bootstrap/ng-bootstrap';

import { TarjetaService } from '../../tarjetas/tarjeta.service';
import { CulqiServiceService } from '../../culqi/culqi-service.service';

import {DirectivasModule} from '../../../shared/directivas/directivas.module';
import { AlertaModalModule } from 'src/app/shared/modules/alerta-modal/alerta-modal.module';
import { ComponentsModule } from 'src/app/shared/components/components.module';

@NgModule({
  declarations: [ClienteMisSolicitudesComponent],
  imports: [
    CommonModule,DirectivasModule,NgbTooltipModule,
    ClienteMisSolicitudesRoutingModule,
    AlertaModalModule,
    PageHeaderModule, NgbModule, FormsModule, ReactiveFormsModule
  ],
  providers: [ServicioRealizadoService, TarjetaService, CulqiServiceService, DatePipe,
    ComponentsModule]// TEMPORAL
})
export class ClienteMisSolicitudesModule { }
