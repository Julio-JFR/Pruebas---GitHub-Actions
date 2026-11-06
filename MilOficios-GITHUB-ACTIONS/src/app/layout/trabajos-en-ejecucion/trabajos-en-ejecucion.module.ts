import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


import { TrabajosEnEjecucionRoutingModule } from './trabajos-en-ejecucion-routing.module';
import { TrabajosEnEjecucionComponent } from './trabajos-en-ejecucion.component';


import { PageHeaderModule } from '../../shared/modules/page-header/page-header.module';
import {GoogleMapsModule} from '@angular/google-maps';
import {AgmCoreModule} from '@agm/core';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { environment } from 'src/environments/environment';
import { AlertaModalModule } from 'src/app/shared/modules/alerta-modal/alerta-modal.module';
import { ComponentsModule } from 'src/app/shared/components/components.module';



@NgModule({
  declarations: [TrabajosEnEjecucionComponent],
  imports: [
    CommonModule, TrabajosEnEjecucionRoutingModule,
    GoogleMapsModule, GooglePlaceModule ,NgbModule, PageHeaderModule,
    ComponentsModule,
    AgmCoreModule.forRoot(
      {
        apiKey: environment.keyGoogleMaps ,
        libraries: ['places']
      }
    ),
    AlertaModalModule
  ]
})
export class TrabajosEnEjecucionModule { }
