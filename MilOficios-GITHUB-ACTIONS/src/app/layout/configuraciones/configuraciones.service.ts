import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { StorageService } from 'src/app/helpers/storage.service';
import { retry, tap } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfiguracionesService {

  httpOptions  = {
    headers: new HttpHeaders({'Authorization': 'Basic ' + this.storageService.getString('USE_SUB'),
    'type-user': '28491765'}) // 9$$10710$2y$10$VZMRl4RVjOS2Qi/ttl/U9uq0D4MIqj/Z5Te6MZKPX.2305DwSYGSG5114
  };

  private _configuraciones: BehaviorSubject<any | null> = new BehaviorSubject(null);

  constructor(private http: HttpClient, private storageService: StorageService) { }

  get configuraciones$(): Observable<any>
  {
    return this._configuraciones.asObservable();
  }

  updateHeaders() {
    this.httpOptions  = {
      headers: new HttpHeaders({'Authorization': 'Basic ' + this.storageService.getString('USE_SUB') ,
      'type-user': '28491765'})
    };
  }

  listar() {
    const url = environment.domain_url + '/api/configuraciones/listar';
    
    return this.http.get<any>(url, this.httpOptions).pipe(
      retry(2)
    );
    
  }

  listarConfiguraciones(){
    return this.http.get<any>(environment.domain_url + '/api/configuraciones/listar', this.httpOptions).pipe(
      tap((response) => {
          this._configuraciones.next(response['Resultado']);
          return response;
      })
  );
  }

}
