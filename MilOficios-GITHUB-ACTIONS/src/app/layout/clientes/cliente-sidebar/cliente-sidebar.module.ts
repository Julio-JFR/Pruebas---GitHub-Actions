import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';


import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';


import { ClienteSidebarRoutingModule } from './cliente-sidebar-routing.module';
import { ClienteSidebarComponent } from './cliente-sidebar.component';
import { PageHeaderModule } from '../../../shared';
import {ClienteService} from '../cliente.service';


@NgModule({
  declarations: [ClienteSidebarComponent],
  imports: [
    CommonModule,
    ClienteSidebarRoutingModule,
    PageHeaderModule,FormsModule,
    NgbModule,RouterModule
  ],
  exports: [ClienteSidebarComponent],
  providers: [ClienteService]
})
export class ClienteSidebarModule { }
