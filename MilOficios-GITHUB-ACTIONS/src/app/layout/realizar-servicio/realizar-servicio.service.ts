import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable} from 'rxjs';
import { retry} from 'rxjs/operators';
import { StorageService } from '../../helpers/storage.service';
import { environment } from 'src/environments/environment';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Injectable({
  providedIn: 'root'
})
export class RealizarServicioService {

  idInterval: Number;

  constructor(private http: HttpClient, private storageService: StorageService) { }

  httpOptions  = {
    headers: new HttpHeaders({'Authorization': 'Basic ' + this.storageService.getString('USE_SUB')  })
  };

  updateHeaders() {
    this.httpOptions  = {
      headers: new HttpHeaders({'Authorization': 'Basic ' + this.storageService.getString('USE_SUB') })
    };
  }

  obtenerSevicioARealizar(SERE_ID: number, USU_ID: number): Observable <any> {


    const url =  environment.domain_url + `/api/serviciosRealizados/obtenerServicioARealizar?SERE_ID=${SERE_ID}&USU_ID=${USU_ID}`;

    return this.http.get<any>( url, this.httpOptions ).pipe(
      retry(2)
    );
  }

  iniciarServicioRealizado(SERE_ID: number, ESP_ID: number, CLI_EMAIL:string):  Observable <any> {
    const navegador = localStorage.getItem('navegador');
    const datos = {
      SERE_ID: SERE_ID,
      ESP_ID: ESP_ID,
      CLI_EMAIL:CLI_EMAIL,
      USU_INI_NAVEGADOR:navegador
    };
    
    const url =  environment.domain_url + '/api/serviciosRealizados/iniciar';
    return this.http.post<any>(url, datos,  this.httpOptions ).pipe(
      retry(2)
    );
  }

  finalizarServicioRealizado(SERE_ID: number, emailCliente: string, id_especialista: number):  Observable <any> {

    // const urlRedireccion = 'https://miloficiosadmindesa.muchiktec.com/clientes/login';
    const urlRedireccion = environment.intranet_login_url;
    const datos = {
      SERE_ID: SERE_ID,
      EMAIL_CLIENTE: emailCliente,
      ESP_ID: id_especialista, //a pesar de que en el local storage ida use_id en realidad es el id del cliente o especialista
      URL: urlRedireccion
    };
    const url =  environment.domain_url + '/api/serviciosRealizados/finalizar';

    return this.http.put<any>( url, datos, this.httpOptions ).pipe(
      retry(2)
    );
  }


}
