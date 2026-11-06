import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable} from 'rxjs';
import { StorageService } from '../../helpers/storage.service';
import { retry} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CategoriaservicioserviceService {

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


  obtenerCategoriaServicioID(CAT_ID: number, SER_ID:number):  Observable<any> {

    const url =  environment.domain_url + '/api/categoriaServicio/obtenerCategoriaServicio?CAT_ID=' + CAT_ID+'&SER_ID='+SER_ID;

    return this.http.get<any>( url, this.httpOptions).pipe(
      retry(2)
    );
  }



}
