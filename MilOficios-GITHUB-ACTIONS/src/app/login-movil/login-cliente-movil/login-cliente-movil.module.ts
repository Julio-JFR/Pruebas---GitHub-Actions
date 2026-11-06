import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LoginClienteMovilRoutingModule } from './login-cliente-movil-routing.module';
import { LoginClienteMovilComponent } from './login-cliente-movil.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxCaptchaModule } from 'ngx-captcha';
import { NavbarModule } from 'src/app/shared/navbar/navbar.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';


@NgModule({
  declarations: [LoginClienteMovilComponent],
  imports: [
    CommonModule,
    LoginClienteMovilRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgxCaptchaModule,
    NavbarModule,
    NgbModule,
    TranslateModule
  ]
})
export class LoginClienteMovilModule { }
