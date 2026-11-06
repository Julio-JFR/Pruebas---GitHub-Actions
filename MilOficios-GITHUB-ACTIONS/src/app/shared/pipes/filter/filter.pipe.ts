import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {

  transform(value: Array<any> , arg: any): any {
    const resultadoTexto = [];
    if(value!=null ){
      value.forEach(data => {
        const descripcion = (data.SER_NOMBRES +' '+data.SER_DESCRIPCION).toLowerCase();
        if(descripcion.includes(arg.toLowerCase()))
          resultadoTexto.push(data);
      });
      return resultadoTexto;
    }
    return value;
    
    /* return resultadoTexto; */
  }

}
