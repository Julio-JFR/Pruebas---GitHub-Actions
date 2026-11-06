import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DatosJuridicosComponent } from './datos-juridicos.component';

const routes: Routes = [
  {
    path: '',
    component:  DatosJuridicosComponent
}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DatosJuridicosRoutingModule { }
