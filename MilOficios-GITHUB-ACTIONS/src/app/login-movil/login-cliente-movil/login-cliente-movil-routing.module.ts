import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginClienteMovilComponent } from './login-cliente-movil.component';


const routes: Routes = [
  {
    path: '',
    component: LoginClienteMovilComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LoginClienteMovilRoutingModule { }
