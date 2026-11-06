import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PostulanteProfileComponent } from './postulante-profile.component';
import { PostulanteProfileResolver } from './postulante-profile.resolver';

const routes: Routes = [
  {
    path: '',
    component:  PostulanteProfileComponent,
    resolve      : {
      postulante: PostulanteProfileResolver,
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PostulanteProfileRoutingModule { }
