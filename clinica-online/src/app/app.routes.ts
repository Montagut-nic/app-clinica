import { Routes } from '@angular/router';
import { Bienvenida } from './componentes/bienvenida/bienvenida';
import { Error404 } from './componentes/error404/error404';
import { Login } from './componentes/login/login';
import { Registro } from './componentes/registro/registro';
import { RegistroEspecialista } from './componentes/registro-especialista/registro-especialista';
import { RegistroPaciente } from './componentes/registro-paciente/registro-paciente';

export const routes: Routes = [
    {
        path: '',
        pathMatch: "full",
        redirectTo: "inicio"
    },
    {
        path: "inicio",
        component: Bienvenida
    },
    {
        path: "acceso",
        component: Login
    },
    {
        path: "registro",
        children: [
      {
        path: '',
        pathMatch: 'full',
        component: Registro
      },
      {
        path: 'paciente',
        component: RegistroPaciente
      },
      {
        path: 'especialista',
        component: RegistroEspecialista
      }
    ]
  },
    {
        path: "error404",
        component: Error404
    },
    {
        path: "**",
        redirectTo: "error404"
    }
];
