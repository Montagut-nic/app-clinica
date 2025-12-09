import { CanActivateFn, Router } from '@angular/router';

import { inject } from '@angular/core';
import { SupabaseClientService } from '../servicios/supabase-client';
import { AuthService } from '../servicios/auth';

export const registerGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  const supa = inject(SupabaseClientService);
  const auth = inject(AuthService);

  const logged = await supa.isLoggedIn();
  const isAdmin = await auth.isAdmin();

  if (!logged || isAdmin) {
    return true;
  }
  return router.createUrlTree(['/inicio']);
};
