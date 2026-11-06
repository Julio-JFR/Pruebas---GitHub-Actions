import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, switchMap } from 'rxjs/operators';
import { interval, Subscription,BehaviorSubject  } from 'rxjs';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class ServiceWorkerService {

  //Hola
  private url:string = `${environment.domain_url}/api`;
  // private url:string = 'https://notificacionesapi.muchiktec.com/formatomiloficios/api';

  private swReg: ServiceWorkerRegistration | null = null;

  private readonly VAPID_PUBLIC_KEY = 'BG47gT2k6rNuuF-6SRIBn4dYb1hbQhrIusE7nCZDMh_Irv5cb5WOtwNPWqtm0YmJ8lnVxLO6Beo6zBnpFFhQwKA';

  private idUsuarioActual = 0;

  // BehaviorSubject para compartir el estado con otros componentes
  private stateSubject = new BehaviorSubject<string>('false');

  // Observable que será consumido por el componente
  state$ = this.stateSubject.asObservable();

  //Esta bandera es para cambiar el estado del toggle del sidebar
  private banderaSubject = new BehaviorSubject<string>('false');

  bandera$ = this.banderaSubject.asObservable();

  constructor(private http: HttpClient) { 
    this.registerServiceWorker();
  }

  setBanderaToggleSidebar(valor: string) {
    this.banderaSubject.next(valor);
  }

  startVerification(valor:string): void {
    this.stateSubject.next(valor);
  }

  public getIdUsuarioActual(){
    return this.idUsuarioActual;
  }

  public setIdUsuarioActual(id: number){
    this.idUsuarioActual = id;
  }

  public getRegisterServiceWorker():ServiceWorkerRegistration | null{
    return this.swReg;
  }

  public async obtenerSuscripcion() {
    if (!this.swReg) {
      console.error('No hay registro del Service Worker');
      return null;
    }
    try {
      const subscription = await this.swReg.pushManager.getSubscription();
      if (subscription) {
        const { endpoint, keys } = subscription.toJSON();
        console.log('Suscripción encontrada:', subscription);
        return {
          endpoint,
          p256dh: keys?.['p256dh'], // Acceso con corchetes para evitar el error
          auth: keys?.['auth']       // Acceso con corchetes para evitar el error
        };
      } else {
        console.log('No hay suscripción activa.');
        return null;
      }
    } catch (error) {
      console.error('Error al obtener la suscripción:', error);
      return null;
    }
  }

  private async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        this.swReg = await navigator.serviceWorker.register('sw.js');
        this.checkSubscription();
      } catch (error) {
        console.error('Error al registrar el Service Worker:', error);
      }
    } else {
      console.log('Service Worker no soportado');
    }
  }

  private async checkSubscription() {
    if (!this.swReg) return;

    try {
      const subscription = await this.swReg.pushManager.getSubscription();
      if (subscription) {
        console.log('Ya existe una suscripción:', subscription);
      } else {
        console.log('No hay suscripción activa.');
      }
    } catch (error) {
      console.error('Error al verificar la suscripción:', error);
    }
  }

  /*public subscribeUser() {
    return new Promise((resolve, reject) => {

      if (!this.swReg) {
          console.error('No hay registro del Service Worker');
          return reject('No hay registro del Service Worker');
      }

      console.log("Registro del Service Worker encontrado:", this.swReg);

      const applicationServerKey = this.urlB64ToUint8Array(this.VAPID_PUBLIC_KEY);

      this.swReg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: applicationServerKey
      }).then((subscription) => {
          console.log('Suscripción creada exitosamente:', subscription);

          const { endpoint, keys } = subscription.toJSON();

          resolve({
              endpoint,
              p256dh: keys?.['p256dh'] || null,
              auth: keys?.['auth'] || null
          });
      }).catch((error) => {
          console.error('Error al suscribir al usuario:', error);
          reject(error);
      });
    });
  }*/

  public async subscribeUser() {
    if (!this.swReg) throw new Error('No hay registro del Service Worker');
    // console.log("Si llegue aca",this.swReg);
    try {

      const applicationServerKey = this.urlB64ToUint8Array(this.VAPID_PUBLIC_KEY);
      const subscription = await this.swReg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey
      });

      // console.log("Se suscribio correctamente",subscription.toJSON());
      const { endpoint, keys } = subscription.toJSON();
        // console.log('Suscripción creada:', subscription);
        return {
          endpoint,
          p256dh: keys?.['p256dh'], // Acceso con corchetes para evitar el error
          auth: keys?.['auth']       // Acceso con corchetes para evitar el error
        };
    } catch (error) {
      console.error('Error al suscribir al usuario:', error);
      throw error;
    }
  }

  private urlB64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');
    const rawData = window.atob(base64);
    return new Uint8Array([...rawData].map(char => char.charCodeAt(0)));
  }

  public sendNotification(idPara:number,idDe:number,servicioName:any,nombreEspecialista:any):Observable<any>{

    const localUrl = `${this.url}/notificationpush/sendNotificationWeb`;

    let cuerpoNotificacion = "\nTu solicitud del servicio "+ servicioName +
                             " ha sido aceptada por el especialista "+ nombreEspecialista +
                             ". \nHaz clic aquí para confirmarla";


    let titulo = "Tu solicitud ha sido aceptada";

    const bodyNotification = {
      id_receptor: idPara,
      id_emisor: idDe,
      bodyNotification: cuerpoNotificacion,
      titleNotification: titulo,
      urlNotification: "https://miloficiosdesa.muchiktec.com/app/cliente/mis-solicitudes" //Cambiar cuando hago pruebas
    }
    console.log('localUrl',localUrl);
    console.log('bodyNotification',bodyNotification);
    return this.http.post(localUrl, JSON.stringify(bodyNotification));
  }

  public sendNotificationMovil(idPara:number,servicioName:any,nombreEspecialista:any){

    const localUrl = `${this.url}/notificationpush/sendNotificationMovil`;
    console.log('localUrl',localUrl);
    let cuerpoNotificacion = "\nTu solicitud del servicio "+ servicioName +
                             " ha sido aceptada por el especialista "+ nombreEspecialista +
                             ". \nHaz clic aquí para confirmarla";


    let titulo = "Tu solicitud ha sido aceptada";

    const bodyNotification = {
      id_usuario: idPara,
      body: cuerpoNotificacion,
      title: titulo,
      imgURL: ""
    }
    console.log('bodyNotification',bodyNotification);
    return this.http.post(localUrl, JSON.stringify(bodyNotification));

  }

  guardarSubscripcion(objeto:any):Observable<any>{
    const localUrl = `${this.url}/token/createSuscribe`;
    console.log('localUrl',localUrl);
    console.log('objeto',JSON.parse(objeto));
    return this.http.post(localUrl,objeto);
  }

  cerrarSubscripcion(objeto:any):Observable<any>{
    const localUrl = `${this.url}/token/logoutSuscribe`;
    const objectClose = {
      auth_key: objeto.auth_key
    }
    return this.http.post(localUrl, JSON.stringify(objectClose));
  }

  isWebview() {
    var userAgent = window.navigator.userAgent.toLowerCase();

    var ios = /iphone|ipod|ipad/.test(userAgent);

    var iosWebview = ios && !/safari/.test(userAgent);

    var androidWebview = userAgent.includes('wv');

    var chrome = userAgent.includes('chrome') && !userAgent.includes('wv');

    return iosWebview || androidWebview;
  }
  
}
