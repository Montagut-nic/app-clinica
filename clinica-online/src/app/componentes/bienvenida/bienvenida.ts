import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LoaderService } from '../loader/loader-service';

@Component({
  selector: 'app-bienvenida',
  imports: [RouterLink],
  templateUrl: './bienvenida.html',
  styleUrl: './bienvenida.scss',
})
export class Bienvenida implements OnInit {
  private readonly loader = inject(LoaderService);

  ngOnInit(): void {
    document.title = 'La Clínica Online - Inicio';
    setTimeout(() => this.loader.hide(), 2000);
  }

}
