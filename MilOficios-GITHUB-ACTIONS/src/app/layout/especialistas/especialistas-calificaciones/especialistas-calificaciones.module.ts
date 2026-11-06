import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeaderModule } from '../../../shared';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CalificacionesService } from '../../calificaciones/calificaciones.service';
import { StorageService } from '../../../helpers/storage.service';

import { EspecialistasCalificacionesRoutingModule } from './especialistas-calificaciones-routing.module';
import { EspecialistasCalificacionesComponent } from './especialistas-calificaciones.component';
import { EspecialistasSidebarModule } from '../especialistas-sidebar/especialistas-sidebar.module';
import { AlertaModalModule } from 'src/app/shared/modules/alerta-modal/alerta-modal.module';
import { ComponentsModule } from 'src/app/shared/components/components.module';

@NgModule({
  declarations: [EspecialistasCalificacionesComponent],
  imports: [
    CommonModule,
    EspecialistasCalificacionesRoutingModule,
    PageHeaderModule,
    EspecialistasSidebarModule,
    NgbModule,
    FormsModule
    ,
    AlertaModalModule,
    ComponentsModule
  ],
  providers: [CalificacionesService, StorageService, DatePipe]
})
export class EspecialistasCalificacionesModule { }
