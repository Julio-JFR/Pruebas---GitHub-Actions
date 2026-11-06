import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-modal-politica',
  templateUrl: './modal-politica.component.html',
  styleUrls: ['./modal-politica.component.scss']
})
export class ModalPoliticaComponent implements OnInit {

  checkCookies:boolean=false;
  checkPrivacidad:boolean=false;
  rutaPolitica:string=environment.domain_url+'/archivos/';

  constructor(public modal: NgbModal) { }

  ngOnInit(): void {
  }

  abrirVentana(tipo){
    if(tipo==1)
      window.open(this.rutaPolitica+'PoliticaDeCookies.pdf', "_blank");
    if(tipo==2)
      window.open(this.rutaPolitica+'PoliticaPrivacidadDatos.pdf', "_blank");
  }

  closeModal(): any {
    this.modal.dismissAll();
  }

}
