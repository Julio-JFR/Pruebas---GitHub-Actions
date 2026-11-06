import { Component, OnInit,Output, EventEmitter  } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import {ClienteService} from '../cliente.service';
import { TranslateService } from '@ngx-translate/core';
import { Cliente } from '../cliente.model';

@Component({
  selector: 'app-cliente-sidebar',
  templateUrl: './cliente-sidebar.component.html',
  styleUrls: ['./cliente-sidebar.component.scss']
})
export class ClienteSidebarComponent implements OnInit {

  isActive: boolean;
  collapsed: boolean;
  pushRightClass: string;
  idCliente: number;

  @Output() collapsedEvent = new EventEmitter<boolean>();

  TITULO = 'Mi Cuenta';
  CLIENTE: Cliente;

  constructor(private translate: TranslateService, public router: Router,
    private clienteService: ClienteService) {
    this.router.events.subscribe(val => {
      if (
          val instanceof NavigationEnd &&
          window.innerWidth <= 992 &&
          this.isToggled()
      ) {
          this.toggleSidebar();
        }
    });

    
    this.idCliente = Number(localStorage.getItem('USE_ID'));

  }

  

  ngOnInit(): void {
    this.isActive = false;
    this.collapsed = false;
    let typeUser =Number(localStorage.getItem('USE_TYPE')); 
    this.clienteService.getClienteById(Number(localStorage.getItem('USE_ID')), typeUser).subscribe(
      (CLIENTE) => {
        this.CLIENTE = CLIENTE['Resultado'][0];
        this.TITULO = this.CLIENTE.USU_NOMBRES + ' ' + this.CLIENTE.USU_APE_PAT + ' ' + this.CLIENTE.USU_APE_MAT;
    });
  }
  

  

  toggleCollapsed() {
    this.collapsed = !this.collapsed;
    this.collapsedEvent.emit(this.collapsed);
  }

  isToggled(): boolean {
    const dom: Element = document.querySelector('body');
    return dom.classList.contains(this.pushRightClass);
  }

  toggleSidebar() {
    const dom: any = document.querySelector('body');
    dom.classList.toggle(this.pushRightClass);
  }

  rltAndLtr() {
    const dom: any = document.querySelector('body');
    dom.classList.toggle('rtl');
  }

  changeLang(language: string) {
    this.translate.use(language);
  }

}
