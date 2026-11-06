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
export class TarjetaService {

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

  

  verificacionTarjeta(card: Tarjeta):Observable<any>{   
    const headers = new HttpHeaders({'Content-type':'application/json',
                            'Authorization':'Bearer pk_test_6cbe522dcba37dd8'});

    let url: string = ' https://secure.culqi.com/v2/tokens';

    let datos = {
      'card_number':card.TAR_NUMERO,
      'cvv': card.TAR_CVV, 
      'expiration_month': card.TAR_MES, 
      'expiration_year': card.TAR_ANIO, 
      'email': card.TAR_CORREO
    }

    return this.http.post(url,datos,{headers}).pipe(
      retry(2)
    );

  }

  pagarTarjeta(TAR_MONTO: number, USU_EMAIL: string, TKN_ID: string){
    const headers = new HttpHeaders({'Content-type':'application/json',
                                      'Authorization':'Bearer sk_test_5ee730435bc2321e'});

    let url: string = 'https://api.culqi.com/v2/charges';

    return this.http.post(url,{'amount':TAR_MONTO,'currency_code': 'PEN', 'email': USU_EMAIL, 'source_id': TKN_ID},{headers});
  }

  listarTarjetas(CLI_ID: number):Observable<any>{

    const url: string = environment.domain_url +'/api/tarjetas/listar?CLI_ID='+CLI_ID;

    return this.http.get(url,this.httpOptions).pipe(
      retry(2)
    );

  }

  insertarTarjeta(tarjeta: Tarjeta, CLI_ID:number, TIP_TAR_ID: number ):Observable<any>{

    let datos = {
      "TARJETA":{
        "TAR_NUMERO": tarjeta.TAR_NUMERO,
        "TAR_CVV": tarjeta.TAR_CVV,
        "TAR_TITULAR":tarjeta.TAR_TITULAR,
        "TAR_MES": tarjeta.TAR_MES,
        "TAR_ANIO":tarjeta.TAR_ANIO,
        "TIP_TAR_ID":TIP_TAR_ID,
        "CLI_ID":CLI_ID
      }
    }
    const url: string = environment.domain_url +'/api/tarjetas/insertar';

    return this.http.post(url,datos,this.httpOptions).pipe(
      retry(2)
    );

  }

  actualizarTarjeta(tarjeta:Tarjeta, CLI_ID: number): Observable<any> {
    const url = environment.domain_url +'/api/tarjetas/actualizar';

    let datos = {
      "TARJETA":{
        "TAR_NUMERO": tarjeta.TAR_NUMERO,
        "TAR_CVV": tarjeta.TAR_CVV ,
        "TAR_TITULAR": tarjeta.TAR_TITULAR,
        "TAR_MES": tarjeta.TAR_MES ,
        "TAR_ANIO": tarjeta.TAR_ANIO ,
        "TIP_TAR_ID": tarjeta.TIP_TAR_ID ,
        "CLI_ID":CLI_ID  ,
        "TAR_ID": tarjeta.TAR_ID
      }
    }

    return this.http.put<any>(url, datos, this.httpOptions).pipe(
      retry(2)
    );
  }

  eliminarTarjeta(idCliente: number, TAR_ID:number): Observable<any> {

    let datos = {
      "CLI_ID": idCliente,
      "TAR_ID": TAR_ID
    }
    const url = environment.domain_url +'/api/tarjetas/eliminar';

    return this.http.put<any>(url,datos, this.httpOptions).pipe(
      retry(2)
    );
  }


}
