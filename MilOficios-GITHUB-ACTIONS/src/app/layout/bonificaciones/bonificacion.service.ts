import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable} from 'rxjs';
import { StorageService } from '../../helpers/storage.service';
import { retry} from 'rxjs/operators';



@Injectable({
  providedIn: 'root'
})
export class BonificacionService {

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
  
  saveBonosCliente(bono: any, idCliente: number) {
    const url = environment.domain_url +'/api/bonificaciones/insertarBonificacionCliente';
    const nuevaBonificacion = { BONIFICACIONES: bono, CLI_ID: idCliente};
    
    return this.http.post<any>(url, nuevaBonificacion, this.httpOptions).pipe(
      retry(2)
    );
  }

  listarBonos(id:number): Observable<any> {
    const url: string = environment.domain_url +  '/api/bonificaciones/listarBonificacionesCliente?CLI_ID=' + id;
    return this.http.get<any>(url, this.httpOptions).pipe(
      retry(2)
    );
  }

  devolverDinero(BON_ID: number): Observable<any> {
    const url: string = environment.domain_url +  '/api/bonificaciones/devolverDinero';
    const httpOptions  = {
      headers: new HttpHeaders({'Authorization': 'Basic ' + this.storageService.getString('USE_SUB')})
    }
    return this.http.put<any>(url, {BON_ID: BON_ID}, this.httpOptions).pipe(
      retry(2)
    );
  }

}
