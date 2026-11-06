import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PostulanteComponent } from './postulante.component';

const routes: Routes = [{
  path: '',
  component: PostulanteComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PostulanteRoutingModule { }
