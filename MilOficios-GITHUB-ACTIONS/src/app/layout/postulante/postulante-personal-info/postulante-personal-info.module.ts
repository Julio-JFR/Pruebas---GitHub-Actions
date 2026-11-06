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


import {DirectivasModule} from '../../../shared/directivas/directivas.module';
import { PostulanteSidebarModule } from '../postulante-sidebar/postulante-sidebar.module';
import { PostulantePersonalInfoComponent } from './postulante-personal-info.component';
import { PostulantePersonalInfoRoutingModule } from './postulante-personal-info-routing.module';
import { AlertaModalModule } from 'src/app/shared/modules/alerta-modal/alerta-modal.module';
import { ComponentsModule } from 'src/app/shared/components/components.module';

@NgModule({
  declarations: [PostulantePersonalInfoComponent],
  imports: [
    CommonModule, DirectivasModule,
    PostulantePersonalInfoRoutingModule,
    PageHeaderModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    ImageCropperModule,
    ComponentsModule,
    PostulanteSidebarModule,
    AlertaModalModule
  ],
  providers: [PostulanteService, PostulacionService, EstudiosService, ExperienciasLaboralesService,
          PaisesService, 
          RegionesService, 
          ProvinciasService, 
          DistritosService,UsuariosService,
          DatePipe, AuthService]
})
export class PostulantePersonalInfoModule { }
