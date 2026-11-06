import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { PageHeaderModule } from '../../../shared';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SortableModule } from 'src/app/shared/modules/sortable/sortable.module';
import { EspecialistasPersonalInfoRoutingModule } from './especialistas-personal-info-routing.module';
import { EspecialistasService } from '../especialistas.service';
import { PaisesService } from '../../paises/paises.service';
import { RegionesService } from '../../regiones/regiones.service';
import { ProvinciasService } from '../../provincias/provincias.service';
import { DistritosService } from '../../distritos/distritos.service';
import { EspecialistasPersonalInfoComponent } from './especialistas-personal-info.component';
import { EspecialistasSidebarModule } from '../especialistas-sidebar/especialistas-sidebar.module';
import { AlertaModalModule } from 'src/app/shared/modules/alerta-modal/alerta-modal.module';
import { ComponentsModule } from 'src/app/shared/components/components.module';

@NgModule({
    imports: [
        CommonModule, 
        EspecialistasPersonalInfoRoutingModule, 
        PageHeaderModule, 
        FormsModule, 
        NgbModule, 
        SortableModule,
        ReactiveFormsModule,
        EspecialistasSidebarModule,
        AlertaModalModule,
        ComponentsModule
    ],
    declarations: [EspecialistasPersonalInfoComponent],
    providers: [
        EspecialistasService, 
        PaisesService, 
        RegionesService, 
        ProvinciasService, 
        DistritosService,
        DatePipe
    ]
})
export class EspecialistasPersonalInfoModule { }
