import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { Observable } from 'rxjs';
import { retry } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RegionesService {

  constructor(private http: HttpClient) { }


  getRegiones(id_pais: number): Observable<any> {
    const url: string = environment.domain_url +  '/api/regiones/rescatarRegiones?PAI_ID=' + id_pais;
    return this.http.get<any>(url).pipe(retry(2));
  }
}
