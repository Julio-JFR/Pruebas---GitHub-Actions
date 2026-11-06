import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginEspecialistaMovilComponent } from './login-especialista-movil.component';


const routes: Routes = [
  {
    path: '',
    component: LoginEspecialistaMovilComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LoginEspecialistaMovilRoutingModule { }
