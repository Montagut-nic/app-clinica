import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SupabaseClientService } from '../servicios/supabase-client';

export const authGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  const supa = inject(SupabaseClientService);
  
  const logged = await supa.isLoggedIn();

  if ( !logged ) {
    return router.createUrlTree(['/inicio']);
  }
  return true;
};
