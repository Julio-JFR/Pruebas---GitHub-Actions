import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


import { ClienteProfileRoutingModule } from './cliente-profile-routing.module';
import { ClienteProfileComponent } from './cliente-profile.component';
import {ClienteSidebarModule} from '../cliente-sidebar/cliente-sidebar.module';
import { PageHeaderModule } from '../../../shared';


import { ImageCropperModule } from 'ngx-image-cropper';
import {NgxImageCompressService} from 'ngx-image-compress';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';


import {DirectivasModule} from '../../../shared/directivas/directivas.module';
import { AlertaModalModule } from 'src/app/shared/modules/alerta-modal/alerta-modal.module';
import { ComponentsModule } from 'src/app/shared/components/components.module';

@NgModule({
  declarations: [ClienteProfileComponent],
  imports: [
    AlertaModalModule,
    CommonModule,PageHeaderModule,NgbModule,
    ClienteProfileRoutingModule, ClienteSidebarModule,
    ImageCropperModule,FormsModule, ReactiveFormsModule,
    DirectivasModule,
    ComponentsModule
  ],
  providers: [NgxImageCompressService]
})
export class ClienteProfileModule { }
