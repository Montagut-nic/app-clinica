import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionService } from '../servicios/session';
import { AuthService } from '../servicios/auth';

export const authGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  const session = inject(SessionService);
  const auth = inject(AuthService);

  await session.waitReady();
  await session.waitForProfile();
  const u = await auth.getCurrentUser();

  const user = session.user();
  const profile = session.profile();
  if ( !u || u === null || !user || user === null || user === undefined || (profile !== null && profile!.categoria === 'especialista' && !profile!.activado)) {
    return router.createUrlTree(['/inicio']);
  }
  return true;
};
