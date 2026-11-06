import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeaderModule } from '../../../shared';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SortableModule } from 'src/app/shared/modules/sortable/sortable.module';
import { EspecialistasSidebarRoutingModule } from './especialistas-sidebar-routing.module';
import { EspecialistasService } from '../especialistas.service';
import { PaisesService } from '../../paises/paises.service';
import { RegionesService } from '../../regiones/regiones.service';
import { ProvinciasService } from '../../provincias/provincias.service';
import { DistritosService } from '../../distritos/distritos.service';
import { EspecialistasSidebarComponent } from './especialistas-sidebar.component';
import { RouterModule } from '@angular/router';
import { AlertaModalModule } from 'src/app/shared/modules/alerta-modal/alerta-modal.module';

@NgModule({
    imports: [CommonModule, EspecialistasSidebarRoutingModule, PageHeaderModule, FormsModule, NgbModule, SortableModule, RouterModule,
        AlertaModalModule],
    declarations: [EspecialistasSidebarComponent],
    exports: [EspecialistasSidebarComponent],
    providers: [EspecialistasService, PaisesService, RegionesService, ProvinciasService, DistritosService]
})
export class EspecialistasSidebarModule { }
