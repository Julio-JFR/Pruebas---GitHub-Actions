import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { retry } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PaisesService {

  constructor(private http: HttpClient) { }



  getPaises(): Observable<any> {
    const url = environment.domain_url +  '/api/paises/rescatarPaises';
    return this.http.get<any>(url).pipe(retry(2));
  }
}
