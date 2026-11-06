import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, throwError, zip } from 'rxjs';
import { ConfiguracionesService } from '../../configuraciones/configuraciones.service';
import { ServiciosService } from '../../servicios/servicios.service';

@Injectable({
    providedIn: 'root'
})
export class ServiciosResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private configuracionService: ConfiguracionesService,private serviciosService: ServiciosService)
    {
    }
    /**
     * Resolver
     *
     * @param route
     * @param state
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any>
    {   
        return zip(this.configuracionService.listarConfiguraciones(),this.serviciosService.getServicios());
    }
}
