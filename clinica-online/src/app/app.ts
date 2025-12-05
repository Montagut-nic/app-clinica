import { Component, inject, ViewChild } from '@angular/core';
import { NavigationStart, RouterLink, Router, RouterOutlet, NavigationError, NavigationCancel, NavigationEnd } from '@angular/router';
import { Loader } from './componentes/loader/loader';
import { LoaderService } from './componentes/loader/loader-service';
import { SessionService } from './servicios/session';
import { CommonModule } from '@angular/common';
import { ToastsComponent } from "./servicios/toast/toast";


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, Loader, CommonModule, ToastsComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private session = inject(SessionService);
  protected readonly router = inject(Router);
  private readonly loader = inject(LoaderService);
  protected readonly title = document.title;
  private readonly loaderRoutes = ['/inicio','/error404',];

  constructor() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart && this.loaderRoutes.includes(event.url)) {
        this.loader.show();
      }
       if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        this.loader.hide?.();
      }
    });
  }

  @ViewChild(RouterOutlet) outlet?: RouterOutlet;

  isLogged = this.session.isLoggedIn;
  profile = this.session.profile;
  ready = this.session.ready;

  async logout() {
    await this.session.logout();
    this.router.navigateByUrl('/acceso');
  }
}
