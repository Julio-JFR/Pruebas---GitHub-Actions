import { Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';
import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';
import {StorageService} from '../../helpers/storage.service';
import { Postulante } from './postulante.models';
import { PostulanteService } from './postulante.service';
@Injectable()
export class PostulanteSidebarResolver implements Resolve<Postulante[]> {
    constructor(private postulanteService: PostulanteService,
            private storage: StorageService ) { }
    resolve(): Observable<Postulante[]> | Promise<Postulante[]> | Postulante[]  {
        return this.postulanteService.obtenerPostulante( Number(this.storage.getString("POST_ID"))).pipe(
            catchError(error => {
                console.error(`Can't resolve because of the error:`);
                console.error(error);
                return of(null);
            })
        );
    }
}