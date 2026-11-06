import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { RoutingService } from 'src/app/helpers/routing.service';
import { StorageService } from 'src/app/helpers/storage.service';
import { UsuariosService } from '../usuarios.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/app/authorization/auth.service';
import { Router } from '@angular/router';
import {NgbAlert} from '@ng-bootstrap/ng-bootstrap';
import { passwordValidation } from 'src/app/shared/modules/password-validation/password-validation.directive';

@Component({
  selector: 'app-cambio-contrasena',
  templateUrl: './cambio-contrasena.component.html',
  styleUrls: ['./cambio-contrasena.component.scss']
})


export class CambioContrasenaComponent implements OnInit {

  @ViewChild('modalConfirmarCambio') confirmacionPassword: ElementRef
  @ViewChild('selfClosingAlert', {static: false}) selfClosingAlert: NgbAlert;
  
  CONTRASENA = '';
  PASSWORD_CURRENT_ICON = 'fa fa-eye-slash';
  PASSWORD_CURRENT_TYPE = 'password';
  PASSWORD_NEW_ICON = 'fa fa-eye-slash';
  PASSWORD_NEW_TYPE = 'password';
  contrasenaForm: any;
  USE_TYPE: any ;
  cargando: boolean;
  mensaje: string;
  tipoAlerta: string;
  mostrarAlerta: boolean;
  tipo: number;
  mensaje_modal: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private modal: NgbModal,
    public router: Router,
    private usuarioService: UsuariosService,
    private storageService: StorageService,
    private routingService: RoutingService,
    private authService: AuthService
  ) {
    this.cargando = false;
  }

  ngOnInit(): void {
    this.usuarioService.updateHeaders();
    this.contrasenaForm =  this.formBuilder.group({
      form_contrasena_nueva: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(20)]],
      form_contrasena_confimada: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(20),passwordValidation()]]
    });
    this.USE_TYPE = Number(localStorage.getItem('USE_TYPE'));
  }
  cerrarAlerta(){
    setTimeout(() => {
      this.mostrarAlerta=false;
      this.mensaje="";
    }, 5000);
  }
  
  cambiarContrasena() {
    this.cargando = true;
    this.saveValuesContrasena();
    if (this.form_contrasena_nueva.value === this.form_contrasena_confimada.value) {
      this.usuarioService.cambiarContrasena(this.CONTRASENA).subscribe(
        (resultado) => {
          this.cargando = false;
          this.mostrarAlerta = true;
          this.tipoAlerta = 'success';
          this.mensaje = 'Contraseña cambiada exitosamente';
          this.cerrarAlerta();
          this.mensaje_modal = true;
          this.confirmarCambioPassword();
        },
        (error) => {
          this.mensaje_modal = false;
          this.cargando = false;
          this.mostrarAlerta = true;
          this.tipoAlerta = 'danger';
          if (error['error']['error'] !== undefined) {
            if (error['error']['error'] === 'error_noExistenciaDeAlias') {
              this.mensaje = 'Ocurrió un problema al actualizar su contraseña debido a que su nombre de usuario ya no se encuentra registrado. Por favor, intente de nuevo.';
            } else if (error['error']['error'] === 'error_deBD') {
              this.mensaje = 'Hubo un error al intentar ejecutar su solicitud para cambiar su contraseña. Por favor, intente de nuevo.';
            } else if (error['error']['error'] === 'error_deCampo') {
              this.mensaje = 'Los datos ingresados deben respetar los formatos permitidos. Por favor, intente de nuevo.';
            }
          } else {
            this.mensaje = 'Hubo un error al intentar cambiar su contraseña. Por favor, intente de nuevo';
          }
          this.cerrarAlerta();
        }
      );
    } else {
      this.cargando = false;
      this.mostrarAlerta = true;
      this.tipoAlerta = 'danger';
      this.mensaje = 'Las contraseñas no coinciden';
      this.cerrarAlerta();
    }
  }

  cambiarVistaContrasenaActual() {
    if (this.PASSWORD_CURRENT_ICON === 'fa fa-eye-slash') {
      this.PASSWORD_CURRENT_ICON = 'fa fa-eye';
      this.PASSWORD_CURRENT_TYPE = 'text';
    } else {
      this.PASSWORD_CURRENT_ICON = 'fa fa-eye-slash';
      this.PASSWORD_CURRENT_TYPE = 'password';
    }
  }

  cambiarVistaContrasenaNueva() {
    if (this.PASSWORD_NEW_ICON === 'fa fa-eye-slash') {
      this.PASSWORD_NEW_ICON = 'fa fa-eye';
      this.PASSWORD_NEW_TYPE = 'text';
    } else {
      this.PASSWORD_NEW_ICON = 'fa fa-eye-slash';
      this.PASSWORD_NEW_TYPE = 'password';
    }
  }

  confirmarCambioPassword() {
    this.modal.open(this.confirmacionPassword);
  }
  redireccion(){
    this.authService.onLoggedout();
    if(this.USE_TYPE===0){
      this.router.navigate(['cliente/login'])
      this.modal.dismissAll();
    }else if(this.USE_TYPE===1){
      this.router.navigate(['especialista/login'])
      this.modal.dismissAll();
    }
    
  }
  get form_contrasena_nueva() {
    return this.contrasenaForm.get('form_contrasena_nueva');
  }

  get form_contrasena_confimada() {
    return this.contrasenaForm.get('form_contrasena_confimada');
  }

  saveValuesContrasena() {
    this.CONTRASENA = this.form_contrasena_nueva.value;
  }

}
