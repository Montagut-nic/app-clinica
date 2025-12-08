import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionService } from '../servicios/session';
import { AuthService } from '../servicios/auth';

export const loginGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
    const session = inject(SessionService);
    const auth = inject(AuthService);
  
    await session.waitReady();
    await session.waitForProfile();
    const u = await auth.getCurrentUser();
  
    const user = session.user;
    const profile = session.profile();
    if (!u || u === null || !user || user === null || 
      (profile !== null && profile!.categoria === 'especialista' && profile!.activado === false)) {
      return true;
    }
    return router.createUrlTree(['/mi-perfil']);
  };
