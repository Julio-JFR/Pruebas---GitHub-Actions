import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginPostulanteComponent } from './login-postulante.component';

const routes: Routes = [{
  path: '',
  component: LoginPostulanteComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LoginPostulanteRoutingModule { }
