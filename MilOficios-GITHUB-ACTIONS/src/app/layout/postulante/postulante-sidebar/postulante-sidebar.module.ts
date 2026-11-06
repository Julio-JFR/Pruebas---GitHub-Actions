import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeaderModule } from '../../../shared';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SortableModule } from 'src/app/shared/modules/sortable/sortable.module';
import { EspecialistasSidebarRoutingModule } from './postulante-sidebar-routing.module';
import { PaisesService } from '../../paises/paises.service';
import { RegionesService } from '../../regiones/regiones.service';
import { ProvinciasService } from '../../provincias/provincias.service';
import { DistritosService } from '../../distritos/distritos.service';
import { RouterModule } from '@angular/router';
import { PostulanteService } from '../postulante.service';
import { PostulanteSidebarComponent } from './postulante-sidebar.component';

@NgModule({
    imports: [CommonModule, EspecialistasSidebarRoutingModule, PageHeaderModule, FormsModule, NgbModule, SortableModule, RouterModule],
    declarations: [PostulanteSidebarComponent],
    exports: [PostulanteSidebarComponent],
    providers: [PostulanteService, PaisesService, RegionesService, ProvinciasService, DistritosService]
})
export class PostulanteSidebarModule { }
