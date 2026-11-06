import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss']
})
export class NotFoundComponent implements OnInit {

  constructor(
    private router: Router) { }

  ngOnInit() {
  }

  regresar(){
    
    const cookies = localStorage.getItem('cookieConsent') === 'true';
    localStorage.setItem('cookieConsent', cookies ? 'true' : 'false');
    if(localStorage.getItem('MOVIL')=='1'){
      const tipoUsu = Number(localStorage.getItem('USE_TYPE_MOVIL'));
      let ruta = '';
      switch (tipoUsu) {
        case 1:
          ruta ='/especialistas/login/movil';
          break;
        case 2:
          ruta ='/clientes/login/movil';
          break;
        default:
          ruta ='/app/postulante/login/movil';
          break;
      }
      this.router.navigate([ruta]);
    }else
      this.router.navigate(["/home"]);
  }
}
