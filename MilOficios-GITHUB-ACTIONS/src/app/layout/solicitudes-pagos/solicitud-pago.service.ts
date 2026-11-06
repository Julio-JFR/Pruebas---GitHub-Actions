import { EventEmitter, Injectable, Output } from '@angular/core';
import { HttpClient,  HttpHeaders } from '@angular/common/http';
import { Observable} from 'rxjs';
import { SolicitudPago } from './SolicitudPago.models';
import { retry } from 'rxjs/operators';
import { StorageService } from '../../helpers/storage.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SolicitudPagoService {

  httpOptions  = {
    headers: new HttpHeaders({'Authorization': 'Basic ' + this.storageService.getString('USE_SUB')})
  };

  constructor(private http: HttpClient, private storageService: StorageService) { }

  insertarSolicitudPago( ESP_ID: number, BON_ID: number, SOL_PAG_COMENTARIO: string,SOL_PAG_ID:number): Observable <SolicitudPago>{
    const url = environment.domain_url + "/api/solicitudesPago/insertar";

    return this.http.post<SolicitudPago>( url, {"ESP_ID": ESP_ID, "BON_ID": BON_ID, "SOL_PAG_COMENTARIO": SOL_PAG_COMENTARIO, "SOL_PAG_ID":SOL_PAG_ID}, this.httpOptions).pipe(
      retry(2)
    );
  }

  //obtiene la lista de ids de los bonos que están pendiente por aprobar la solicitud del pago
  obtenerBonosPendientes(ESP_ID: number): Observable <any>{
    const url = environment.domain_url + "/api/solicitudesPago/obtenerBonosPendientes?ESP_ID="+ESP_ID;

    return this.http.get<any>( url, this.httpOptions).pipe(
      retry(2)
    );
  }
}
