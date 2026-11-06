import { NgModule } from '@angular/core';
import { CommonModule,DatePipe } from '@angular/common';

import { PageHeaderModule } from '../../../shared';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SortableModule } from 'src/app/shared/modules/sortable/sortable.module';
import {ClienteSidebarModule} from '../cliente-sidebar/cliente-sidebar.module';

import { ClienteBonusRoutingModule } from './cliente-bonus-routing.module';
import { ClienteBonusComponent } from './cliente-bonus.component';
import { ClienteServiceResolve } from './cliente-bonus.resolver.service';
import { AlertaModalModule } from 'src/app/shared/modules/alerta-modal/alerta-modal.module';
import { ComponentsModule } from 'src/app/shared/components/components.module';

@NgModule({
  declarations: [ClienteBonusComponent],
  imports: [
    CommonModule,
    ClienteBonusRoutingModule,PageHeaderModule,
    ReactiveFormsModule, FormsModule,
    NgbModule, SortableModule,
    ClienteSidebarModule,
    AlertaModalModule,
    ComponentsModule
  ],
  providers: [DatePipe, ClienteServiceResolve]
})
export class ClienteBonusModule { }
