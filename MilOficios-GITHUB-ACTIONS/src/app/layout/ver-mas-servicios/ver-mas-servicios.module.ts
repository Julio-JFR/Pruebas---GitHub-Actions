import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VerMasServiciosRoutingModule } from './ver-mas-servicios-routing.module';
import { PageHeaderModule } from '../../shared/modules/page-header/page-header.module';
import { VerMasServiciosComponent } from './ver-mas-servicios.component';
import{SharedPipesModule} from '../../shared/pipes/shared-pipes.module'
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import {DirectivasModule} from '../../shared/directivas/directivas.module';
import { AlertaModalModule } from 'src/app/shared/modules/alerta-modal/alerta-modal.module';
@NgModule({
  declarations: [VerMasServiciosComponent],
  imports: [
    CommonModule,
    PageHeaderModule,
    VerMasServiciosRoutingModule,
    SharedPipesModule,
    FormsModule,
    NgbModule,
    DirectivasModule,
    AlertaModalModule
  ]
})
export class VerMasServiciosModule { }
