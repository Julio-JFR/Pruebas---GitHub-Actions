import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ClientePersonalInfoRoutingModule } from './cliente-personal-info-routing.module';
import { ClientePersonalInfoComponent } from './cliente-personal-info.component';


import { PageHeaderModule } from '../../../shared';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SortableModule } from 'src/app/shared/modules/sortable/sortable.module';
import {ClienteSidebarModule} from '../cliente-sidebar/cliente-sidebar.module';


import { PaisesService } from '../../paises/paises.service';
import { RegionesService } from '../../regiones/regiones.service';
import { ProvinciasService } from '../../provincias/provincias.service';
import { DistritosService } from '../../distritos/distritos.service';
import { AlertaModalModule } from 'src/app/shared/modules/alerta-modal/alerta-modal.module';
import { ComponentsModule } from 'src/app/shared/components/components.module';


@NgModule({
  declarations: [ClientePersonalInfoComponent],
  imports: [
    CommonModule,PageHeaderModule,
    ClientePersonalInfoRoutingModule,ReactiveFormsModule,
    FormsModule, NgbModule, SortableModule,
    AlertaModalModule,
    ClienteSidebarModule,
    ComponentsModule
  ],
  providers: [
    PaisesService, 
    RegionesService, 
    ProvinciasService, 
    DistritosService,
    DatePipe
  ]
})
export class ClientePersonalInfoModule { }
