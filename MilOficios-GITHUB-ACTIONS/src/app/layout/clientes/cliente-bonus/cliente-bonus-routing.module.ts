import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {ClienteBonusComponent} from './cliente-bonus.component';
import { ClienteServiceResolve } from './cliente-bonus.resolver.service';

const routes: Routes = [
  {
      path: '',
      component: ClienteBonusComponent,
      resolve: { simboloMoneda: ClienteServiceResolve}
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClienteBonusRoutingModule { }
