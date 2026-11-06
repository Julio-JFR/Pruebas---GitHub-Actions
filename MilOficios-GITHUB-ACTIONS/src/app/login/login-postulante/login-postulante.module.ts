import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoginPostulanteRoutingModule } from './login-postulante-routing.module';
import { LoginPostulanteComponent } from './login-postulante.component';
import { TranslateModule } from '@ngx-translate/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxCaptchaModule } from 'ngx-captcha';
import { NavbarModule } from '../../shared/navbar/navbar.module';

@NgModule({
  declarations: [LoginPostulanteComponent],
  imports: [
    CommonModule,
    LoginPostulanteRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    NgxCaptchaModule,
    NgbModule,
    NavbarModule
  ]
})
export class LoginPostulanteModule { }
