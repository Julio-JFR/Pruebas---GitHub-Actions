import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {ClienteMisSolicitudesComponent} from './cliente-mis-solicitudes.component';

const routes: Routes = [
  {
  path: '',
  component: ClienteMisSolicitudesComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClienteMisSolicitudesRoutingModule { }
