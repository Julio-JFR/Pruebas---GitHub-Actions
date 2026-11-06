import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { retry } from 'rxjs/operators';
import { StorageService } from 'src/app/helpers/storage.service';
import { environment } from 'src/environments/environment';
import {SolicitudesModels} from '../solicitudes/solicitudes.models';
import {UbicacionModels} from '../ubicacion/ubicacion.models';
@Injectable({
  providedIn: 'root'
})
export class SolicitudesService {
  httpOptions  = {
    headers: new HttpHeaders({'Authorization': 'Basic ' + this.storageService.getString('USE_SUB'),
    'type-user': '28491765'}) // 9$$10710$2y$10$VZMRl4RVjOS2Qi/ttl/U9uq0D4MIqj/Z5Te6MZKPX.2305DwSYGSG5114
  };
  httpOptions2  = {
    headers: new HttpHeaders({'Authorization': 'Basic ' + this.storageService.getString('USE_SUB'),
                              'type-user': '28491765'})
  };

  constructor(private http: HttpClient, private storageService: StorageService) { }

  updateHeaders() {
    this.httpOptions  = {
      headers: new HttpHeaders({'Authorization': 'Basic ' + this.storageService.getString('USE_SUB') ,
      'type-user': '28491765'})
    };
  }

  insertar(solicitudes: SolicitudesModels,  ubicacion: UbicacionModels, IMAGENES: Array<object>,correo?:string):  Observable <any> {
    const datos = {
      SOLICITUD: {
        SOL_DESCRIPCION: solicitudes.SOL_DESCRIPCION,
        SOL_FECHA_SERVICIO: solicitudes.SOL_FECHA_SERVICIO,
        SOL_HORA_SERVICIO: solicitudes.SOL_HORA_SERVICIO ,
        CLI_ID: solicitudes.CLI_ID ,
        CAT_SER_ID: solicitudes.CAT_SER_ID ,
        SOL_NOMBRE_CONTACTO: solicitudes.SOL_NOMBRE_CONTACTO ,
        SOL_CELULAR_CONTACTO: solicitudes.SOL_CELULAR_CONTACTO,
        correo:correo
      },
      UBICACION: {
        UBI_DIRECCION: ubicacion.UBI_DIRECCION,
        UBI_LATITUD: ubicacion.UBI_LATITUD  ,
        UBI_LONGITUD: ubicacion.UBI_LONGITUD
      },
      IMAGENES,
      DOMINIO_URL: environment.domain_url
    };

    const url =  environment.domain_url + '/api/solicitudes/insertar';
    return this.http.post<any>( url, datos, this.httpOptions).pipe(
      retry(2)
    );
  }
  
  insertarRemoto(solicitudes: SolicitudesModels,  ubicacion: UbicacionModels, IMAGENES: Array<object>,correo?:string):  Observable <any> {
    const datos = {
      SOLICITUD: {
        SOL_DESCRIPCION: solicitudes.SOL_DESCRIPCION,
        SOL_FECHA_SERVICIO: solicitudes.SOL_FECHA_SERVICIO,
        SOL_HORA_SERVICIO: solicitudes.SOL_HORA_SERVICIO ,
        CLI_ID: solicitudes.CLI_ID ,
        CAT_SER_ID: solicitudes.CAT_SER_ID ,
        SOL_NOMBRE_CONTACTO: solicitudes.SOL_NOMBRE_CONTACTO ,
        SOL_CELULAR_CONTACTO: solicitudes.SOL_CELULAR_CONTACTO,
        correo:correo
      },
      UBICACION: {
        UBI_DIRECCION: ubicacion.UBI_DIRECCION
      },
      IMAGENES,
      DOMINIO_URL: environment.domain_url
    };
    const url =  environment.domain_url + '/api/solicitudes/insertarRemoto';
    return this.http.post<any>( url, datos).pipe(retry(2));
  }

    getSolicitudesDeEspecialista(id, latitud, longitud, filtrosServicios, filtroFechaInicio, filtroFechaFin, filtroPrecioInicio, filtroPrecioFin, ordenarPor): Observable<any> {
    const url = environment.domain_url + '/api/solicitudes/obtenerSolicitudesDisponibles?ESP_ID=' + id + '&LATITUD_ACTUAL=' + latitud + '&LONGITUD_ACTUAL=' + longitud +
                '&FILTRO_SERVICIOS=' + filtrosServicios + '&FILTRO_FECHA_INICIO=' + filtroFechaInicio + '&FILTRO_FECHA_FIN=' + filtroFechaFin + '&FILTRO_PRECIO_INICIO=' + filtroPrecioInicio +
                '&FILTRO_PRECIO_FIN=' + filtroPrecioFin + '&ORDENAR_POR=' + ordenarPor;
    return this.http.get<any>(url, this.httpOptions).pipe(
      retry(2)
    );
  }
  getSolicitudesRemotasDeEspecialista(id,filtrosServicios, filtroFechaInicio, filtroFechaFin, filtroPrecioInicio, filtroPrecioFin, ordenarPor): Observable<any> {
    const url = environment.domain_url + '/api/solicitudes/obtenerSolicitudesRemotasDisponibles?ESP_ID=' + id + '&FILTRO_SERVICIOS=' + filtrosServicios + '&FILTRO_FECHA_INICIO=' + filtroFechaInicio + '&FILTRO_FECHA_FIN=' + filtroFechaFin + '&FILTRO_PRECIO_INICIO=' + filtroPrecioInicio +
                '&FILTRO_PRECIO_FIN=' + filtroPrecioFin + '&ORDENAR_POR=' + ordenarPor;
    return this.http.get<any>(url, this.httpOptions).pipe(
      retry(2)
    );
  }

  aceptarSolicitudEspecialista(idSolicitud, correoCliente,SERE_TARIFA_ORIGINAL:number , precio:number): Observable<any> {
    const url = environment.domain_url + '/api/solicitudes/aceptarSolicitudEspecialista?SOL_ID=' + idSolicitud + '&ESP_ID=' + this.storageService.getString('USE_ID') + '&CLI_EMAIL=' + correoCliente + '&SERE_TARIFA_ORIGINAL=' + SERE_TARIFA_ORIGINAL + '&SERE_TARIFA=' + precio;

    return this.http.get<any>(url, this.httpOptions).pipe(
      retry(2)
    );
  }

  cancelarSolicitud(SOL_ID) {
    const url = environment.domain_url + '/api/solicitudes/cancelarSolicitud';
    const datos = {
      SOL_ID
    };
    return this.http.put<any>(url, datos, this.httpOptions2).pipe(
      retry(2)
    );
  }

  getObtenerImagenes(SOL_ID: number){ 
    
    const url = environment.domain_url + '/api/solicitudImagen/listarImagenesPorSolicitud?SOL_ID=' + SOL_ID;

    return this.http.get<any>(url, this.httpOptions).pipe(
      retry(2)
      );
  }

}
