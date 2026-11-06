import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { PostulanteService } from '../postulante.service';

@Injectable({
    providedIn: 'root'
})
export class PostulanteProfileResolver implements Resolve<any> {
    constructor(private postulanteService: PostulanteService) {}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        const codigo = localStorage.getItem('POST_ID') ?? '';
        return this.postulanteService.obtenerPostulanteResolver(parseInt(codigo));
    }
}
