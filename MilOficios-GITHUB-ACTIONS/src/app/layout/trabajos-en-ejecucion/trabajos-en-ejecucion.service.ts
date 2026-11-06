import { Injectable } from '@angular/core';
import { StorageService } from '../../helpers/storage.service';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable} from 'rxjs';
import { retry} from 'rxjs/operators';




@Injectable({
  providedIn: 'root'
})
export class TrabajosEnEjecucionService {

  constructor(private http: HttpClient, 
    private storageService: StorageService) { }

  httpOptions  = {
    headers: new HttpHeaders({'Authorization': 'Basic ' + this.storageService.getString('USE_SUB') }) 
  };

  updateHeaders() {
    this.httpOptions  = {
      headers: new HttpHeaders({'Authorization': 'Basic ' + this.storageService.getString('USE_SUB') })
    };
  }

  obtener(){
    const url =  environment.domain_url + `/api/`;
    return this.http.get<any>(url, this.httpOptions).pipe(
      retry(2)
    );
  }



}
