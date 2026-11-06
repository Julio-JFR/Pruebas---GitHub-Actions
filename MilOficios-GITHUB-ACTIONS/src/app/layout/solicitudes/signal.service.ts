import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SignalService {
  private hubConnection: signalR.HubConnection | undefined;
  private localStorageSubject = new BehaviorSubject<string>('');

  public localStorage$ = this.localStorageSubject.asObservable();

  constructor() {
    this.startConnection();
  }

  // Inicia la conexión a SignalR
  private startConnection(): void {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:7124/signalr') // URL de tu backend SignalR
      .build();

    this.hubConnection
      .start()
      .then(() => {
        console.log('SignalR Connected');
      })
      .catch(err => {
        console.error('SignalR connection failed: ', err);
      });

    // Escucha el evento de actualización de LocalStorage
    this.hubConnection.on('ReceiveLocalStorageUpdate', (message: string) => {
      this.localStorageSubject.next(message);
    });
  }
}