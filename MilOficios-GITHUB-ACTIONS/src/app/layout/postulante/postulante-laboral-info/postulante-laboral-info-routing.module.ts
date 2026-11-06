import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PostulanteProfileResolver } from '../postulante-profile/postulante-profile.resolver';
import { PostulanteLaboralInfoComponent } from './postulante-laboral-info.component';

const routes: Routes = [
  {
    path: '',
    component:  PostulanteLaboralInfoComponent,
    resolve      : {
      postulante: PostulanteProfileResolver,
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LaboralInfoRoutingModule { }
