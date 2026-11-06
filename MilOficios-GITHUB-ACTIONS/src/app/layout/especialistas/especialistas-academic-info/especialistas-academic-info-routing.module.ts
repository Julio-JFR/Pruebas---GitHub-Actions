import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EspecialistasAcademicInfoComponent } from './especialistas-academic-info.component';

const routes: Routes = [
    {
        path: '',
        component: EspecialistasAcademicInfoComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class EspecialistasAcademicInfoRoutingModule { }
