import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EspecialistasPersonalInfoComponent } from './especialistas-personal-info.component';

const routes: Routes = [
    {
        path: '',
        component: EspecialistasPersonalInfoComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class EspecialistasPersonalInfoRoutingModule { }
