import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SolicitarServicioService {

  constructor() { }

  getCategorias(){
    let datos = [
      {"id": 1, "nombre": "categoria 1", "descripcion": "hola esto es una descripcion categoria 1 xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx " },
      {"id": 2, "nombre": "categoria 2", "descripcion": "hola esto es una descripcion categoria 2 xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" },
      {"id": 3, "nombre": "categoria 3", "descripcion": "hola esto es una descripcion categoria 3 xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" },
      {"id": 4, "nombre": "categoria 4", "descripcion": "hola esto es una descripcion categoria 4 xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" },
      {"id": 5, "nombre": "categoria 5", "descripcion": "hola esto es una descripcion categoria 5 xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" },
      {"id": 6, "nombre": "categoria 6", "descripcion": "hola esto es una descripcion categoria 6 xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" },
      {"id": 7, "nombre": "categoria 7", "descripcion": "hola esto es una descripcion categoria 7 xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" },
      {"id": 8, "nombre": "categoria 8", "descripcion": "hola esto es una descripcion categoria 8 xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" },
      {"id": 9, "nombre": "categoria 9", "descripcion": "hola esto es una descripcion categoria 9 xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" },
      {"id": 10, "nombre": "categoria 10", "descripcion": "hola esto es una descripcion categoria 10 xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" },
      {"id": 11, "nombre": "categoria 11", "descripcion": "hola esto es una descripcion categoria 11 xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" },
      {"id": 12, "nombre": "categoria 12", "descripcion": "hola esto es una descripcion categoria 12 xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" },
      {"id": 13, "nombre": "categoria 13", "descripcion": "hola esto es una descripcion categoria 13 xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" },
      {"id": 14, "nombre": "categoria 14", "descripcion": "hola esto es una descripcion categoria 14 xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" },
      {"id": 15, "nombre": "categoria 15", "descripcion": "hola esto es una descripcion categoria 15 xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" }
    ]
    
    return datos;
  }
}
