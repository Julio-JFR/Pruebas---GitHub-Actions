import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';

import { PostulacionRoutingModule } from './postulacion-routing.module';
import { PostulacionComponent } from './postulacion.component';
import { PostulacionService } from './postulacion.service';
import { PageHeaderModule } from '../../../shared';
import { AlertaModalModule } from 'src/app/shared/modules/alerta-modal/alerta-modal.module';

@NgModule({
  declarations: [PostulacionComponent],
  imports: [
    CommonModule,
    PostulacionRoutingModule,
    PageHeaderModule,
    NgbModule,
    FormsModule,
    AlertaModalModule
  ],
  providers: [PostulacionService]
})
export class PostulacionModule { }
