import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClienteRegistroRoutingModule } from './cliente-registro-routing.module';
import { ClienteRegistroComponent } from './cliente-registro.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PageHeaderModule } from '../../../shared/modules/page-header/page-header.module';
import { DatePipe } from '@angular/common';
import { ImageCropperModule } from 'ngx-image-cropper';
import { AlertaModalModule } from 'src/app/shared/modules/alerta-modal/alerta-modal.module';

@NgModule({
  declarations: [ClienteRegistroComponent],
  imports: [
    CommonModule,
    ClienteRegistroRoutingModule,
    FormsModule, ReactiveFormsModule,
    NgbModule, PageHeaderModule, ImageCropperModule
    ,
    AlertaModalModule
  ],
  providers: [ DatePipe]
})
export class ClienteRegistroModule { }
