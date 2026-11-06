import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PostulanteSidebarComponent } from './postulante-sidebar.component';

const routes: Routes = [
    {
        path: '',
        component:PostulanteSidebarComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class EspecialistasSidebarRoutingModule { }
