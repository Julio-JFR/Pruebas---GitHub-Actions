import { ActivatedRouteSnapshot, RouterStateSnapshot, Resolve,  ActivatedRoute, Router  } from '@angular/router';
import { Observable, of } from 'rxjs';
import { Injectable } from '@angular/core';
import { ClienteService } from '../cliente.service';
import { catchError } from 'rxjs/operators';
@Injectable()
export class ClienteServiceResolve implements Resolve<any> {

    constructor(private clienteService: ClienteService,
            private router:  ActivatedRoute ) { }

    // tslint:disable-next-line:max-line-length
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
        // tslint:disable-next-line:max-line-length
        return this.clienteService.rescatarSimboloMonedaPeru().pipe(
            catchError(error => {
                console.error(`Can't resolve because of the error:`);
                console.error(error);
                return of(null);
            })
        );
    }
}
