import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PasswordValidationDirective } from './password-validation.directive';



@NgModule({
  declarations: [PasswordValidationDirective],
  imports: [
    CommonModule
  ],
  exports: [PasswordValidationDirective]
})
export class PasswordValidationModule { }
