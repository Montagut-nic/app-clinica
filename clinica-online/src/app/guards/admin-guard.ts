import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionService } from '../servicios/session';

export const adminGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  const session = inject(SessionService);

  await session.waitReady();
  await session.waitForProfile();
  const user = session.user;
  const profile = session.profile();

  if (!user) {
    return router.createUrlTree(['/inicio']);
  }
  if (profile?.categoria !== 'admin') {
    return router.createUrlTree(['/mi-perfil']);
  }
  return true;
};
