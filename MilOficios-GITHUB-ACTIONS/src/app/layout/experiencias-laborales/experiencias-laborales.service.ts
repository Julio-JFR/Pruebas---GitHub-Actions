import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { retry } from 'rxjs/operators';
import { ExperienciaLaboral } from './experiencia-laboral.model';
import { StorageService } from '../../helpers/storage.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ExperienciasLaboralesService {

  constructor(private http: HttpClient, private storageService: StorageService) { }

  httpOptions  = {
    headers: new HttpHeaders({'Authorization': 'Basic ' + this.storageService.getString('USE_SUB'),
                              'type-user': '28491765'})
  };

  getExperienciasLaboralesEspecialista(id: number): Observable<any> {
    const url: string =  environment.domain_url +  '/api/experienciasLaborales/listarExperienciasConContactosEspecialista?ESP_ID=' + id;
    return this.http.get<any>(url, this.httpOptions);
  }

  insertExperienciasLaboralesConContactos(experienciasLaborales: ExperienciaLaboral, idEspecialista: number): Observable<any> {
    const url =  environment.domain_url + '/api/experienciasLaborales/insertarExperienciaContactoEspecialista';
    const experienciaLaboral = {
      EXPERIENCIAS_LABORALES: {
        EXP_ESPECIALIDAD: experienciasLaborales.EXP_ESPECIALIDAD,
        EXP_EMPRESA: experienciasLaborales.EXP_EMPRESA,
        EXP_DESCRIPCION: experienciasLaborales.EXP_DESCRIPCION,
        EXP_FECH_INI: experienciasLaborales.EXP_FECH_INI,
        EXP_FECH_FIN: experienciasLaborales.EXP_FECH_FIN
      },
      CONTACTOS_REFERENCIA: {
        CONT_NOMBRES: experienciasLaborales.CONT_NOMBRES,
        CONT_APELLIDOS: experienciasLaborales.CONT_APELLIDOS,
        CONT_EMAIL: experienciasLaborales.CONT_EMAIL,
        CONT_CELULAR: experienciasLaborales.CONT_CELULAR
      },
      ESP_ID: idEspecialista
    };
    return this.http.post<any>(url, experienciaLaboral, this.httpOptions);
  }

  updateExperienciaLaboralConContactos(experienciasLaborales: ExperienciaLaboral): Observable<any> {
    const url =  environment.domain_url +  '/api/experienciasLaborales/actualizarExperienciaContacto';
    const experienciaLaboral = {
      EXPERIENCIAS_LABORALES: {
        EXP_ID: experienciasLaborales.EXP_ID,
        EXP_ESPECIALIDAD: experienciasLaborales.EXP_ESPECIALIDAD,
        EXP_EMPRESA: experienciasLaborales.EXP_EMPRESA,
        EXP_DESCRIPCION: experienciasLaborales.EXP_DESCRIPCION,
        EXP_FECH_INI: experienciasLaborales.EXP_FECH_INI,
        EXP_FECH_FIN: experienciasLaborales.EXP_FECH_FIN
      },
      CONTACTOS_REFERENCIA: {
        CONT_NOMBRES: experienciasLaborales.CONT_NOMBRES,
        CONT_APELLIDOS: experienciasLaborales.CONT_APELLIDOS,
        CONT_EMAIL: experienciasLaborales.CONT_EMAIL,
        CONT_CELULAR: experienciasLaborales.CONT_CELULAR
      }
    };

    let cabeceraUsuario;
    
    if(this.storageService.getString('TIPO_SESION') == "0")
      cabeceraUsuario = '39805712';
    else
      cabeceraUsuario = '28491765';

    const httpOptions  = {
      headers: new HttpHeaders({'Authorization': 'Basic ' + this.storageService.getString('USE_SUB'),
                                'type-user': cabeceraUsuario})
    };

    return this.http.put<any>(url, experienciaLaboral, httpOptions);
  }

  listarExperienciasContactos(POST_ID): Observable<any>{
    const url =  environment.domain_url +  '/api/experienciasLaborales/listarExperienciasLaboralesPostulante?POST_ID=' + POST_ID;

    const httpOptions  = {
      headers: new HttpHeaders({'Authorization': 'Basic ' + this.storageService.getString('USE_SUB'),
                                'type-user': '39805712'})
    };

    return this.http.get<any>(url,httpOptions).pipe(retry(2)); 
  }

  insertExperienciaConContactoPorPostulante(experienciaLaboral: ExperienciaLaboral, POST_ID: number): Observable<any> {
    const url =  environment.domain_url +  '/api/experienciasLaborales/insertarExperienciaConContacto';
    const nuevaExperienciaLaboral = {
      EXPERIENCIA_LABORAL: {
        EXP_ESPECIALIDAD: experienciaLaboral.EXP_ESPECIALIDAD,
        EXP_EMPRESA: experienciaLaboral.EXP_EMPRESA,
        EXP_DESCRIPCION: experienciaLaboral.EXP_DESCRIPCION,
        EXP_FECH_INI: experienciaLaboral.EXP_FECH_INI,
        EXP_FECH_FIN: experienciaLaboral.EXP_FECH_FIN
      },
      CONTACTO_REFERENCIA: {
        CONT_NOMBRES: experienciaLaboral.CONT_NOMBRES,
        CONT_APELLIDOS: experienciaLaboral.CONT_APELLIDOS,
        CONT_EMAIL: experienciaLaboral.CONT_EMAIL,
        CONT_CELULAR: experienciaLaboral.CONT_CELULAR
      },
      POST_ID: POST_ID
    };
    //autorizado solo para postulante
    const httpOptions  = {
      headers: new HttpHeaders({'Authorization': 'Basic ' + this.storageService.getString('USE_SUB')})
    };

    return this.http.post<any>(url, nuevaExperienciaLaboral, httpOptions);
  }

  eliminarExperienciaContacto(EXP_ID: number): Observable<any>{
    const url =  environment.domain_url +  '/api/experienciasLaborales/eliminarExperienciaContacto?EXP_ID='+EXP_ID;
    
    //autorizado solo para postulante
    const httpOptions  = {
      headers: new HttpHeaders({'Authorization': 'Basic ' + this.storageService.getString('USE_SUB')})
    };

    return this.http.delete<any>(url,httpOptions);
  }
}
