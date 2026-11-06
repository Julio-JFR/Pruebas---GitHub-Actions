import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CalificarServicioComponent } from './calificar-servicio.component';


const routes: Routes = [
  {
  path: '',
  component: CalificarServicioComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CalificarServicioRoutingModule { }
