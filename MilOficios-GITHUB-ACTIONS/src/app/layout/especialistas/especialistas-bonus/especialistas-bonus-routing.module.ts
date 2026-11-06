import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EspecialistasBonusComponent } from './especialistas-bonus.component';

const routes: Routes = [
    {
        path: '',
        component: EspecialistasBonusComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class EspecialistasBonusRoutingModule { }
