import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginEspecialistaComponent } from './login-especialista.component';


const routes: Routes = [
  {
      path: '', component: LoginEspecialistaComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LoginEspecialistaRoutingModule { }
