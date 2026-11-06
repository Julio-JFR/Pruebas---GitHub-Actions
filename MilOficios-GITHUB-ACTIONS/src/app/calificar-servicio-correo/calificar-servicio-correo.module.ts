import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalificarServicioCorreoRoutingModule } from './calificar-servicio-correo-routing.module';
import { CalificarServicioCorreoComponent } from './calificar-servicio-correo.component';
import { NavbarModule } from '../shared/navbar/navbar.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PageHeaderModule } from '../shared';
import { AlertaModalModule } from '../shared/modules/alerta-modal/alerta-modal.module';



@NgModule({
  declarations: [CalificarServicioCorreoComponent],
  imports: [
    CommonModule,
    CalificarServicioCorreoRoutingModule,NavbarModule,
    FormsModule, ReactiveFormsModule,NgbModule,PageHeaderModule,
    AlertaModalModule
  ]
})
export class CalificarServicioCorreoModule { }
