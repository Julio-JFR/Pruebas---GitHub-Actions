import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EspecialistasWorkingInfoComponent } from './especialistas-working-info.component';

const routes: Routes = [
    {
        path: '',
        component: EspecialistasWorkingInfoComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class EspecialistasWorkingInfoRoutingModule { }
