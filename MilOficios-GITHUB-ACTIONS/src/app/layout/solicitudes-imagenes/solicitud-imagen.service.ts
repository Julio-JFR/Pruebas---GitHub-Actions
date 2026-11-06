import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { retry } from 'rxjs/operators';
import { StorageService } from 'src/app/helpers/storage.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SolicitudImagenService {

  constructor(private http: HttpClient, private storageService: StorageService) {}
  httpOptions  = {
    headers: new HttpHeaders({'Authorization': 'Basic ' + this.storageService.getString('USE_SUB'),
                              'type-user': '28491765'})
  };

   listarImagenesPorSolicitud(SOL_ID: number) {
    const url = environment.domain_url + '/api/solicitudImagen/listarImagenesPorSolicitud?SOL_ID=' + SOL_ID;
    return this.http.get<any>(url, this.httpOptions).pipe(
    retry(2)
    );
   }
}
