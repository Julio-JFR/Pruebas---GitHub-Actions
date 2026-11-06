import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { retry,tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { StorageService } from '../../helpers/storage.service';
import { EntidadServicio } from './entidad-servicio';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServiciosService {
  _servicios: BehaviorSubject<any> = new BehaviorSubject(null);

    
  constructor(private http: HttpClient, private storageService: StorageService) {
   }

  httpOptions  = {
    headers: new HttpHeaders({'Authorization': 'Basic ' + this.storageService.getString('USE_SUB'),
                              'type-user': '28491765'})
  };

  servicios$ =this._servicios.asObservable();
  

  updateHeaders(token?) {
    this.httpOptions  = {
      headers: new HttpHeaders({'Authorization': 'Basic ' + (token? token: this.storageService.getString('USE_SUB')),
                                'type-user': '28491765'})
    };
  }

  getServiciosPorCategoria(idCategoria: number):Observable <EntidadServicio[]> {
    const url: string = environment.domain_url + '/api/servicios/listarServiciosSegunCategoria?CAT_ID=' + idCategoria;
    return this.http.get<EntidadServicio[]>(url, this.httpOptions);
  }
  getServiciosPorCategoriaLimitado(idCategoria: number):Observable <EntidadServicio[]> {
    const url: string = environment.domain_url + '/api/servicios/listarAlgunosServicios?CAT_ID=' + idCategoria;
    return this.http.get<EntidadServicio[]>(url, this.httpOptions);
  }
  getServicios() {
    const url: string = environment.domain_url + '/api/servicios/listar';
    return this.http.get<any>(url, this.httpOptions);
  }

  obtenerServicios(): Observable<any> {
    return this.http.get<any>( environment.domain_url + '/api/servicios/listar', this.httpOptions).pipe(
        tap((response) => {
          this._servicios.next(response['Resultado']);
        })
    ); 
  }

  saveServicioEspecialista(idServicio: number, idEspecialista: number, idNivel: number, idCategoria: number) {
    const url = environment.domain_url +  '/api/servicios/insertarServicioEspecialista';
    const servicioEspecialista = { ESPECIALISTA_SERVICIO: { SER_ID: idServicio, ESP_ID: idEspecialista, NIV_ID: idNivel, CAT_ID: idCategoria } };

    return this.http.post<any>(url, servicioEspecialista, this.httpOptions).pipe(
      retry(2)
    );
  }

  getServiciosEspecialista(id: number){
    const url: string =  environment.domain_url +  '/api/servicios/rescatarServiciosEspecialista?ESP_ID=' + id;
    return this.http.get<any>(url, this.httpOptions).pipe(
      retry(2)
    );
  }
  
  eliminarServEspecialista(idServ: number, idEsp: number){
    const url: string =  environment.domain_url +  '/api/servicios/eliminarServicioEspecialista?ESP_SER_ID=' + idServ+'&ESP_ID='+idEsp;
    return this.http.get<any>(url, this.httpOptions).pipe(
      retry(2)
    );
  }
}
