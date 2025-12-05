import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-registro',
  imports: [RouterLink],
  templateUrl: './registro.html',
  styleUrl: './registro.scss',
})
export class Registro implements OnInit {

  ngOnInit(): void {
    document.title = 'La Clínica Online - Registro';
  }
}
