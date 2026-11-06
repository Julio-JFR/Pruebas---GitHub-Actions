import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EspecialistasCalificacionesComponent } from './especialistas-calificaciones.component';

const routes: Routes = [{
  path: '',
  component: EspecialistasCalificacionesComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EspecialistasCalificacionesRoutingModule { }
