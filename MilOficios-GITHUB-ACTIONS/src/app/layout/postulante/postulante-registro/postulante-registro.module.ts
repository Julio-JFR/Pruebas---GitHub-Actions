import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostulanteRegistroComponent } from './postulante-registro.component';
import {PostulanteRegistroRoutingModule} from './postulante-registro-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PageHeaderModule } from '../../../shared/modules/page-header/page-header.module';
import { DatePipe } from '@angular/common';
import { ImageCropperModule } from 'ngx-image-cropper';
import { TipoEmpresaService } from '../../tipo-empresa/tipo-empresa.service'
import { AlertaModalModule } from 'src/app/shared/modules/alerta-modal/alerta-modal.module';
@NgModule({
  declarations: [PostulanteRegistroComponent],
  imports: [
    CommonModule, PostulanteRegistroRoutingModule,
    FormsModule, ReactiveFormsModule,
    AlertaModalModule,
    NgbModule, PageHeaderModule, ImageCropperModule
  ],
  providers: [ DatePipe, TipoEmpresaService]
})
export class PostulanteRegistroModule { }
