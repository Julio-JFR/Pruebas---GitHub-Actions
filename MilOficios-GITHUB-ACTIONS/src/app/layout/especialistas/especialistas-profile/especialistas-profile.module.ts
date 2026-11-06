import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { PageHeaderModule } from '../../../shared';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SortableModule } from 'src/app/shared/modules/sortable/sortable.module';
import { EspecialistasProfileRoutingModule } from './especialistas-profile-routing.module';
import { EspecialistasService } from '../especialistas.service';
import { PaisesService } from '../../paises/paises.service';
import { RegionesService } from '../../regiones/regiones.service';
import { ProvinciasService } from '../../provincias/provincias.service';
import { DistritosService } from '../../distritos/distritos.service';
import { ServiciosService } from '../../servicios/servicios.service';
import { CategoriasService } from '../../servicios/categorias/categorias.service';
import { EspecialistasProfileComponent } from './especialistas-profile.component';
import { EspecialistasSidebarModule } from '../especialistas-sidebar/especialistas-sidebar.module';
import { ImageCropperModule } from 'ngx-image-cropper';


import {DirectivasModule} from '../../../shared/directivas/directivas.module';
import { AlertaModalModule } from 'src/app/shared/modules/alerta-modal/alerta-modal.module';
import { ComponentsModule } from 'src/app/shared/components/components.module';

@NgModule({
    imports: [
        CommonModule,DirectivasModule,
        EspecialistasProfileRoutingModule,
        PageHeaderModule,
        FormsModule,
        NgbModule,
        SortableModule,
        ReactiveFormsModule,
        AlertaModalModule,
        EspecialistasSidebarModule,
        ImageCropperModule,
        ComponentsModule
    ],
    declarations: [EspecialistasProfileComponent],
    providers: [EspecialistasService,
                PaisesService,
                RegionesService,
                ProvinciasService,
                DistritosService,
                ServiciosService,
                CategoriasService,
                DatePipe]
})
export class EspecialistasProfileModule { }
