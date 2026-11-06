import { Directive } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator, ValidatorFn } from '@angular/forms';

export function passwordValidation() : ValidatorFn {
  return (control: AbstractControl) => {
    const passwordValidationDirective = new PasswordValidationDirective();
    return passwordValidationDirective.validate(control);
  }
}

@Directive({
  selector: '[passwordValidation]',
  providers: [{provide: NG_VALIDATORS, useExisting: PasswordValidationDirective, multi: true}]
})
export class PasswordValidationDirective implements Validator{

  passwordsProhibidos = ['123456789','qwertyuiop','12345678'];
  validate(control: AbstractControl): ValidationErrors {
    const password = <string>control.value;
    if(!password){return;}

    if(this.passwordsProhibidos.indexOf(password) !== -1){
      return {'passwordValidation':{'mensaje':'La contraseña no es segura'}}
    }
    if(password === password.toLowerCase()){
      return {'passwordValidation':{'mensaje':'La contraseña debe contener mayúsculas'}}
    }
    if(password === password.toUpperCase()){
      return {'passwordValidation':{'mensaje':'La contraseña debe contener minúsculas'}}
    }
    if(!/\d/.test(password)){
      return {'passwordValidation':{'mensaje':'La contraseña debe contener números'}}
    }
    if(!/[@$%&|<>#*_-]/.test(password)){
      return {'passwordValidation':{'mensaje':'La contraseña debe contener caracteres especiales: $ % & | < > # * _ - @ '}}
    }
    return null;
  }
  constructor() { }
}
