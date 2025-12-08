import { Routes } from '@angular/router';
import { loginGuard } from './guards/login-guard';
import { registerGuard } from './guards/register-guard';
import { adminGuard } from './guards/admin-guard';
import { rolesGuard } from './guards/roles-guard';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: "full",
    redirectTo: "inicio"
  },
  {
    path: "inicio",
    canActivate: [loginGuard],
    loadComponent: () => import('./componentes/bienvenida/bienvenida').then(m => m.Bienvenida)
  },
  {
    path: "acceso",
    canActivate: [loginGuard],
    loadComponent: () => import('./componentes/login/login').then(m => m.Login)
  },
  {
    path: "registro",
    pathMatch: 'full',
    canActivate: [registerGuard],
    loadComponent: () => import('./componentes/registro/registro').then(m => m.Registro)
  },
  {
    path: 'registro/paciente',
    canActivate: [registerGuard],
    loadComponent: () => import('./componentes/registro-paciente/registro-paciente').then(m => m.RegistroPaciente)

  },
  {
    path: 'registro/especialista',
    canActivate: [registerGuard],
    loadComponent: () => import('./componentes/registro-especialista/registro-especialista').then(m => m.RegistroEspecialista)

  },
  {
    path: 'registro/administrador',
    canActivate: [adminGuard],
    loadComponent: () => import('./componentes/registro-admin/registro-admin').then(m => m.RegistroAdmin)

  },
  {
    path: 'usuarios',
    canActivate: [adminGuard],
    loadComponent: () => import('./componentes/usuarios/usuarios').then(m => m.Usuarios)

  },
  {
    path: 'informes',
    canActivate: [adminGuard],
    loadComponent: () => import('./componentes/informes/informes').then(m => m.Informes)

  },
  {
    path: 'mis-turnos',
    pathMatch: 'full',
    canActivate: [rolesGuard],
    data: { roles: ['paciente', 'especialista'], redir:'mis-turnos' },
  },
  {
    path: 'mis-turnos/paciente',
    canActivate: [rolesGuard],
    loadComponent: () => import('./componentes/mis-turnos-paciente/mis-turnos-paciente').then(m => m.MisTurnosPaciente),
    data: { roles: ['paciente'] }
  },
  {
    path: 'mis-turnos/especialista',
    canActivate: [rolesGuard],
    loadComponent: () => import('./componentes/mis-turnos-especialista/mis-turnos-especialista').then(m => m.MisTurnosEspecialista),
    data: { roles: ['especialista'] }
  },
  {
    path: 'turnos',
    pathMatch: 'full',
    canActivate: [rolesGuard],
    data: { roles: ['paciente', 'admin'], redir:'turnos' },
  },
  {
    path: 'turnos/solicitar',
    canActivate: [rolesGuard],
    loadComponent: () => import('./componentes/solicitar-turno/solicitar-turno').then(m => m.SolicitarTurno),
    data: { roles: ['paciente', 'admin'] }
  },
  {
    path: 'turnos/listado',
    canActivate: [adminGuard],
    loadComponent: () => import('./componentes/turnos/turnos').then(m => m.Turnos)
  },
  {
    path: 'mi-perfil',
    canActivate: [authGuard],
    loadComponent: () => import('./componentes/mi-perfil/mi-perfil').then(m => m.MiPerfil)
  },
  {
    path: 'mi-perfil/mis-horarios',
    canActivate: [rolesGuard],
    loadComponent: () => import('./componentes/horarios/horarios').then(m => m.Horarios),
    data: { roles: ['especialista'] }
  },
  {
    path: "error404",
    loadComponent: () => import('./componentes/error404/error404').then(m => m.Error404)
  },
  {
    path: "**",
    redirectTo: "error404"
  }
];
