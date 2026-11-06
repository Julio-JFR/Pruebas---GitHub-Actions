import { EventEmitter, Injectable, Output } from '@angular/core';
import { HttpClient,  HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, Subject} from 'rxjs';
import { StorageService } from '../../helpers/storage.service';
import { Postulante } from './postulante.models';
import { environment } from 'src/environments/environment';
import { retry,tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class PostulanteService {
  @Output() postulanteUpdatedEvent: EventEmitter<boolean> = new EventEmitter();


  constructor(private http: HttpClient, private storageService: StorageService) { }

  //************************************** */
  usuarioUpdated() {
    this.postulanteUpdatedEvent.emit(true);
  }

  verificarCredenciales(postulante: Postulante) {
    const url = environment.domain_url +  '/api/postulantes/login';

    return this.http.post<any>(url, postulante).pipe(retry(2));
  }

  obtenerDetallesPostulante(POST_ID: number) {
    const url = environment.domain_url +  '/api/postulantes/obtenerDetallesPostulante?POST_ID=' + POST_ID;

    return this.http.get<any>(url).pipe(retry(2));
  }

  insertarPostulante( tipoPostulante: any, idIdioma: number, idDistrito: number, postulante: Postulante, EXPERIENCIAS_LABORALES: any, ESTUDIOS: any, CONTACTOS_REFERENCIA: any, datosJuridicos?:any  ): Observable <any>  {
    const url = environment.domain_url +  '/api/postulantes/insertar';

    let datos;

    if(tipoPostulante == 0){
      datos =
      {
        POSTULANTE : {
          POST_NOMBRES : postulante.POST_NOMBRES,
          POST_APE_PAT: postulante.POST_APE_PAT,
          POST_APE_MAT: postulante.POST_APE_MAT,
          POST_DNI: postulante.POST_DNI,
          POST_RUC: postulante.POST_RUC,
          POST_DIRECCION: postulante.POST_DIRECCION,
          POST_FECH_NACIMIENTO: postulante.POST_FECH_NACIMIENTO,
          POST_SEXO: postulante.POST_SEXO,
          POST_CELULAR: postulante.POST_CELULAR,
          POST_EMAIL: postulante.POST_EMAIL,
          POST_ALIAS: postulante.POST_ALIAS,
          POST_CONTRASENIA: postulante.POST_CONTRASENIA,
          POST_FOTO: postulante.POST_FOTO,
          POST_CV: postulante.POST_CV,
          DIST_ID:  Number(idDistrito),
          IDI_ID: Number(idIdioma),
          POST_TIPO: "0"
        },
        ESTUDIOS,
        EXPERIENCIAS_LABORALES,
        CONTACTOS_REFERENCIA,
        DOMINIO_URL: environment.domain_url
      }
    } else{
      datos =
      {
        POSTULANTE : {
          POST_NOMBRES : postulante.POST_NOMBRES,
          POST_APE_PAT: postulante.POST_APE_PAT,
          POST_APE_MAT: postulante.POST_APE_MAT,
          POST_DNI: postulante.POST_DNI,
          POST_RUC: postulante.POST_RUC,
          POST_DIRECCION: postulante.POST_DIRECCION,
          POST_FECH_NACIMIENTO: postulante.POST_FECH_NACIMIENTO,
          POST_SEXO: postulante.POST_SEXO,
          POST_CELULAR: postulante.POST_CELULAR,
          POST_EMAIL: postulante.POST_EMAIL,
          POST_ALIAS: postulante.POST_ALIAS,
          POST_CONTRASENIA: postulante.POST_CONTRASENIA,
          POST_FOTO: postulante.POST_FOTO,
          POST_CV: postulante.POST_CV,
          DIST_ID:  Number(idDistrito),
          IDI_ID: Number(idIdioma),
          POST_TIPO:"1"
        },
        DATOSJURIDICOS:{
          RAZON_SOCIAL: datosJuridicos.razonSocial,
          TIPO_EMPRESA: datosJuridicos.tipoEmpresa
        },
        EXPERIENCIAS_LABORALES,
        CONTACTOS_REFERENCIA,
        DOMINIO_URL: environment.domain_url
      }
    }
    return this.http.post<any>( url , datos).pipe( retry(2) );

  }

  // función para guardar el alias y la contraseña
  actualizarCuenta(POST_ALIAS: string, POST_ID: number, CONTRASENIA_ANTERIOR: string, CONTRASENIA: string) {
    const url = environment.domain_url + '/api/postulantes/actualizarCuenta';
    
    const httpOptions  = {
      headers: new HttpHeaders({'Authorization': 'Basic ' + this.storageService.getString('USE_SUB')})
    };
    return this.http.put<any>(url, {'POST_ALIAS': POST_ALIAS, 'POST_ID': POST_ID, 'CONTRASENIA_ANTERIOR': CONTRASENIA_ANTERIOR, 'CONTRASENIA': CONTRASENIA}, httpOptions).pipe(
       retry(2) );
  }

  // función para actualizar la foto
  actualizarFoto(POST_ID: number, POST_FOTO) {
    const url = environment.domain_url +  '/api/postulantes/actualizarFoto';

    const httpOptions  = {
      headers: new HttpHeaders({'Authorization': 'Basic ' + this.storageService.getString('USE_SUB')})
    };
    
    return this.http.put<any>(url, {'POST_ID': POST_ID, 'POST_FOTO': POST_FOTO, 'DOMINIO_URL': environment.domain_url}, httpOptions).pipe(
       retry(2) );
  }

  eliminarFoto (POST_ID: number, POST_FOTO) {
    
    const url = environment.domain_url +  '/api/postulantes/eliminarFoto';

    const httpOptions  = {
      headers: new HttpHeaders({'Authorization': 'Basic ' + this.storageService.getString('USE_SUB')})
    };
    
    return this.http.put<any>(url, {'POST_ID': POST_ID, 'POST_FOTO': POST_FOTO, 'DOMINIO_URL': environment.domain_url}, httpOptions).pipe(
       retry(2) );
  }
  
  // función para actualizar postulante
  actualizarPostulante(postulante: any) {
    const url = environment.domain_url +  '/api/postulantes/actualizar';

    const nuevoPostulante = {
      POST_ID: postulante.post_id,
      POST_NOMBRES: postulante.post_nombres,
      POST_APE_PAT: postulante.post_ape_pat,
      POST_APE_MAT: postulante.post_ape_mat,
      POST_EMAIL: postulante.post_email,
      POST_CELULAR: postulante.post_celular,
      POST_DNI: postulante.post_dni,
      POST_SEXO: postulante.post_sexo,
      POST_FECH_NACIMIENTO: postulante.post_nacimiento,
      POST_DIRECCION: postulante.post_direccion,
      PAI_ID: postulante.post_pai_id,
      REG_ID: postulante.post_reg_id,
      PRO_ID: postulante.post_pro_id,
      DIST_ID: postulante.post_dist_id,
    };

    const httpOptions  = {
      headers: new HttpHeaders({'Authorization': 'Basic ' + this.storageService.getString('USE_SUB')})
    };

    return this.http.post<any>(url, nuevoPostulante, httpOptions).pipe(
       retry(2) );
  }

  actualizarPostulanteInfo(postulante: any) {
    const url = environment.domain_url +  '/api/postulantes/actualizarDatosPersonales';

    const nuevoPostulante = {
      POST_ID: postulante.post_id,
      POST_NOMBRES: postulante.post_nombres,
      POST_APE_PAT: postulante.post_ape_pat,
      POST_APE_MAT: postulante.post_ape_mat,
      POST_EMAIL: postulante.post_email,
      POST_CELULAR: postulante.post_celular,
      POST_DNI: postulante.post_dni,
      POST_RUC: postulante.post_ruc,
      POST_SEXO: postulante.post_sexo,
      POST_FECH_NACIMIENTO: postulante.post_nacimiento,
      POST_DIRECCION: postulante.post_direccion,
      PAI_ID: postulante.post_pai_id,
      REG_ID: postulante.post_reg_id,
      PRO_ID: postulante.post_pro_id,
      DIST_ID: postulante.post_dist_id,
    };

    const httpOptions  = {
      headers: new HttpHeaders({'Authorization': 'Basic ' + this.storageService.getString('USE_SUB')})
    };

    return this.http.put<any>(url, nuevoPostulante, httpOptions).pipe(
       retry(2) );
  }

  actualizarPostulanteJuridico(postulante: any) {
    const url = environment.domain_url +  '/api/postulantes/actualizarDatJuridicos';

    const nuevoPostulante = {
      POST_ID: postulante.POST_ID,
      JUR_RAZ_SOCIAL: postulante.razonSocial,
      JUR_RUC: postulante.ruc,
      TIP_EMP_ID: postulante.tipoEmpresa,
    };

    const httpOptions  = {
      headers: new HttpHeaders({'Authorization': 'Basic ' + this.storageService.getString('USE_SUB')})
    };

    return this.http.put<any>(url, nuevoPostulante, httpOptions).pipe(
       retry(2) );
  }

  // Esta función actualizará el cv del postulante
  actualizarCvPostulante(POST_ID: number, POST_CV: string){
    const url = environment.domain_url +  '/api/postulantes/actualizarCv';

    const httpOptions  = {
      headers: new HttpHeaders({'Authorization': 'Basic ' + this.storageService.getString('USE_SUB')})
    };
    return this.http.post<any>(url, {'POST_ID': POST_ID, 'POST_CV': POST_CV, "DOMINIO_URL": environment.domain_url},httpOptions).pipe(
       retry(2) );
  }
  
  // Esta función es para obtener el cv 
  listarCv(POST_ID: number){
    const url = environment.domain_url +  '/api/postulantes/obtenerCv?POST_ID=' + POST_ID;
    
    const httpOptions  = {
      headers: new HttpHeaders({'Authorization': 'Basic ' + this.storageService.getString('USE_SUB')})
    };
    
    return this.http.get<any>(url,httpOptions).pipe(retry(2));
  }

  // Esta función solo obtendrá el alias y la foto
  obtenerCuentaPostulante(POST_ID: number) {
    const url = environment.domain_url +  '/api/postulantes/obtenerCuenta?POST_ID=' + POST_ID;
    
    const httpOptions  = {
      headers: new HttpHeaders({'Authorization': 'Basic ' + this.storageService.getString('USE_SUB')})
    };
    
    return this.http.get<any>(url,httpOptions).pipe(retry(2));
  }

  // Esta función obtendrá los datos básicos de un postulante
  obtenerPostulante(POST_ID: number) {
    const url = environment.domain_url +'/api/postulantes/obtenerPostulante?POST_ID=' + POST_ID;

    const httpOptions  = {
      headers: new HttpHeaders({'Authorization': 'Basic ' + this.storageService.getString('USE_SUB')})
    };

    return this.http.get<any>(url,httpOptions).pipe(retry(2));
  }

  obtenerPostulanteResolver(POST_ID: number) {
    const url = environment.domain_url +'/api/postulantes/obtenerPostulante?POST_ID=' + POST_ID;

    const httpOptions  = {
      headers: new HttpHeaders({'Authorization': 'Basic ' + this.storageService.getString('USE_SUB')})
    };
    return this.http.get<any>(url, httpOptions).pipe(
      tap((response) => {
        // this._postulante.next(response['Resultado']);
      })
    ); 

    // return this.http.get<any>(url,httpOptions).pipe(retry(2));
  }


  // Esta función cambia la contraseña del postulante
  cambiarContrasena(contrasena: string) {
    const url = environment.domain_url + '/api/postulantes/cambiarContrasenia';
    const nuevaContrasena = {
      POST_ALIAS : this.storageService.getString('USE_USUARIO'),
      CONTRASENIA: contrasena
    };
    
    return this.http.post<any>(url, nuevaContrasena).pipe(retry(2));
  }

  //Esta función es para recuperar la cuenta del postulante en caso se le olvide la contraseña (cambia la contraseña olvidada por uno autogenerada por el api)
  

  estaBloqueado(POST_ID: number){
    const url = environment.domain_url +  '/api/postulantes/estaBloqueado';

    const httpOptions  = {
      headers: new HttpHeaders({'Authorization': 'Basic ' + this.storageService.getString('USE_SUB')})
    };

    return this.http.post<{error:string,mensaje:string,exito:boolean}>(url,{"POST_ID":POST_ID},httpOptions).pipe(retry(2));
  }
  buscarAliasPostulante(identificador:any) {

    const url = environment.domain_url + '/api/postulantes/recuperarAlias?POST_IDENTIFICADOR='+identificador;
    return this.http.get<any>(url).pipe(retry(2));
  }
  
  solicitudCambioContrasena(email:string){
    const url = environment.domain_url + '/api/postulantes/solicitarCodigoRecuperacionCuenta?POST_EMAIL='+email;
    return this.http.get<any>(url).pipe(retry(2));
  }
  verificiarCodigoRecuperacion(codigoVerficacion:string,email:string){
    const url = environment.domain_url + '/api/postulantes/verificarCodigoRecuperacion?POST_COD_REC='+codigoVerficacion+'&POST_EMAIL='+email;
    return this.http.get<any>(url).pipe(retry(2));
  }
  actualizarDatosJuridicosPostulante(datos:any){
    const url = environment.domain_url + '/api/JuridicoEspecialista/actualizarJuridicoPostulante';

    const httpOptions  = {
      headers: new HttpHeaders({'Authorization': 'Basic ' + this.storageService.getString('USE_SUB')})
    };

    return this.http.put<any>(url,datos,httpOptions).pipe(retry(2));
  }
}
