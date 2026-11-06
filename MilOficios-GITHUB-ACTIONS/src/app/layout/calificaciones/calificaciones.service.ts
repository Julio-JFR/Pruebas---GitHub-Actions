import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable} from 'rxjs';
import { retry} from 'rxjs/operators';
import { StorageService } from '../../helpers/storage.service';
import {Calificaciones} from './calificaciones.models';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CalificacionesService {
  TIPO_URL:number;

  constructor(private http: HttpClient, private storageService: StorageService) { }

  httpOptions  = {
    headers: new HttpHeaders({'Authorization': 'Basic ' + this.storageService.getString('USE_SUB')})
  };

  updateHeaders() {
    this.httpOptions  = {
      headers: new HttpHeaders({'Authorization': 'Basic ' + this.storageService.getString('USE_SUB') })
    };
  }

  insertarCalificacion(calificacion: Calificaciones[], estado: number, idUsuarioCalificado: number): Observable <any> {
    let datos;
    if (calificacion[0].CA_TIPO === 1 ) {
    datos = {
      'CALIFICACIONES':
      [
        {
          'CA_CALIFICACION': calificacion[0].CA_CALIFICACION,
          'CA_COMENTARIO': calificacion[0].CA_COMENTARIO ,
          'CA_TIPO': calificacion[0].CA_TIPO,
          'SERE_ID': calificacion[0].SERE_ID,
          'ESTADO' : estado,
          'USU_ID': idUsuarioCalificado
        }
      ]
    };
    } else {
      datos = {
        'CALIFICACIONES':
        [
          {
            'CA_CALIFICACION': calificacion[0].CA_CALIFICACION,
            'CA_COMENTARIO': calificacion[0].CA_COMENTARIO ,
            'CA_TIPO': calificacion[0].CA_TIPO,
            'SERE_ID': calificacion[0].SERE_ID,
            'ESTADO' : estado,
            'USU_ID': idUsuarioCalificado
          },
          {
            'CA_CALIFICACION': calificacion[1].CA_CALIFICACION,
            'CA_COMENTARIO': calificacion[1].CA_COMENTARIO ,
            'CA_TIPO': calificacion[1].CA_TIPO,
            'SERE_ID': calificacion[1].SERE_ID,
            'ESTADO' : estado,
            'USU_ID': idUsuarioCalificado
          }
        ]
      };
    }

    const url =  environment.domain_url +  '/api/calificaciones/insertar';

    return this.http.post<any>( url, datos  , this.httpOptions ).pipe(
      retry(2)
    );
  }

  listarCalificaciones(ESP_ID: number ,CALIFICACION: number, FECHA_INI: string, FECHA_FIN: string): Observable <any> {
    
    const httpOptions  = {
      headers: new HttpHeaders({'Authorization': 'Basic ' + this.storageService.getString('USE_SUB'),
                              'type-user': '28491765'})
    };

    const url = environment.domain_url + "/api/calificaciones/listar?ESP_ID="+ESP_ID+"&FILTRO_CALIFICACION="+CALIFICACION+"&FILTRO_FECHA_INICIO="+(FECHA_INI ? FECHA_INI : null)+"&FILTRO_FECHA_FIN="+(FECHA_FIN ? FECHA_FIN : null);

    return this.http.get( url, httpOptions ).pipe(
      retry(2)
    );
  }

  enviarCalificarServicioAplicacion(SERE_ID:number) {
    // const httpOptions  = {
    //   headers: new HttpHeaders({'Authorization': 'Basic ' + this.storageService.getString('USE_SUB'),
    //                           'type-user': '28491765'})
    // };
    if(environment.production === true){
      this.TIPO_URL = 1;
    }else{
      this.TIPO_URL = 0;
    }
    const url = environment.domain_url + "/api/calificaciones/enviarCorreoCalificarEspecialistaAplicacion?SERE_ID="+SERE_ID+'&TIPO_URL='+this.TIPO_URL;
    return this.http.get( url).pipe(retry(2));
  }

}
