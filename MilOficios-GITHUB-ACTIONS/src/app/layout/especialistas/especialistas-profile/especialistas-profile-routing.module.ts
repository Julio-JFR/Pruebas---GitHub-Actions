import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EspecialistasProfileComponent } from './especialistas-profile.component';

const routes: Routes = [
    {
        path: '',
        component: EspecialistasProfileComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class EspecialistasProfileRoutingModule { }
