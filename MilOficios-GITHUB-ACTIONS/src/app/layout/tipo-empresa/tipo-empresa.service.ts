import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { retry } from 'rxjs/operators';
import { StorageService } from '../../helpers/storage.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TipoEmpresaService {

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


  getTipoEmpresa(): Observable<any> {
    const url: string = environment.domain_url +  '/api/tipoEmpresa/listar';
    return this.http.get<any>(url).pipe(retry(2));
  }

  getTipoEmpresaByIdCliente(clienteID: number): Observable<any> {
    const url: string = environment.domain_url +  '/api/tipoEmpresa/obtenerTipoEmpresaCliente?CLI_ID='+clienteID;
    return this.http.get<any>(url, this.httpOptions).pipe(retry(2));
  }

}
