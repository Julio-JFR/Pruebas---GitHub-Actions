import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable} from 'rxjs';
import { retry } from 'rxjs/operators';
import { StorageService } from '../../../helpers/storage.service';
import { environment } from 'src/environments/environment';
import { EntidadCategoria } from './entidad-categoria';



@Injectable({
  providedIn: 'root'
})
export class CategoriasService {
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

  getCategorias(): Observable <EntidadCategoria[]> {
    const url = environment.domain_url + '/api/categorias/listar';
    return this.http.get<EntidadCategoria[]>(url, this.httpOptions).pipe(
      retry(2)
    );
  }
}
