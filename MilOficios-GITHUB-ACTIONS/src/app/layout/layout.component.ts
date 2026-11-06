import { Component, OnInit ,ViewChild} from '@angular/core';
import { StorageService } from '../helpers/storage.service';
import {ServicioRealizadoService} from './servicios/servicios-realizados/servicio-realizado.service';
import {NgbAlert} from '@ng-bootstrap/ng-bootstrap';
import {NavbarService} from '../shared/navbar/navbar.service'
import { Router } from '@angular/router';

@Component({
    selector: 'app-layout',
    templateUrl: './layout.component.html',
    styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {

    collapedSideBar: boolean;

    typeOfUser: any;
    page = 'registration';
    IS_LOGUEO: boolean;
    mostrarAlerta = false;
    mensaje = '';
    tipoAlerta: string;

    constructor(private storageService: StorageService,
        private servicioRealizadoService:ServicioRealizadoService,private navbarService:NavbarService,private router:Router) {}
    
    @ViewChild('selfClosingAlert', {static: false}) selfClosingAlert: NgbAlert;
    ngOnInit() {
        console.log('1');
        if(Number(this.storageService.getString('BanderaLogin'))===1){
            this.alertaServiciosPendientes();
        }

        this.typeOfUser = localStorage.getItem('USE_TYPE');
        this.getDefaultPage();
        this.IS_LOGUEO = this.storageService.hasKey("USE_SUB");
    }

    alertaServiciosPendientes(){
        this.servicioRealizadoService.obtenerCantidadDeServiciosPendientesDeCalificaciónPorCliente(parseInt(this.storageService.getString('USE_ID'))).subscribe(
             data =>{
                 if(data['resultado'] > 0){
                    this.mostrarAlerta = true;
                    this.tipoAlerta= 'warning';
                    if(data['resultado'] === 1)
                        this.mensaje = 'Tiene ' +data['resultado'] + ' servicio pediente de calificación. Para calificar haga click ' ;
                    else 
                        this.mensaje = 'Tiene ' +data['resultado'] + ' servicios pedientes de calificación. Para calificar haga click ' ;    
                    this.cerrarAlerta();
                }
                this.storageService.remove('BanderaLogin');
             },error =>{

        });
    }

    cerrarAlerta(){
        setTimeout(() => {
          if(this.selfClosingAlert) {
            this.selfClosingAlert.close();
          }
          }, 30000);
      } 
    receiveCollapsed($event) {
        this.collapedSideBar = $event;
    }

    getDefaultPage() {
        switch (this.typeOfUser) {
            case '-1':
                this.page = 'registration';
            break;
            case '0':
                this.page = 'charts';
            break;
            case '1':
                this.page = 'dashbord';
            break;
        }
    }

    redireccionarMisSolicitudesServiciosRealizados(){
        this.navbarService.enviarBanderaAlerta(0);
        this.navbarService.disparadorNavbar.emit({
            data: 3
        });
        this.router.navigate(['mis-solicitudes']);
    }

}
