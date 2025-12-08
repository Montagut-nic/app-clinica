import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LoaderService } from '../loader/loader-service';
import { ToastService } from '../../servicios/toast';

@Component({
  selector: 'app-bienvenida',
  imports: [RouterLink],
  templateUrl: './bienvenida.html',
  styleUrl: './bienvenida.scss',
})
export class Bienvenida implements OnInit {
  private readonly loader = inject(LoaderService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  ngOnInit(): void {
    document.title = 'La Clínica Online - Inicio';
    setTimeout(() => this.loader.hide(), 2000);
    if (this.router.url.includes('/inicio#description=Email+confirmed')) {
      this.toast.success('¡Correo electrónico confirmado! Ya puedes iniciar sesión.');
    }
  }

}
