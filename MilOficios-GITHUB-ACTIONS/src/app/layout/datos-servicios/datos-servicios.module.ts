import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { DatosServiciosRoutingModule } from './datos-servicios-routing.module';
import { DatosServiciosComponent } from './datos-servicios.component';


import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PageHeaderModule } from '../../shared/modules/page-header/page-header.module';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';
import {AgmCoreModule} from '@agm/core';
import {GoogleMapsModule} from '@angular/google-maps';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import {NgxImageCompressService} from 'ngx-image-compress';


import {DirectivasModule} from '../../shared/directivas/directivas.module';
import { environment } from 'src/environments/environment';
import { AlertaModalModule } from 'src/app/shared/modules/alerta-modal/alerta-modal.module';

@NgModule({
  declarations: [DatosServiciosComponent],
  imports: [
    CommonModule,DirectivasModule,
    DatosServiciosRoutingModule,
    FormsModule, ReactiveFormsModule,
    PageHeaderModule,NgbModule,
    GoogleMapsModule, GooglePlaceModule ,
    AgmCoreModule.forRoot(
      {
        apiKey: environment.keyGoogleMaps ,
        libraries: ['places']
      }
    )
    ,
    AlertaModalModule
  ],
  providers: [NgxImageCompressService, DatePipe]
})
export class DatosServiciosModule { }
