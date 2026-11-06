import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {ClienteProfileComponent} from './cliente-profile.component';

const routes: Routes = [
  {
      path: '',
      component: ClienteProfileComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClienteProfileRoutingModule { }
