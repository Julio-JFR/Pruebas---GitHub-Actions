import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EspecialistasServicesComponent } from './especialistas-services.component';

const routes: Routes = [
    {
        path: '',
        component: EspecialistasServicesComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class EspecialistasServicesRoutingModule { }
