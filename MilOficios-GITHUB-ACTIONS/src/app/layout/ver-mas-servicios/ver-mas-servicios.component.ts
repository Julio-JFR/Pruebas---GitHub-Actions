import { Component, OnInit,ViewChild } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import { StorageService } from 'src/app/helpers/storage.service';
import { EntidadServicio } from '../servicios/entidad-servicio';
import { ServiciosService } from '../servicios/servicios.service';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-ver-mas-servicios',
  templateUrl: './ver-mas-servicios.component.html',
  styleUrls: ['./ver-mas-servicios.component.scss']
})
export class VerMasServiciosComponent implements OnInit {
  listaServicios: EntidadServicio[];
  cargando:boolean;
  filtroTexto:string;
  mostrarAlerta = false;
  mensaje = '';
  tipoAlerta: string;
  IdCat :number;
  DOMINIO = environment.domain_url;
  constructor(
    private activatedRoute :ActivatedRoute,
    private servicioService: ServiciosService,
    private localStorageService:StorageService,
    private router:Router
    ) { }

  ngOnInit(): void {
    this.cargando = true;
    this.activatedRoute.params.subscribe( data => {
      this.obtenerServicios(data['idCategoria']);
    });
    this.filtroTexto = '';
  }
  obtenerServicios(IdCategoria: number){
    this.IdCat = IdCategoria;
    this.servicioService.getServiciosPorCategoria(IdCategoria).subscribe(data => {
      if(data['resultado'] === ''){
        this.tipoAlerta = 'warning';
        this.mostrarAlerta = true;
        this.mensaje = 'No hay servicios en esta categoría.';
        this.cerrarAlerta();
      }
      this.listaServicios = data['resultado'];
      this.cargando=false;
    }, error => {
      this.tipoAlerta = 'danger';
      this.mostrarAlerta = true;
      //if (error['error']['error'] !== undefined) {
        if (error['error']['error'] === 'error_BD') {
          this.mensaje = 'No se pudo obtener los datos, debido a la falla de alguna conexión. Por favor, intente otra vez.';
      } else {
        this.mensaje = ' Hubo un error al intentar mostrar los servicios. Por favor, intente otra vez.';
      }
      this.cerrarAlerta();
     //}
     //this.mensaje = ' Hubo un error al intentar mostrar los servicios. Por favor, intente otra vez.';
  });
  }
  goToDetails(url, servicio) {
    servicio["CAT_ID"] = this.IdCat;
    this.localStorageService.storeObjeto("SERVICIO", servicio );
    this.router.navigate([url]);
  } 
  cerrarAlerta(){
    setTimeout(() => {
      this.mostrarAlerta=false;
      this.mensaje="";
    }, 5000);
  }
}
