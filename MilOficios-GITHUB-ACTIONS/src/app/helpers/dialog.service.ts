import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DialogService {
    alert(titulo: string, mensaje: string) {
        alert(mensaje);
    }
}
