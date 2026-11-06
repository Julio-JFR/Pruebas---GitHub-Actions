import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CalificarServicioRoutingModule } from './calificar-servicio-routing.module';
import { CalificarServicioComponent } from './calificar-servicio.component';
import { NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { PageHeaderModule } from '../../../../shared/modules/page-header/page-header.module';
import { AlertaModalModule } from 'src/app/shared/modules/alerta-modal/alerta-modal.module';
@NgModule({
  declarations: [CalificarServicioComponent],
  imports: [
    CommonModule,
    CalificarServicioRoutingModule,
    PageHeaderModule, NgbModule,
    FormsModule, ReactiveFormsModule,
    AlertaModalModule
  ]
})
export class CalificarServicioModule { }
