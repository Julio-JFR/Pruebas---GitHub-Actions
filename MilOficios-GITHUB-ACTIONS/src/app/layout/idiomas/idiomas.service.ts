import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { retry } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class IdiomasService {

  constructor(private http: HttpClient) { }


  obtenerIdiomas() {
    const url =  environment.domain_url + '/api/idiomas/rescatarIdiomas';

    return this.http.get<any>(url).pipe(retry(2));
  }



}
