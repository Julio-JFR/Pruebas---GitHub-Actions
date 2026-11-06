import { Injectable } from '@angular/core';
import { AbstractControl, Validators, FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class ValidacionesService {

  agregarValidaciones(control: AbstractControl, tipo:number,longitudIni?:number,pattern?:string,longitudFin?:number,agregado?:boolean){
    switch (tipo) {
        case 1: 
            control.setValidators([Validators.required, Validators.pattern(pattern), Validators.maxLength(longitudIni)]);
            control.updateValueAndValidity();
            break;
        case 2://Solo para required
            control.setValidators(Validators.required);
            control.updateValueAndValidity();
            break;
        case 3://para dni, celular, ruc
            control.setValidators([Validators.required, Validators.pattern(agregado ? ("[+]" + "[0-9]+") : "[0-9]+"), Validators.minLength(longitudIni), Validators.maxLength(longitudFin)]);
            control.updateValueAndValidity();
            break;
        case 4://required y maxleng
            control.setValidators([Validators.required, Validators.maxLength(longitudIni)]);
            control.updateValueAndValidity();
            break;
        default:
            break;
    }
  }

  quitarValidaciones(formulario:FormGroup){
    Object.keys(formulario.controls).forEach(controlName => {
        formulario.get(controlName).clearValidators();
        formulario.get(controlName).updateValueAndValidity();
    });
  }

}
