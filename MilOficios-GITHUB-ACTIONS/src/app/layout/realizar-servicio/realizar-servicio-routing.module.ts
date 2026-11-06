import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RealizarServicioComponent } from './realizar-servicio.component';
const routes: Routes = [
  {
      path: '',
      component:  RealizarServicioComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class RealizarServicioRoutingModule { }
