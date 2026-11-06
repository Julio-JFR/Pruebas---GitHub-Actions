import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ImageCropperModule } from 'ngx-image-cropper';

import { PageHeaderModule } from '../../../shared';
import { PostulanteRoutingModule } from './postulante-routing.module';
import { PostulanteComponent } from './postulante.component';
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


import {DirectivasModule} from '../../../shared/directivas/directivas.module';
import { PostulanteSidebarModule } from '../postulante-sidebar/postulante-sidebar.module';
import { AlertaModalModule } from 'src/app/shared/modules/alerta-modal/alerta-modal.module';

@NgModule({
  declarations: [PostulanteComponent],
  imports: [
    CommonModule, DirectivasModule,
    PostulanteRoutingModule,
    PageHeaderModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    ImageCropperModule,
    AlertaModalModule,
    PostulanteSidebarModule
  ],
  providers: [PostulanteService, PostulacionService, EstudiosService, ExperienciasLaboralesService,
          PaisesService, 
          RegionesService, 
          ProvinciasService, 
          DistritosService,UsuariosService,
          DatePipe, AuthService]
})
export class PostulanteModule { }
