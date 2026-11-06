import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EspecialistasSidebarComponent } from './especialistas-sidebar.component';

const routes: Routes = [
    {
        path: '',
        component: EspecialistasSidebarComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class EspecialistasSidebarRoutingModule { }
