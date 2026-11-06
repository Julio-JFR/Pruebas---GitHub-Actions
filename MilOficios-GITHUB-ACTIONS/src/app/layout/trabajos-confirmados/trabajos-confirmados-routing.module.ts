import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
// tslint:disable-next-line:prefer-mapped-imports
import { TrabajosConfirmadosComponent} from './trabajos-confirmados.component';

const routes: Routes = [
  {
      path: '',
      component:  TrabajosConfirmadosComponent
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TrabajosConfirmadosRoutingModule { }
