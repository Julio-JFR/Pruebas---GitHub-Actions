import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginClienteComponent } from './login-cliente.component';


const routes: Routes = [
  {
      path: '', component: LoginClienteComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LoginClienteRoutingModule { }
