import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../servicios/auth';

@Component({
  selector: 'app-registro',
  imports: [RouterLink],
  templateUrl: './registro.html',
  styleUrl: './registro.scss',
})
export class Registro implements OnInit {
   private authSvc = inject(AuthService);
    protected isAdmin = signal(false);


  async ngOnInit(): Promise<void> {
    document.title = 'La Clínica Online - Registro';
    if (await this.authSvc.isAdmin()) {
      this.isAdmin.set(true);
    }
  }
}
