import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { VerMasServiciosComponent } from './ver-mas-servicios.component';


const routes: Routes = [
      {
      path: '',
      component:  VerMasServiciosComponent
      }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VerMasServiciosRoutingModule { }
