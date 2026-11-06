import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SolicitudesEspecialistaComponent } from './solicitudes-especialista.component';
import { ServiciosResolver } from './solicitudes-especialista.resolvers';


const routes: Routes = [
  {
      path: '',
      component: SolicitudesEspecialistaComponent,
      resolve      : {
        servicios: ServiciosResolver,
      }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SolicitudesEspecialistaRoutingModule { }
