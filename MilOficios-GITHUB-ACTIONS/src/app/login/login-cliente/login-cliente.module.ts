import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginClienteRoutingModule } from './login-cliente-routing.module';
import { LoginClienteComponent } from './login-cliente.component';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxCaptchaModule } from 'ngx-captcha';
import { NavbarModule } from 'src/app/shared/navbar/navbar.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AlertaModalModule } from 'src/app/shared/modules/alerta-modal/alerta-modal.module';


@NgModule({
  declarations: [LoginClienteComponent],
  imports: [
    CommonModule,
    LoginClienteRoutingModule,
    NavbarModule,
    AlertaModalModule,
    TranslateModule,
    FormsModule,
    NgbModule,
    NgxCaptchaModule,
    ReactiveFormsModule
  ]
})
export class LoginClienteModule { }
