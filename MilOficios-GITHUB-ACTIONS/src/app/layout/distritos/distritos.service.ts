import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { retry } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class DistritosService {

  constructor(private http: HttpClient) { }


  getDistrito(id_provincia: number): Observable<any> {
    const url: string = environment.domain_url + '/api/distritos/listar?PRO_ID=' + id_provincia;
    return this.http.get<any>(url).pipe( retry(2) );
  }
}
