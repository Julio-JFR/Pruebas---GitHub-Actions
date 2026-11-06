import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable} from 'rxjs';
import { retry} from 'rxjs/operators';
import {TrabajosConfirmadosModels} from './trabajos-confirmados-models';
import { StorageService } from '../../helpers/storage.service';
import { environment } from 'src/environments/environment';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Injectable({
  providedIn: 'root'
})
export class TrabajosConfirmadosService {

  trabajoConfirmado: TrabajosConfirmadosModels;

  constructor(private http: HttpClient, private storageService: StorageService) { }

  httpOptions  = {
    headers: new HttpHeaders({'Authorization': 'Basic ' + this.storageService.getString('USE_SUB') }) 
  };

  updateHeaders() {
    this.httpOptions  = {
      headers: new HttpHeaders({'Authorization': 'Basic ' + this.storageService.getString('USE_SUB') })
    };
  }

  getTrabajosConfirmados(id: any): Observable <any> {
    const url =  environment.domain_url + `/api/especialistas/rescatarTrabajosConfirmados?ESP_ID=${id}`;
    return this.http.get<any>(url, this.httpOptions).pipe(
      retry(2)
  );
  }

  cancelarServicioRealizadoPorEspecialista(SERE_ID: number, ESP_ID: number, SOL_ID: number, USU_EMAIL: string): Observable <any> {

    let datos = {
      SERV_DATA : {
        ESP_ID : ESP_ID,
        SOL_ID : SOL_ID,
        SERE_ID : SERE_ID,
        USU_EMAIL : USU_EMAIL
      }

    };

    const url =  environment.domain_url + '/api/serviciosRealizados/cancelacionSeReEspecialista';
    return this.http.put<TrabajosConfirmadosModels>( url, datos, this.httpOptions ).pipe(
      retry(2)
    );
  }

  recibirTrabajoConfirmado(trabajoConfirmado){
    this.trabajoConfirmado = trabajoConfirmado;
    this.storageService.storeObjeto("TRA_CNF", this.trabajoConfirmado);
  }


}
