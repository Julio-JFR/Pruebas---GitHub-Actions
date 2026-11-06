import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
// tslint:disable-next-line:prefer-mapped-imports
import {TrabajosConfirmadosRoutingModule} from './trabajos-confirmados-routing.module';
// tslint:disable-next-line:prefer-mapped-imports
import { TrabajosConfirmadosComponent } from './trabajos-confirmados.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import {GoogleMapsModule} from '@angular/google-maps';
import {AgmCoreModule} from '@agm/core';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';
import { PageHeaderModule } from '../../shared/modules/page-header/page-header.module';
import { environment } from 'src/environments/environment';
import { AlertaModalModule } from 'src/app/shared/modules/alerta-modal/alerta-modal.module';
import { ComponentsModule } from 'src/app/shared/components/components.module';

@NgModule({
  declarations: [TrabajosConfirmadosComponent],
  imports: [
    CommonModule, GoogleMapsModule, GooglePlaceModule ,
    TrabajosConfirmadosRoutingModule, NgbModule, PageHeaderModule,
    ComponentsModule,
    AgmCoreModule.forRoot(
      {
        apiKey: environment.keyGoogleMaps ,
        libraries: ['places']
      }
    ),
    AlertaModalModule
  ],
  providers: [
    DatePipe
]
})
export class TrabajosConfirmadosModule { }
