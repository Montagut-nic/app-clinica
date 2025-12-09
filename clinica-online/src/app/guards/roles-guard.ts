import { CanActivateFn, Router } from '@angular/router';

import { inject } from '@angular/core';
import { SupabaseClientService } from '../servicios/supabase-client';

export const rolesGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  const supa = inject(SupabaseClientService);

  const logged = await supa.isLoggedIn();

  if (!logged) {
    return router.createUrlTree(['/inicio']);
  }

  const perfil = supa.profile;
  if (!perfil) {
    return router.createUrlTree(['/inicio']);
  }

  const allowed = route.data?.['roles'] as Array<string> || undefined;
  const redirPath = route.data?.['redir'] as string || undefined

  if (allowed.length > 0 && allowed.includes(perfil.categoria)) {

    if (redirPath !== undefined) {
      switch (perfil.categoria) {
        case 'paciente':
          if (redirPath === 'mis-turnos') {
            return router.createUrlTree(['mis-turnos/paciente']);
          } else if (redirPath === 'turnos') {
            return router.createUrlTree(['turnos/solicitar']);
          } else {
            return router.createUrlTree(['/mi-perfil']);
          }
        case 'especialista':
          if (redirPath === 'mis-turnos') {
            return router.createUrlTree(['mis-turnos/especialista']);
          } else {
            return router.createUrlTree(['/mi-perfil']);
          }
        case 'admin':
          if (redirPath === 'turnos') {
            return router.createUrlTree(['turnos/listado']);
          } else {
            return router.createUrlTree(['/mi-perfil']);
          }
        default:
          return router.createUrlTree(['/mi-perfil']);
      }
    } else {
      return true;
    }

  } else {
    return router.createUrlTree(['/mi-perfil']);
  }

};
