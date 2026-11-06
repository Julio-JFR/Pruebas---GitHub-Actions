import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutComponent } from './layout.component';
import {RealizarServicioResolver} from './realizar-servicio-resolver/realizarServicio-resolver.service';
import { AuthEspecilistasGuard } from '../shared/guard/auth.especilistas.guard';
import { AuthChangePasswordGuard } from '../shared/guard/auth.change-password.guard';
import { AuthPostulanteGuard } from '../shared/guard/auth-postulante.guard';
import {AuthRegistroClienteGuard} from '../shared/guard/auth-registroCliente.guard';
import {AuthRegistroPostulanteGuard} from '../shared/guard/auth-registroPostulante.guard';
import {AuthRealizarServicioGuard} from '../shared/guard/auth-realizarServicio.guard';
import {AuthTrabajoEnEjecucionGuard} from '../shared/guard/auth-trabajoEnEjecucion.guard';
import {EspecialistaSidebarResolver} from '../layout/especialistas-resolver/sidebar-resolver.service';

import {AuthClienteGuard} from '../shared/guard/aut.clientes.guard';
import {AuthDatoServicio} from '../shared/guard/aut.client-datoservicio.guard';
import { PostulanteSidebarResolver } from './postulante/poaSidebar-resolver.service';

const routes: Routes = [
    {
      path: '',
      component: LayoutComponent,
      children: [
        // Rutas para especialistas
        {
          path: 'especialista',
          children: [
            {
              path: 'profile',
              resolve: { especialistaSidebar: EspecialistaSidebarResolver },
              canActivate: [AuthEspecilistasGuard, AuthRealizarServicioGuard, AuthTrabajoEnEjecucionGuard],
              loadChildren: () =>
                import('./especialistas/especialistas-profile/especialistas-profile.module').then(
                  (m) => m.EspecialistasProfileModule
                ),
            },
            {
              path: 'personal-info',
              resolve: { especialistaSidebar: EspecialistaSidebarResolver },
              canActivate: [AuthEspecilistasGuard, AuthRealizarServicioGuard, AuthTrabajoEnEjecucionGuard],
              loadChildren: () =>
                import('./especialistas/especialistas-personal-info/especialistas-personal-info.module').then(
                  (m) => m.EspecialistasPersonalInfoModule
                ),
            },
            {
              path: 'academic-info',
              resolve: { especialistaSidebar: EspecialistaSidebarResolver },
              canActivate: [AuthEspecilistasGuard, AuthRealizarServicioGuard, AuthTrabajoEnEjecucionGuard],
              loadChildren: () =>
                import('./especialistas/especialistas-academic-info/especialistas-academic-info.module').then(
                  (m) => m.EspecialistasAcademicInfoModule
                ),
            },
            {
              path: 'working-info',
              resolve: { especialistaSidebar: EspecialistaSidebarResolver },
              canActivate: [AuthEspecilistasGuard, AuthRealizarServicioGuard, AuthTrabajoEnEjecucionGuard],
              loadChildren: () =>
                import('./especialistas/especialistas-working-info/especialistas-working-info.module').then(
                  (m) => m.EspecialistasWorkingInfoModule
                ),
            },
            {
              path: 'payment-details',
              resolve: { especialistaSidebar: EspecialistaSidebarResolver },
              canActivate: [AuthEspecilistasGuard, AuthRealizarServicioGuard, AuthTrabajoEnEjecucionGuard],
              loadChildren: () =>
                import('./especialistas/especialistas-payment-details/especialistas-payment-details.module').then(
                  (m) => m.EspecialistasPaymentDetailsModule
                ),
            },
            {
              path: 'service',
              resolve: { especialistaSidebar: EspecialistaSidebarResolver },
              canActivate: [AuthEspecilistasGuard, AuthRealizarServicioGuard, AuthTrabajoEnEjecucionGuard],
              loadChildren: () =>
                import('./especialistas/especialistas-services/especialistas-services.module').then(
                  (m) => m.EspecialistasServicesModule
                ),
            },
            {
              path: 'bonus',
              resolve: { especialistaSidebar: EspecialistaSidebarResolver },
              canActivate: [AuthEspecilistasGuard, AuthRealizarServicioGuard, AuthTrabajoEnEjecucionGuard],
              loadChildren: () =>
                import('./especialistas/especialistas-bonus/especialistas-bonus.module').then(
                  (m) => m.EspecialistasBonusModule
                ),
            },
            {
              path: 'calificaciones',
              resolve: { especialistaSidebar: EspecialistaSidebarResolver },
              canActivate: [AuthEspecilistasGuard, AuthRealizarServicioGuard, AuthTrabajoEnEjecucionGuard],
              loadChildren: () =>
                import('./especialistas/especialistas-calificaciones/especialistas-calificaciones.module').then(
                  (m) => m.EspecialistasCalificacionesModule
                ),
            },
            {
                path: 'trabajosConfirmados',
                canActivate: [AuthEspecilistasGuard, AuthRealizarServicioGuard, AuthTrabajoEnEjecucionGuard],
                loadChildren: () =>
                  import('./trabajos-confirmados/trabajos-confirmados.module').then(
                    (m) => m.TrabajosConfirmadosModule
                  ),
            },
            {
                path: 'trabajos-ejecucion',
                canActivate: [AuthRealizarServicioGuard],
                loadChildren: () =>
                  import('./trabajos-en-ejecucion/trabajos-en-ejecucion.module').then(
                    (m) => m.TrabajosEnEjecucionModule
                  ),
            },
            {
                path: 'realizarServicio/:id/:ids',
                canActivate: [AuthEspecilistasGuard],
                resolve: { realizarServicio: RealizarServicioResolver },
                loadChildren: () =>
                  import('./realizar-servicio/realizar-servicio.module').then((m) => m.RealizarServicioModule),
            },
            { 
                path: 'solicitudes', 
                canActivate: [AuthEspecilistasGuard, AuthRealizarServicioGuard, AuthTrabajoEnEjecucionGuard], 
                loadChildren: () => 
                    import('./solicitudes/solicitudes-especialista/solicitudes-especialista.module').then(m => m.SolicitudesEspecialistaModule)
            },
            { path: '**', redirectTo: 'solicitudes' },
          ],
        },  
  
        // Clientes
        {
          path: 'cliente',
          children: [
            {
              path: 'profile',
              canActivate: [AuthClienteGuard],
              loadChildren: () =>
                import('./clientes/cliente-profile/cliente-profile.module').then((m) => m.ClienteProfileModule),
            },
            {
              path: 'personal-info',
              canActivate: [AuthClienteGuard],
              loadChildren: () =>
                import('./clientes/cliente-personal-info/cliente-personal-info.module').then(
                  (m) => m.ClientePersonalInfoModule
                ),
            },
            {
              path: 'payment',
              canActivate: [AuthClienteGuard],
              loadChildren: () =>
                import('./clientes/cliente-payment/cliente-payment.module').then((m) => m.ClientePaymentModule),
            },
            {
              path: 'service',
              canActivate: [AuthClienteGuard],
              loadChildren: () =>
                import('./clientes/cliente-services/cliente-services.module').then((m) => m.ClienteServicesModule),
            },
            {
              path: 'bonus',
              canActivate: [AuthClienteGuard],
              loadChildren: () =>
                import('./clientes/cliente-bonus/cliente-bonus.module').then((m) => m.ClienteBonusModule),
            },
            { 
                path: 'mis-solicitudes', 
                canActivate: [AuthClienteGuard], 
                loadChildren: () => 
                    import('./clientes/cliente-mis-solicitudes/cliente-mis-solicitudes.module').then(m => m.ClienteMisSolicitudesModule) },
            { 
                path: 'mis-solicitudes/calificar-servicio/:idServicio', 
                loadChildren: () => 
                    import('./servicios/servicios-realizados/calificar-servicio/calificar-servicio.module').then(m => m.CalificarServicioModule)},
            { path: 'solicitar-servicio',  canActivate: [AuthClienteGuard],  loadChildren: () => import('./solicitar-servicio/solicitar-servicio.module').then(m => m.SolicitarServicioModule)},
            { path: 'solicitar-servicio/:idCategoria', canActivate: [AuthClienteGuard],  loadChildren: () => import('./ver-mas-servicios/ver-mas-servicios.module').then(m => m.VerMasServiciosModule)},
            { path: 'datos-servicios', canActivate: [AuthClienteGuard, AuthDatoServicio], loadChildren: () => import('./datos-servicios/datos-servicios.module').then(m => m.DatosServiciosModule)},
            { path: '**', redirectTo: 'solicitar-servicio' },

          ],
        },
  
        // Postulantes
        {
          path: 'postulante',
          children: [
            {
              path: 'profile',
              resolve: { postulanteSidebar: PostulanteSidebarResolver },
              canActivate: [AuthPostulanteGuard],
              loadChildren: () =>
                import('./postulante/postulante-profile/postulante-profile.module').then(
                  (m) => m.PostulanteProfileModule
                ),
            },
            {
              path: 'personal-info',
              resolve: { postulanteSidebar: PostulanteSidebarResolver },
              canActivate: [AuthPostulanteGuard],
              loadChildren: () =>
                import('./postulante/postulante-personal-info/postulante-personal-info.module').then(
                  (m) => m.PostulantePersonalInfoModule
                ),
            },
            { 
                path: 'datos-juridicos', 
                resolve: {postulanteSidebar: PostulanteSidebarResolver}, 
                canActivate: [AuthPostulanteGuard], 
                loadChildren: () => 
                    import('./postulante/datos-juridicos/datos-juridicos.module').then(m => m.DatosJuridicosModule)
            },
            { 
                path: 'academic-info', 
                resolve: {postulanteSidebar: PostulanteSidebarResolver}, 
                canActivate: [AuthPostulanteGuard], 
                loadChildren: () => 
                    import('./postulante/postulante-academic-info/postulante-academic-info.module').then(m => m.PostulanteAcademicInfoModule)
            },
            { 
                path: 'laboral-info', 
                resolve: {postulanteSidebar: PostulanteSidebarResolver}, 
                canActivate: [AuthPostulanteGuard], 
                loadChildren: () => 
                    import('./postulante/postulante-laboral-info/postulante-laboral-info.module').then(m => m.PostulanteLaboralInfoModule)
            },
            { path: 'postulacion' , canActivate: [AuthPostulanteGuard],  
              loadChildren: () => import('./postulante/postulacion/postulacion.module').then(m => m.PostulacionModule)},
            { path: '**', redirectTo: 'postulacion' },
          ],
        },
      ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class LayoutRoutingModule {}
