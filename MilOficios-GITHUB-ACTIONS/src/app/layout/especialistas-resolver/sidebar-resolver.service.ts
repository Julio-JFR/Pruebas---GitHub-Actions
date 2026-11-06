import { Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';
import { Injectable } from '@angular/core';
import { EspecialistasService } from '../especialistas/especialistas.service';
import { catchError } from 'rxjs/operators';
import {StorageService} from '../../helpers/storage.service';
import {Especialista} from '../especialistas/especialista.model';
@Injectable()
export class EspecialistaSidebarResolver implements Resolve<Especialista[]> {
    constructor(private especialistaService: EspecialistasService,
            private storage: StorageService ) { }
    resolve(): Observable<Especialista[]> | Promise<Especialista[]> | Especialista[]  {
        return this.especialistaService.getEspecialistaById( Number(this.storage.getString("USE_ID"))).pipe(
            catchError(error => {
                console.error(`Can't resolve because of the error:`);
                console.error(error);
                return of(null);
            })
        );
    }
}