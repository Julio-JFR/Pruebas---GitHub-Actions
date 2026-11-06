import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginEspecialistaRoutingModule } from './login-especialista-routing.module';
import { LoginEspecialistaComponent } from './login-especialista.component';
import { TranslateModule } from '@ngx-translate/core';
import { NgxCaptchaModule } from 'ngx-captcha';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NavbarModule } from 'src/app/shared/navbar/navbar.module';
import { AlertaModalModule } from 'src/app/shared/modules/alerta-modal/alerta-modal.module';

@NgModule({
  declarations: [LoginEspecialistaComponent],
  imports: [
    CommonModule,
    LoginEspecialistaRoutingModule,
    NavbarModule,
    TranslateModule,
    AlertaModalModule,
    FormsModule,
    NgbModule,
    NgxCaptchaModule,
    ReactiveFormsModule
  ]
})
export class LoginEspecialistaModule { }
