import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {SolicitarServicioComponent} from './solicitar-servicio.component';

const routes: Routes = [
  {
      path: '',
      component:  SolicitarServicioComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SolicitarServicioRoutingModule { }
