import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CambioContrasenaPostComponent } from './cambio-contrasena-post.component'

const routes: Routes = [{
      path: '',
      component:  CambioContrasenaPostComponent
    }
  ];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CambioContrasenaPostRoutingModule { }
