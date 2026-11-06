import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { PageHeaderModule } from '../../../shared';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SortableModule } from 'src/app/shared/modules/sortable/sortable.module';
import { EspecialistasServicesRoutingModule } from './especialistas-services-routing.module';
import { EspecialistasService } from '../especialistas.service';
import { PaisesService } from '../../paises/paises.service';
import { RegionesService } from '../../regiones/regiones.service';
import { ProvinciasService } from '../../provincias/provincias.service';
import { DistritosService } from '../../distritos/distritos.service';
import { EspecialistasServicesComponent } from './especialistas-services.component';
import { EspecialistasSidebarModule } from '../especialistas-sidebar/especialistas-sidebar.module';
import { ServicioRealizadoService } from '../../servicios/servicios-realizados/servicio-realizado.service';
import { AlertaModalModule } from 'src/app/shared/modules/alerta-modal/alerta-modal.module';
import { ComponentsModule } from 'src/app/shared/components/components.module';
@NgModule({
    imports: [CommonModule, EspecialistasServicesRoutingModule, PageHeaderModule, FormsModule, NgbModule, SortableModule, EspecialistasSidebarModule,
        AlertaModalModule,
        ComponentsModule
    ],
    declarations: [EspecialistasServicesComponent],
    providers: [EspecialistasService, PaisesService, RegionesService, ProvinciasService, DistritosService, ServicioRealizadoService, DatePipe]
})
export class EspecialistasServicesModule { }
