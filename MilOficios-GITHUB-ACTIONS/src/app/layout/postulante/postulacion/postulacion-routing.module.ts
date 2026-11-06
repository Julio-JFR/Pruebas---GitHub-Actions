import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PostulacionComponent } from './postulacion.component';

const routes: Routes = [{
  path: '',
  component: PostulacionComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PostulacionRoutingModule { }
