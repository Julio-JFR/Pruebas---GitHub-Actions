import { Component, ElementRef, Input, OnInit, ViewChild   } from '@angular/core';
import { environment } from 'src/environments/environment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { StorageService } from '../../helpers/storage.service';
import {NavbarService} from './navbar.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  intranetUrl = environment.intranet_url;
  tipoPersona = 0;
  public isCollapsed = false;
  public isMenuCollapsed = true;
  isToggled = true;

  @Input() isMovil: boolean = false;
  constructor(
    public modal: NgbModal,
    public router: Router,
    private storageService: StorageService,
    private navbarService: NavbarService
  ) { }
  @ViewChild('tPersona') elementModalTipoPersona: ElementRef;
  @ViewChild('tEspecialista') elementModalTipoEspecialista: ElementRef;

  ngOnInit(): void {
  }
  closeModal(): any {
    this.modal.dismissAll();
  }
  mostrarTipoPersona() {
    this.modal.open(this.elementModalTipoPersona);
  }
  mostrarTipoEspecialista(){
    this.modal.open(this.elementModalTipoEspecialista);
  }
  redireccionarRegistroEspecialistaPersona() {
    this.storageService.storeString('MOVIL','0');
    this.navbarService.definirTipoEspecialista(0); // persona.
    this.router.navigate(['registro-postulante']);
    this.modal.dismissAll();
  }
  redireccionarRegistroEspecialistaEmpresa() {
    this.storageService.storeString('MOVIL','0');
    this.navbarService.definirTipoEspecialista(1); // empresa
    this.router.navigate(['registro-postulante']);
    this.modal.dismissAll();
  }
  redireccionarRegistroClienteJuridico() {
    this.storageService.storeString('MOVIL','0');
    this.navbarService.obtenerTipoUsuario(1); // juridico.
    this.router.navigate(['registro-cliente']);
    this.modal.dismissAll();
  }
  redireccionarRegistroClienteNatural() {
    this.storageService.storeString('MOVIL','0');
    this.navbarService.obtenerTipoUsuario(0); // natural
    this.router.navigate(['registro-cliente']);
    this.modal.dismissAll();
  }

  redirectToLogin(url){
    this.router.navigate([url]);
  }
}
