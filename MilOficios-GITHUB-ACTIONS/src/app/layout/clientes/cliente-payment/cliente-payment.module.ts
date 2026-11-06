import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PageHeaderModule } from '../../../shared';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SortableModule } from 'src/app/shared/modules/sortable/sortable.module';
import {ClienteSidebarModule} from '../cliente-sidebar/cliente-sidebar.module';

import { ClientePaymentRoutingModule } from './cliente-payment-routing.module';
import { ClientePaymentComponent } from './cliente-payment.component';
import { AlertaModalModule } from 'src/app/shared/modules/alerta-modal/alerta-modal.module';
import { ComponentsModule } from 'src/app/shared/components/components.module';


@NgModule({
  declarations: [ClientePaymentComponent],
  imports: [
    CommonModule,
    ClientePaymentRoutingModule,PageHeaderModule,
    AlertaModalModule,
    ReactiveFormsModule, FormsModule,
    NgbModule, SortableModule,
    ClienteSidebarModule,
    
    ComponentsModule
  ]
})
export class ClientePaymentModule { }
