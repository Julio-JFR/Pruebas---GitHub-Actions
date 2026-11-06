import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CambioContrasenaComponent } from './cambio-contrasena.component';


const routes: Routes = [
  {
    path: '',
    component:  CambioContrasenaComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CambioContrasenaRoutingModule { }
