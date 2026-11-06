import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NavigationEnd, Router, Data, ActivatedRoute, NavigationStart, NavigationCancel, NavigationError } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { StorageService } from '../../../helpers/storage.service';
import { Postulante } from '../postulante.models';

@Component({
  selector: 'app-postulante-sidebar',
  templateUrl: './postulante-sidebar.component.html',
  styleUrls: ['./postulante-sidebar.component.scss']
})
export class PostulanteSidebarComponent implements OnInit {

  isActive: boolean;
  collapsed: boolean;
  pushRightClass: string;

  TITULO = 'Mi Cuenta';
  POSTULANTE: Postulante = new Postulante;
  TIPO_POSTULANTE: number; //0 persona y 1 empresa
  LOADING = false;

  constructor(private translate: TranslateService, public router: Router,
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
    this.idEspecialista = Number(localStorage.getItem('POST_ID'));
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
      if (data['postulanteSidebar'] !== null) {
        this.TIPO_POSTULANTE = data['postulanteSidebar']['Resultado']['POST_TIPO'];
        let nombre = data['postulanteSidebar']['Resultado']['POST_NOMBRES']+' ' +data['postulanteSidebar']['Resultado']['POST_APE_PAT']+' ' +data['postulanteSidebar']['Resultado']['POST_APE_MAT'];
        this.TIPO_POSTULANTE ==1 ? this.TITULO = data['postulanteSidebar']['Resultado']['JUR_RAZ_SOCIAL'] : this.TITULO = nombre;
        this.storageService.storeString('POS_TYPE',this.TIPO_POSTULANTE.toString());
        this.storageService.storeString('POS_TITLE',this.TITULO.toString());
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
