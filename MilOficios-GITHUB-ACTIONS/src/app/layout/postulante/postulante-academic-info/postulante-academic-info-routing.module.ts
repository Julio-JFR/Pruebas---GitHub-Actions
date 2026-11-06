import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PostulanteProfileResolver } from '../postulante-profile/postulante-profile.resolver';
import { PostulanteAcademicInfoComponent } from './postulante-academic-info.component';

const routes: Routes = [
  {
    path: '',
    component:  PostulanteAcademicInfoComponent,
    resolve      : {
      postulante: PostulanteProfileResolver,
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AcademicInfoRoutingModule { }
