import { Injectable } from '@angular/core';
import { HttpClient,  HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { retry } from 'rxjs/operators';
import { StorageService } from '../../../helpers/storage.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PostulacionService {

  constructor(private http: HttpClient, private storageService: StorageService) { }

  listarPostulacionesPorPostulante(POST_ID: number): Observable<any> {
    const url: string = environment.domain_url + '/api/postulaciones/listarPostulacionesPorPostulante?POST_ID=' + POST_ID;
    
    const httpOptions  = {
      headers: new HttpHeaders({'Authorization': 'Basic ' + this.storageService.getString('USE_SUB')})
    };

    return this.http.get<any>(url,httpOptions).pipe(
      retry(2)
    );
  }

  cancelarPostulacion(POST_ID: number): Observable<any> {
    const url: string = environment.domain_url + '/api/postulaciones/cancelarPostulacion?POS_ID=' + POST_ID;
    
    const httpOptions  = {
      headers: new HttpHeaders({'Authorization': 'Basic ' + this.storageService.getString('USE_SUB')})
    };

    return this.http.get<any>(url,httpOptions).pipe(
      retry(2)
    );
  }

  insertarPostulacion(POST_ID: number, POST_EMAIL: string){
    const url: string = environment.domain_url + '/api/postulaciones/insertar';

    const httpOptions  = {
      headers: new HttpHeaders({'Authorization': 'Basic ' + this.storageService.getString('USE_SUB')})
    };

    return this.http.post<any>(url,{'POST_ID':POST_ID,'POS_EMAIL':POST_EMAIL},httpOptions).pipe(
      retry(2)
    );
  }

}
