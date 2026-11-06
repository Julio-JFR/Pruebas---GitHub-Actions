import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appImgRota]'
})
export class ImgRotaDirective {

  @Input() url: string;
  constructor(private elementRef: ElementRef) { }

  @HostListener('error')
  cargarImagenPorDefecto(){
    const element = this.elementRef.nativeElement;
    element.src = this.url;
  }

}
