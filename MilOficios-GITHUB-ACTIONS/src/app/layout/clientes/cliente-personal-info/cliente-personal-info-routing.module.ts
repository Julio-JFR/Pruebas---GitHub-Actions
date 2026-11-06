import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {ClientePersonalInfoComponent} from './cliente-personal-info.component';


const routes: Routes = [
  {
      path: '',
      component: ClientePersonalInfoComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClientePersonalInfoRoutingModule { }
