import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import {AuthSesionGuard} from './shared/guard/auth.sesion.guard';
import { HomeGuard } from './shared/guard/homeGuard.guard';
import { LayoutComponent } from './layout/layout.component';
import { AuthGuard } from './shared/guard/authGuard.guard';
import { AuthRegistroClienteGuard } from './shared/guard/auth-registroCliente.guard';
import { AuthRegistroPostulanteGuard } from './shared/guard/auth-registroPostulante.guard';
import { AuthTrabajoEnEjecucionGuard } from './shared/guard/auth-trabajoEnEjecucion.guard';
import { AuthGuardNotFound } from './shared/guard/authGuardNotFound';
const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' }, // Redirección inicial
    {
      path: '',
      component: AppComponent,
      children: [
        { path: 'home', loadChildren: () => import('./home/home.module').then(m => m.HomeModule), canActivate: [HomeGuard] },
        { path: 'calificar-servicio/:idServicio', loadChildren: () => import('./calificar-servicio-correo/calificar-servicio-correo.module').then(m => m.CalificarServicioCorreoModule) },
        { path: 'especialistas/login',canActivate: [AuthGuard],  loadChildren: () => import('./login/login-especialista/login-especialista.module').then(m => m.LoginEspecialistaModule) },
        { path: 'especialistas/login/movil',canActivate: [AuthGuard],  loadChildren: () => import('./login-movil/login-especialista-movil/login-especialista-movil.module').then(m => m.LoginEspecialistaMovilModule) },
        { path: 'clientes/login',canActivate: [AuthGuard],  loadChildren: () => import('./login/login-cliente/login-cliente.module').then(m => m.LoginClienteModule) },
        { path: 'clientes/login/movil',canActivate: [AuthGuard],  loadChildren: () => import('./login-movil/login-cliente-movil/login-cliente-movil.module').then(m => m.LoginClienteMovilModule) },
        { path: 'postulante/login',canActivate: [AuthGuard],  loadChildren: () => import('./login/login-postulante/login-postulante.module').then(m => m.LoginPostulanteModule) },
        { path: 'postulante/login/movil',canActivate: [AuthGuard],  loadChildren: () => import('./login-movil/login-postulante-movil/login-postulante-movil.module').then(m => m.LoginPostulanteMovilModule) },
        { path: 'error', canActivate:[AuthGuardNotFound], loadChildren: () => import('./server-error/server-error.module').then(m => m.ServerErrorModule) },
        { path: 'not-found', canActivate:[AuthGuardNotFound], loadChildren: () => import('./not-found/not-found.module').then(m => m.NotFoundModule) },
        { path: 'registro-cliente', canActivate: [AuthRegistroClienteGuard], loadChildren: () => import('./layout/clientes/cliente-registro/cliente-registro.module').then(m => m.ClienteRegistroModule)},
        { path: 'registro-postulante', canActivate: [AuthRegistroPostulanteGuard, AuthTrabajoEnEjecucionGuard], loadChildren: () => import('./layout/postulante/postulante-registro/postulante-registro.module').then(m => m.PostulanteRegistroModule)},

        // { path: 'registros',
        //   children:[
        //     //  ./clientes/cliente-registro/cliente-registro.module
        //     { path: 'registro-cliente', canActivate: [AuthRegistroClienteGuard], loadChildren: () => import('./layout/clientes/cliente-registro/cliente-registro.module').then(m => m.ClienteRegistroModule)},
        //     { path: 'registro-postulante', canActivate: [AuthRegistroPostulanteGuard, AuthTrabajoEnEjecucionGuard], loadChildren: () => import('./layout/postulante/postulante-registro/postulante-registro.module').then(m => m.PostulanteRegistroModule)},
        //   ]
        // }
      ],
    },
  
    // con token use_sub
    {
      path: 'app', 
      loadChildren: () => import('./layout/layout.module').then(m => m.LayoutModule),
    },
    // {
    //   path: 'cliente',
    //   component: LayoutComponent, // Componente principal para "cliente"
    //   canActivate: [AuthGuard],
    //   loadChildren: () => import('./layout/layout.module').then(m => m.LayoutModule),
    // },
    // {
    //   path: 'especialista',
    //   component: LayoutComponent, // Componente principal para "especialista"
    //   canActivate: [AuthGuard],
    //   loadChildren: () => import('./layout/layout.module').then(m => m.LayoutModule),
    // },
    // Ruta comodín para manejar rutas no encontradas
  ];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {}
