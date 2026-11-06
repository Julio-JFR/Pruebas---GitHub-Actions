import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NavigationEnd, Router, Data, ActivatedRoute, NavigationStart, NavigationCancel, NavigationError } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Especialista } from '../especialista.model';
import { EspecialistasService } from '../especialistas.service';
import { StorageService } from '../../../helpers/storage.service';

@Component({
  selector: 'app-especialistas-sidebar',
  templateUrl: './especialistas-sidebar.component.html',
  styleUrls: ['./especialistas-sidebar.component.scss']
})
export class EspecialistasSidebarComponent implements OnInit {

  isActive: boolean;
  collapsed: boolean;
  pushRightClass: string;

  TITULO = 'Mi Cuenta';
  ESPECIALISTA: Especialista = new Especialista;
  TIPO_ESPECIALISTA: number; //0 persona y 1 empresa
  LOADING = false;

  constructor(private translate: TranslateService, public router: Router, private especialistasService: EspecialistasService,
    private storageService: StorageService,
    private route: ActivatedRoute) {
    this.router.events.subscribe(val => {
      if (
          val instanceof NavigationEnd &&
          window.innerWidth <= 992 &&
          this.isToggled()
      ) {
          this.toggleSidebar();
      }

      if(val instanceof NavigationStart){
        this.LOADING = true;
      }
      if(val instanceof NavigationEnd || val instanceof NavigationCancel || val instanceof NavigationError){
        this.LOADING = false;
      }

    });
    this.idEspecialista = Number(localStorage.getItem('USE_ID'));
    //this.TITULO = localStorage.getItem('USE_NAMES');
    
   }

  idEspecialista: number;

  @Output() collapsedEvent = new EventEmitter<boolean>();

  ngOnInit(): void {
    this.isActive = false;
    this.collapsed = false;
    this.obtenerData();
  }

  obtenerData() {
    this.route.data.subscribe( (data: Data) => {
      if (data['especialistaSidebar'] !== null) {
        this.TIPO_ESPECIALISTA = data['especialistaSidebar']['Resultado'][0]['POST_TIPO'];
        (this.TIPO_ESPECIALISTA ==1)?this.TITULO = data['especialistaSidebar']['Resultado'][0]['JUR_RAZ_SOCIAL']:this.TITULO = localStorage.getItem('USE_NAMES');
        this.storageService.storeString('ESP_TYPE',this.TIPO_ESPECIALISTA.toString());
        this.storageService.storeString('ESP_TITLE',this.TITULO.toString());
      }
    }, error => {
    }

    );
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
