import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LoginEspecialistaMovilRoutingModule } from './login-especialista-movil-routing.module';
import { LoginEspecialistaMovilComponent } from './login-especialista-movil.component';

import { TranslateModule } from '@ngx-translate/core';
import { NgxCaptchaModule } from 'ngx-captcha';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NavbarModule } from 'src/app/shared/navbar/navbar.module';

@NgModule({
  declarations: [LoginEspecialistaMovilComponent],
  imports: [
    CommonModule,
    LoginEspecialistaMovilRoutingModule,
    TranslateModule,
    NgxCaptchaModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    NavbarModule
  ]
})
export class LoginEspecialistaMovilModule { }
