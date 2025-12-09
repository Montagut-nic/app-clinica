import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SupabaseClientService } from '../servicios/supabase-client';
import { AuthService } from '../servicios/auth';

export const adminGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  const supa = inject(SupabaseClientService);
  const auth = inject(AuthService);

  const logged = await supa.isLoggedIn();
  const adm = await auth.isAdmin();

  if (!logged) {
    return router.createUrlTree(['/inicio']);
  }
  if (!adm) {
    return router.createUrlTree(['/mi-perfil']);
  }
  return true;
};
