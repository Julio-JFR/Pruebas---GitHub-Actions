import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable} from 'rxjs';
import { StorageService } from '../../helpers/storage.service';
import { retry} from 'rxjs/operators';
import { Cliente } from './cliente.model';
import { Tarjeta } from '../tarjetas/tarjeta.model';
import {TipoEmpresa} from '../tipo-empresa/tipo-empresa.model';
import {JuridicoModels} from '../juridicos/juridico-models';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {

  constructor(private http: HttpClient, private storageService: StorageService) { }

  httpOptions  = {
    headers: new HttpHeaders({'Authorization': 'Basic ' + this.storageService.getString('USE_SUB'),
                              'type-user': '28491765'})
  };

  updateHeaders(token?:string) {
    this.httpOptions  = {
      headers: new HttpHeaders({'Authorization': 'Basic ' + (token ? token : this.storageService.getString('USE_SUB')),
                              'type-user': '28491765'})
    };
  }

  obtenerCliente(id: Number):  Observable<any> {

    const url =  environment.domain_url + '/api/clientes/rescatarDatosCuenta?CLI_ID=' + id;
    return this.http.get<any>( url, this.httpOptions).pipe(
      retry(2)
    );
  }


  getClienteById(idCliente: number, typeCliente: number): Observable<any> {
    const url = environment.domain_url + '/api/clientes/rescatarDatosCuentaCliente?CLI_ID=' + idCliente + '&TYPE_CLI=' + typeCliente;
    return this.http.get<any>(url, this.httpOptions).pipe(
      retry(2)
    );
  }

  updateDatosCliente(cliente: Cliente): Observable<any> {
    const url = environment.domain_url +  '/api/usuarios/actualizarDatosCuenta';
    const objetoCliente = {
      USUARIO: {
        USU_ID: cliente.USU_ID ,
        USU_TIPO: '0',
        USU_ESTADO: cliente.USU_ESTADO,
        USU_ALIAS: cliente.USU_ALIAS,
        USU_EMAIL: cliente.USU_EMAIL
      }
    };

    return this.http.put<any>(url, objetoCliente, this.httpOptions).pipe(
      retry(2)
    );
  }

  updateFotoCliente(id: number, foto: any): Observable<any> {

    const datos = {
      USU_FOTO: foto,
      DOMINIO_URL: environment.domain_url,
      CLI_ID: id
    };
    const url = environment.domain_url + '/api/clientes/actualizarFoto';

    return this.http.put<any>(url, datos, this.httpOptions).pipe(
      retry(2)
    );
  }



  insertCliente(cliente: Cliente, tarjeta: Tarjeta, foto: any): Observable<any> {
    const url = environment.domain_url + '/api/clientes/insertar';

    const nuevoCliente = {
      USU_FOTO: foto,
      USUARIO: cliente,
      CLIENTE: cliente,
      JUR_RAZ_SOCIAL: cliente.JUR_RAZ_SOCIAL,
      TIP_EMP_ID: cliente.TIP_EMP_ID,
      TARJETA: tarjeta,
      DOMINIO_URL: environment.domain_url
    };
    return this.http.post<any>(url, nuevoCliente).pipe(
      retry(2)
    );
  }

  updateDatosPersonalesCliente(cliente: Cliente, juridico: JuridicoModels) {
    const url = environment.domain_url + '/api/clientes/actualizar';
    let datos;

    if (cliente.CLI_TIPO === 1) { // cliente juridico
      datos = {
        USUARIO: cliente,
        CLI_ID: cliente.CLI_ID,
        CLI_TIPO: cliente.CLI_TIPO,
        JURIDICO: {
          RAZON_SOCIAL: juridico.JUR_RAZ_SOCIAL,
          TIPO_EMPRESA_ID: juridico.TIP_EMP_ID
        }
      };
    } else { // cliente natural
      datos = {
        USUARIO: cliente,
        CLI_ID: cliente.CLI_ID,
        CLI_TIPO: cliente.CLI_TIPO
      };
    }
    return this.http.put<any>(url, datos, this.httpOptions).pipe(
      retry(2)
    );
  }


  updateContrasenaCliente(id: number, contrasenaAnterior: string, contrasenaNueva: string): Observable<any> {
    const datos = {
      CLI_ID: id ,
      CONTRASENIA_ANTERIOR: contrasenaAnterior,
      CONTRASENIA: contrasenaNueva
    };
    const url =  environment.domain_url +  '/api/clientes/actualizarContrasenia';
    return this.http.put<any>(url, datos , this.httpOptions).pipe(
      retry(2)
    );
  }

  listarSolicitudesPorCliente(id: Number):  Observable<any> {

    const url =  environment.domain_url + '/api/solicitudes/listarSolicitudesPorCliente?CLI_ID=' + id;

    return this.http.get<any>( url, this.httpOptions).pipe(
      retry(1)
    );
  }

  listarSolicitudesImagenes(id: Number):  Observable<any> {

    const url =  environment.domain_url + '/api/solicitudes/listarImagenesPorSolicitud?SOL_ID=' + id;
    return this.http.get<any>( url, this.httpOptions).pipe(
      retry(1)
    );
  }


  listarSolicitudPorCliente(id: Number,SOL_ID):  Observable<any> {

    const url =  environment.domain_url + '/api/solicitudes/obtenerSolicitudCliente?CLI_ID=' + id+'&SOL_ID='+SOL_ID;
    return this.http.get<any>( url, this.httpOptions).pipe(
      retry(1)
    );
  }

  //ESTA RUTA DEBERIA IR EN SU PROPIO SERVICIO DE MONEDA PERO POR MOTIVOS DE SIMPLICIDAD LO AGREGO EN ESTE SERVICIO
  rescatarSimboloMonedaPeru(): Observable<any>{
    const url =  environment.domain_url + '/api/monedas/rescatarSimboloMonedaPeru';

    return this.http.get<any>(url).pipe(
      retry(2)
    );
  }

}
