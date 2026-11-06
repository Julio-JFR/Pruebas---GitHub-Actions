import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { PageHeaderModule } from '../../../shared';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SortableModule } from 'src/app/shared/modules/sortable/sortable.module';
import { EspecialistasPaymentDetailsRoutingModule } from './especialistas-payment-details-routing.module';
import { EspecialistasService } from '../especialistas.service';
import { PaisesService } from '../../paises/paises.service';
import { RegionesService } from '../../regiones/regiones.service';
import { ProvinciasService } from '../../provincias/provincias.service';
import { DistritosService } from '../../distritos/distritos.service';
import { EspecialistasPaymentDetailsComponent } from './especialistas-payment-details.component';
import { EspecialistasSidebarModule } from '../especialistas-sidebar/especialistas-sidebar.module';
import { AlertaModalModule } from 'src/app/shared/modules/alerta-modal/alerta-modal.module';
import { ComponentsModule } from 'src/app/shared/components/components.module';

@NgModule({
    imports: [
        CommonModule, 
        EspecialistasPaymentDetailsRoutingModule, 
        PageHeaderModule, 
        FormsModule, 
        NgbModule, 
        SortableModule, 
        EspecialistasSidebarModule,
        ReactiveFormsModule,
        AlertaModalModule,
        ComponentsModule

    ],

    declarations: [EspecialistasPaymentDetailsComponent],
    providers: [EspecialistasService, PaisesService, RegionesService, ProvinciasService, DistritosService]
})
export class EspecialistasPaymentDetailsModule { }
