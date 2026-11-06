import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginPostulanteMovilComponent } from './login-postulante-movil.component';


const routes: Routes = [
  {
    path: '',
    component: LoginPostulanteMovilComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LoginPostulanteMovilRoutingModule { }
