import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CambioContrasenaPostRoutingModule } from './cambio-contrasena-post-routing.module';
import { CambioContrasenaPostComponent } from './cambio-contrasena-post.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PageHeaderModule } from 'src/app/shared';
import { PostulanteService } from '../../postulante.service';
import { UsuariosService } from '../../../usuarios/usuarios.service';
import { AlertaModalModule } from 'src/app/shared/modules/alerta-modal/alerta-modal.module';
@NgModule({
  declarations: [CambioContrasenaPostComponent],
  imports: [
    CommonModule,
    CambioContrasenaPostRoutingModule,
    ReactiveFormsModule,
    NgbModule,
    PageHeaderModule,
    AlertaModalModule
  ],
  providers: [PostulanteService, UsuariosService]
})
export class CambioContrasenaPostModule { }
