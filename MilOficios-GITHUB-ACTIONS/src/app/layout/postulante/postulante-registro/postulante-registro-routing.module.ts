import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {PostulanteRegistroComponent} from '../postulante-registro/postulante-registro.component';

const routes: Routes = [
  {
      path: '',
      component:  PostulanteRegistroComponent
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PostulanteRegistroRoutingModule { }
