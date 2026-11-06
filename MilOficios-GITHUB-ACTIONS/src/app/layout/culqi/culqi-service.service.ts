import { Injectable } from '@angular/core';
import { Tarjeta } from '../tarjetas/tarjeta.model';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable} from 'rxjs';
import { StorageService } from '../../helpers/storage.service';
import { retry} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CulqiServiceService {

  constructor(private http: HttpClient, private storageService: StorageService) { }


  pagoCulqi(CLI_ID: number, TAR_ID: number, MONTO: number){
    const headers = new HttpHeaders({'Authorization':'Basic '+localStorage.getItem("USE_SUB")});

    let url: string = environment.domain_url + '/api/culqi/pago';

    return this.http.post(url,{"CLI_ID":CLI_ID,"TAR_ID":TAR_ID,"MONTO":MONTO},{headers}).pipe(
      retry(2)
    );
  }
}
