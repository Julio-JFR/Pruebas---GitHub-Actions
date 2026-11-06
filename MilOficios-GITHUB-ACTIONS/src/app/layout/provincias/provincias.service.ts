import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { retry } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProvinciasService {

  constructor(private http: HttpClient) { }

  getProvincias(id_region: number): Observable<any> {
    const url: string = environment.domain_url + '/api/provincias/rescatarProvincias?REG_ID=' + id_region;
    return this.http.get<any>(url).pipe(retry(2));
  }
}
