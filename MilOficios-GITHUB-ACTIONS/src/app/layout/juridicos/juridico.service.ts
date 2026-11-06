import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable} from 'rxjs';
import { StorageService } from '../../helpers/storage.service';
import { retry} from 'rxjs/operators';
import {JuridicoModels} from './juridico-models';

@Injectable({
  providedIn: 'root'
})
export class JuridicoService {

  constructor(private http: HttpClient, private storageService: StorageService) { }

  httpOptions  = {
    headers: new HttpHeaders({'Authorization': 'Basic ' + this.storageService.getString('USE_SUB'),
                              'type-user': '28491765'})
  };

  updateHeaders() {
    this.httpOptions  = {
      headers: new HttpHeaders({'Authorization': 'Basic ' + this.storageService.getString('USE_SUB'),
                              'type-user': '28491765'})
    };
  }

  obtenerDatosJuridicosPorCliente(id:number): Observable<JuridicoModels>{
    const url = environment.domain_url + '/api/juridico/rescatarDatosPorCliente?CLI_ID='+id;

    return this.http.get<any>(url, this.httpOptions).pipe(
      retry(2)
    );

  }
  
}
