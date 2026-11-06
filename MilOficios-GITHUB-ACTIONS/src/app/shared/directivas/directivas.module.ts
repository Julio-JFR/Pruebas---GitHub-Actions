import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImgRotaDirective } from './imgRota/img-rota.directive';




@NgModule({
  declarations: [ImgRotaDirective],
  imports: [
    CommonModule
  ],
  exports: [ImgRotaDirective]
})
export class DirectivasModule { }
