import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {DatosServiciosComponent} from './datos-servicios.component';

const routes: Routes = [
  {
    path: '',
    component:  DatosServiciosComponent
}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DatosServiciosRoutingModule { }
