import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ImageCropperModule } from 'ngx-image-cropper';

import { PageHeaderModule } from '../../../shared';
import { PostulacionService } from '../postulacion/postulacion.service';
import { PostulanteService } from '../postulante.service';
import { EstudiosService } from '../../estudios/estudios.service';
import { PaisesService } from '../../paises/paises.service';
import { RegionesService } from '../../regiones/regiones.service';
import { ProvinciasService } from '../../provincias/provincias.service';
import { DistritosService } from '../../distritos/distritos.service';
import { UsuariosService } from '../../usuarios/usuarios.service';
import { ExperienciasLaboralesService } from '../../experiencias-laborales/experiencias-laborales.service';
import { AuthService } from '../../../shared/guard/auth.service';

import {NgxImageCompressService} from 'ngx-image-compress';

import {DirectivasModule} from '../../../shared/directivas/directivas.module';
import { PostulanteSidebarModule } from '../postulante-sidebar/postulante-sidebar.module';
import { PostulanteProfileComponent } from './postulante-profile.component';
import { PostulanteProfileRoutingModule } from './postulante-profile-routing.module';
import { AlertaModalModule } from 'src/app/shared/modules/alerta-modal/alerta-modal.module';
import { ComponentsModule } from 'src/app/shared/components/components.module';

@NgModule({
  declarations: [PostulanteProfileComponent],
  imports: [
    CommonModule, DirectivasModule,
    PostulanteProfileRoutingModule,
    PageHeaderModule,
    FormsModule,
    ComponentsModule,
    ReactiveFormsModule,
    NgbModule,
    ImageCropperModule,
    PostulanteSidebarModule,
    AlertaModalModule
  ],
  providers: [PostulanteService, PostulacionService, EstudiosService, ExperienciasLaboralesService,
          PaisesService, 
          RegionesService, 
          ProvinciasService, 
          DistritosService,UsuariosService,
          NgxImageCompressService,
          DatePipe, AuthService]
})
export class PostulanteProfileModule { }
