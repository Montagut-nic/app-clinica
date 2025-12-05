import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LoaderService } from '../loader/loader-service';

@Component({
  selector: 'app-error404',
  imports: [RouterLink],
  templateUrl: './error404.html',
  styleUrl: './error404.scss',
})
export class Error404 {
  private readonly loader = inject(LoaderService);

  ngOnInit(): void {
    document.title = 'La Clínica Online - Error 404';
    setTimeout(() => this.loader.hide(), 1400);
  }

}
