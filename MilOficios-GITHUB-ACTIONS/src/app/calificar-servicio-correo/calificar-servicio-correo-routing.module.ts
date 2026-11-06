import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CalificarServicioCorreoComponent } from './calificar-servicio-correo.component';


const routes: Routes = [{
  path: '',
  component: CalificarServicioCorreoComponent
  }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CalificarServicioCorreoRoutingModule { }
