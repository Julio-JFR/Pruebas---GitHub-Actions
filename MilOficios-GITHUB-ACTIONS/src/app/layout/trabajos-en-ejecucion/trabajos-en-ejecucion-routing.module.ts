import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {TrabajosEnEjecucionComponent} from './trabajos-en-ejecucion.component';

const routes: Routes = [
  {
      path: '',
      component:  TrabajosEnEjecucionComponent
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TrabajosEnEjecucionRoutingModule { }
