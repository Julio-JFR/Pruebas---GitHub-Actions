import { Injectable } from '@angular/core';
import { DatePipe } from '@angular/common';
@Injectable()

export class DateService {

    constructor( private datePipe: DatePipe) {}

    getCurrentDatePicker(){
        const currentDate = new Date();
        return {year : currentDate.getFullYear(), month : currentDate.getMonth() + 1, day : currentDate.getDate()};
    }

    getDate(datePicker){   
        return datePicker.year + '-' + datePicker.month + '-' + datePicker.day;
    }

    dateToString(date: Date){
        return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
    }

    stringToDate(date: string){
        const splittedDate: string[] = date.split('-');
        const year = parseInt(splittedDate[0]);
        const month = parseInt(splittedDate[1]) - 1;
        const day = parseInt(splittedDate[2]);
        
        return new Date(year, month, day);
    }

    stringToDateTime(date: string){
        const splittedDate: string[] = date.split(' ');
        const datePart: string[] = splittedDate[0].split('-');
        const timePart: string[] = splittedDate[1].split(':');
    
        return new Date(parseInt(datePart[0]),parseInt(datePart[1])-1,parseInt(datePart[2]),
            parseInt(timePart[0]),parseInt(timePart[1]));
    }

    habilitarHastaCalendarioActual(): string { // Se usa en los inputs del html de tipo date.
        const fechaActual = this.datePipe.transform(new Date(), "yyyy-MM-dd").split('-')
        let fecha = fechaActual[0] + '-' + fechaActual[1] + '-' + fechaActual[2];
        return new Date(fecha).toISOString().split('T')[0] 
    }

    habilitarCalendarioMayorEdad(): string { // Se usa para tener calendario para +18 de edad.
        const fechaActual = this.datePipe.transform(new Date(), "yyyy-MM-dd").split('-')
        const dia = fechaActual[2]
        const mes = fechaActual[1];
        const anio = Number(fechaActual[0]) - 18;
        let fechaMaxima = anio + '-' + mes + '-' + dia;
      
        return new Date(fechaMaxima).toISOString().split('T')[0] 
    }
}