import { CanActivateFn, Router } from '@angular/router';
import { SessionService } from '../servicios/session';
import { inject } from '@angular/core';

export const registerGuard: CanActivateFn = async(route, state) => {
  const router = inject(Router);
  const session = inject(SessionService);

  await session.waitReady();
  await session.waitForProfile();
  const user = session.user;
  const profile = session.profile();

  if (!user || profile?.categoria === 'admin') {
    return true;
  }
  return router.createUrlTree(['/inicio']);
};
