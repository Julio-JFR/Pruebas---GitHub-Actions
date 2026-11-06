import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LoginPostulanteMovilRoutingModule } from './login-postulante-movil-routing.module';
import { LoginPostulanteMovilComponent } from './login-postulante-movil.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxCaptchaModule } from 'ngx-captcha';
import { NavbarModule } from '../../shared/navbar/navbar.module';

@NgModule({
  declarations: [LoginPostulanteMovilComponent],
  imports: [
    CommonModule,
    LoginPostulanteMovilRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    NgbModule,
    NgxCaptchaModule,
    NavbarModule
  ]
})
export class LoginPostulanteMovilModule { }
