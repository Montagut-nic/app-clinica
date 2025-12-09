import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { SupabaseClientService } from '../servicios/supabase-client';

export const loginGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  const supa = inject(SupabaseClientService);

  await supa.loadProfile();
  const logged = await supa.isLoggedIn();
  const prof = supa.profile;

  if (logged && prof?.categoria === 'especialista' && prof?.activado === false) return true;
  if (logged) return router.createUrlTree(['/mi-perfil']);
  return true;
};
