import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {ClienteSidebarComponent} from './cliente-sidebar.component';

const routes: Routes = [
  {
      path: '',
      component: ClienteSidebarComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClienteSidebarRoutingModule { }
