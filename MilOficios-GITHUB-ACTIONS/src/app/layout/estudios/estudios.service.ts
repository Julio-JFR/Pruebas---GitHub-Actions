import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Estudio } from './estudio.model';
import { StorageService } from '../../helpers/storage.service';
import { retry } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EstudiosService {

  constructor(private http: HttpClient, private storageService: StorageService) { }

  httpOptions  = {
    headers: new HttpHeaders({'Authorization': 'Basic ' + this.storageService.getString('USE_SUB'),
                              'type-user': '28491765'})
  };

  listarEstudiosPostulante(POST_ID: number) {
    let url = environment.domain_url +  '/api/estudios/listarEstudiosPostulante';

    url += '?POST_ID=' + POST_ID;

    const httpOptions  = {
      headers: new HttpHeaders({'Authorization': 'Basic ' + this.storageService.getString('USE_SUB'),
                                'type-user': '39805712'})
    };

    return this.http.get<any>(url, httpOptions).pipe(
        retry(2)
    );
  }

  getEstudiosEspecialista(id: number): Observable<any> {
    const url: string = environment.domain_url +  '/api/estudios/listarEstudiosEspecialista?ESP_ID=' + id;
    return this.http.get<any>(url, this.httpOptions);
  }

  insertEstudios(estudio: Estudio, idEspecialista): Observable<any> {
    const url =  environment.domain_url +  '/api/estudios/insertarEstudioEspecialista';
    const nuevoEstudio = {
      ESTUDIOS: estudio,
      ESP_ID: idEspecialista
    };
    return this.http.post<any>(url, nuevoEstudio, this.httpOptions);
  }

  updateEstudios(estudio: Estudio): Observable<any> {
    const url = environment.domain_url +  '/api/estudios/actualizarEstudio';
    let cabeceraUsuario;
    if(this.storageService.getString('TIPO_SESION') == "0")
      cabeceraUsuario = '39805712'; //postulante
    else
      cabeceraUsuario = '28491765';//usuario (cliente o especialista)

    const httpOptions  = {
      headers: new HttpHeaders({'Authorization': 'Basic ' + this.storageService.getString('USE_SUB'),
                                'type-user': cabeceraUsuario})
    };

    return this.http.put<any>(url, estudio, httpOptions);
  }

  insertarEstudioPorPostulante(estudio: Estudio, id_postulante: number): Observable<any>{
    const url = environment.domain_url + '/api/estudios/insertar';
    const nuevoEstudio = {
      ESTUDIO: {
        EST_TIPO: estudio.EST_TIPO,
        EST_DESCRIPCION: estudio.EST_DESCRIPCION,
        EST_INSTITUCION: estudio.EST_INSTITUCION,
        EST_FECH_INI: estudio.EST_FECH_INI,
        EST_FECH_FIN: estudio.EST_FECH_FIN
      },
      POST_ID: id_postulante
    }

    const httpOptions  = {
      headers: new HttpHeaders({'Authorization': 'Basic ' + this.storageService.getString('USE_SUB')})
    };

    return this.http.post<any>(url,nuevoEstudio,httpOptions).pipe(
      retry(2)
    );
  }

  eliminarEstudio(EST_ID: number){
    const url = environment.domain_url + '/api/estudios/eliminar?EST_ID='+EST_ID;
    const httpOptions  = {
      headers: new HttpHeaders({'Authorization': 'Basic ' + this.storageService.getString('USE_SUB')})
    };


    return this.http.delete<any>(url,httpOptions);
  }
}
