import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CambioContrasenaRoutingModule } from './cambio-contrasena-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { CambioContrasenaComponent } from './cambio-contrasena.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PageHeaderModule } from 'src/app/shared';
import { AlertaModalModule } from 'src/app/shared/modules/alerta-modal/alerta-modal.module';


@NgModule({
  declarations: [CambioContrasenaComponent],
  imports: [
    CommonModule,
    CambioContrasenaRoutingModule,
    ReactiveFormsModule,
    NgbModule,
    PageHeaderModule,
    AlertaModalModule
  ]
})
export class CambioContrasenaModule { }
