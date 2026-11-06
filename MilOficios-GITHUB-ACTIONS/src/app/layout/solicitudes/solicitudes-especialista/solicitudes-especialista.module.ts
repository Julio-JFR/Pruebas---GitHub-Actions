import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { SolicitudesEspecialistaRoutingModule } from './solicitudes-especialista-routing.module';
import { PageHeaderModule } from 'src/app/shared';
import { SolicitudesEspecialistaComponent } from './solicitudes-especialista.component';
import { SolicitudesService } from '../solicitudes.service';
import { AgmCoreModule } from '@agm/core';
import { GoogleMapsModule } from '@angular/google-maps';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ServiciosService } from '../../servicios/servicios.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';

import {DirectivasModule} from '../../../shared/directivas/directivas.module';
import { environment } from 'src/environments/environment';
import { AlertaModalModule } from 'src/app/shared/modules/alerta-modal/alerta-modal.module';
import { ComponentsModule } from 'src/app/shared/components/components.module';


@NgModule({
  imports: [
    CommonModule,DirectivasModule,
    SolicitudesEspecialistaRoutingModule,
    PageHeaderModule,
    FormsModule, ReactiveFormsModule,
    NgbModule,
    GoogleMapsModule, 
    GooglePlaceModule,
    ComponentsModule,
    AgmCoreModule.forRoot(
      {
        apiKey: environment.keyGoogleMaps  ,
        libraries: ['places']
      }
    ),
    AlertaModalModule
  ],
  declarations: [SolicitudesEspecialistaComponent],
  providers: [SolicitudesService, DatePipe, ServiciosService]
})
export class SolicitudesEspecialistaModule { }
