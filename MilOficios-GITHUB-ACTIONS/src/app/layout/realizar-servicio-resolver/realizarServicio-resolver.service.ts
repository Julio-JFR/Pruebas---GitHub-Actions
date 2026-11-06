import { ActivatedRouteSnapshot, RouterStateSnapshot, Resolve,  ActivatedRoute, Router  } from '@angular/router';
import { Observable, of } from 'rxjs';
import { Injectable } from '@angular/core';
import { RealizarServicioService } from '../realizar-servicio/realizar-servicio.service';
import { RealizarServicioModels } from '../realizar-servicio/realizar-servicio-models';
import { catchError } from 'rxjs/operators';
import {StorageService} from '../../helpers/storage.service';
@Injectable()
export class RealizarServicioResolver implements Resolve<RealizarServicioModels[]> {

    constructor(private realizarServicioService: RealizarServicioService,
            private router:  ActivatedRoute,
            private storage: StorageService ) { }

    // tslint:disable-next-line:max-line-length
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<RealizarServicioModels[]> | Promise<RealizarServicioModels[]> | RealizarServicioModels[] {
        // tslint:disable-next-line:max-line-length
        return this.realizarServicioService.obtenerSevicioARealizar( Number(this.storage.getString('servRealizadoID') ) , Number( this.storage.getString('usuarioID') ) ).pipe(
            catchError(error => {
                console.error(`Can't resolve because of the error:`);
                console.error(error);
                return of(null);
            })
        );
    }
}
