import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { NgbDropdownModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { LayoutRoutingModule } from './layout-routing.module';
import { LayoutComponent } from './layout.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { HeaderComponent } from './components/header/header.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SortableModule } from '../shared/modules/sortable/sortable.module';
import { PageHeaderModule } from '../shared';
import {RealizarServicioResolver} from './realizar-servicio-resolver/realizarServicio-resolver.service';
import {EspecialistaSidebarResolver} from '../layout/especialistas-resolver/sidebar-resolver.service';
import { PostulanteSidebarResolver } from './postulante/poaSidebar-resolver.service';
import { AlertaModalModule } from '../shared/modules/alerta-modal/alerta-modal.module';
import { ModalPoliticaComponent } from './components/modal-politica/modal-politica.component';

@NgModule({
    imports: [
        CommonModule,
        LayoutRoutingModule,
        TranslateModule,
        NgbDropdownModule,
        FormsModule,
        NgbModule,
        SortableModule,
        PageHeaderModule,
        AlertaModalModule,
        ReactiveFormsModule
    ],
    declarations: [LayoutComponent, SidebarComponent, HeaderComponent, ModalPoliticaComponent],
    providers: [RealizarServicioResolver, EspecialistaSidebarResolver,PostulanteSidebarResolver]
})
export class LayoutModule {}
