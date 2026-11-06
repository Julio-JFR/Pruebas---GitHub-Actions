import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PostulantePersonalInfoComponent } from './postulante-personal-info.component';
import { PostulanteProfileResolver } from '../postulante-profile/postulante-profile.resolver';

const routes: Routes = [
  {
    path: '',
    component:  PostulantePersonalInfoComponent,
    resolve      : {
      postulante: PostulanteProfileResolver,
    }
}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PostulantePersonalInfoRoutingModule { }
