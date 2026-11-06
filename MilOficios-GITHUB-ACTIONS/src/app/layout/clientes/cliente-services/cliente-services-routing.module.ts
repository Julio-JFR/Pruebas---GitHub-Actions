import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


import {ClienteServicesComponent} from './cliente-services.component';

const routes: Routes = [
  {
      path: '',
      component: ClienteServicesComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClienteServicesRoutingModule { }
