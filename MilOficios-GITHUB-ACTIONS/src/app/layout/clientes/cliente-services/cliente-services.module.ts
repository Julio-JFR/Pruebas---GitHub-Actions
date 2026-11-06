import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { PageHeaderModule } from '../../../shared';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SortableModule } from 'src/app/shared/modules/sortable/sortable.module';
import {ClienteSidebarModule} from '../cliente-sidebar/cliente-sidebar.module';


import { ClienteServicesRoutingModule } from './cliente-services-routing.module';
import { ClienteServicesComponent } from './cliente-services.component';
import { AlertaModalModule } from 'src/app/shared/modules/alerta-modal/alerta-modal.module';
import { ComponentsModule } from 'src/app/shared/components/components.module';


@NgModule({
  declarations: [ClienteServicesComponent],
  imports: [
    CommonModule,
    ClienteServicesRoutingModule,PageHeaderModule,
    ReactiveFormsModule, FormsModule,
    NgbModule, SortableModule,
    ClienteSidebarModule,
    AlertaModalModule,
    
    ComponentsModule
  ],
  providers:[DatePipe]
})
export class ClienteServicesModule { }
