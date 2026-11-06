import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PageHeaderModule } from '../../../shared';
import { PostulanteSidebarModule } from '../postulante-sidebar/postulante-sidebar.module';
import { AcademicInfoRoutingModule } from './postulante-academic-info-routing.module';
import { PostulanteAcademicInfoComponent } from './postulante-academic-info.component';
import { DirectivasModule } from 'src/app/shared/directivas/directivas.module';
import { AlertaModalModule } from 'src/app/shared/modules/alerta-modal/alerta-modal.module';
import { ComponentsModule } from 'src/app/shared/components/components.module';


@NgModule({
  declarations: [PostulanteAcademicInfoComponent],
  imports: [
    CommonModule,
    AcademicInfoRoutingModule,
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
export class PostulanteAcademicInfoModule { }
