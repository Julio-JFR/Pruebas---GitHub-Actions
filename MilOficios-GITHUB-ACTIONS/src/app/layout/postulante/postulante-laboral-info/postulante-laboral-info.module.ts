import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LaboralInfoRoutingModule } from './postulante-laboral-info-routing.module';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PageHeaderModule } from '../../../shared';
import { PostulanteSidebarModule } from '../postulante-sidebar/postulante-sidebar.module';
import { DirectivasModule } from 'src/app/shared/directivas/directivas.module';
import { PostulanteLaboralInfoComponent } from './postulante-laboral-info.component';
import { AlertaModalModule } from 'src/app/shared/modules/alerta-modal/alerta-modal.module';
import { ComponentsModule } from 'src/app/shared/components/components.module';


@NgModule({
  declarations: [PostulanteLaboralInfoComponent],
  imports: [
    CommonModule,LaboralInfoRoutingModule,
    
    DirectivasModule,
    PageHeaderModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    ComponentsModule,
    PostulanteSidebarModule,
    AlertaModalModule
  ]
})
export class PostulanteLaboralInfoModule { }
