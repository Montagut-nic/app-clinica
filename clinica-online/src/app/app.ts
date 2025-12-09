import { Component, computed, inject, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationStart, RouterLink, Router, RouterOutlet, NavigationCancel, NavigationEnd, NavigationError } from '@angular/router';
import { Loader } from './componentes/loader/loader';
import { LoaderService } from './componentes/loader/loader-service';
import { CommonModule, NgIf } from '@angular/common';
import { ToastsComponent } from "./servicios/toast/toast";
import { SupabaseClientService } from './servicios/supabase-client';
import { User } from '@supabase/supabase-js';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, Loader, CommonModule, ToastsComponent, NgIf],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  router = inject(Router);
  private readonly loader = inject(LoaderService);
  private readonly supa = inject(SupabaseClientService);

  user: Signal<User | null> = toSignal<User | null>(this.supa.user$, { initialValue: null });
  protected readonly title = document.title;
  private sub!: Subscription;
  isAdmin = computed(() => this.profile()?.categoria === 'admin');
  isLogged = computed(() => this.user() !== null);
  profile = computed(() => this.supa.profile);

  ngOnInit() {
    this.sub = this.router.events.subscribe(ev => {
      if (ev instanceof NavigationStart) this.loader.show();
      if (ev instanceof NavigationEnd || ev instanceof NavigationCancel || ev instanceof NavigationError) {
        this.loader.hide();
      }
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  async logout() {
    await this.supa.logOut();
    this.router.navigateByUrl('/inicio', { replaceUrl: true });
  }
}

