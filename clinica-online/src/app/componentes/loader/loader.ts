import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { LoaderService } from './loader-service';

@Component({
  selector: 'app-loader',
  imports: [],
  templateUrl: './loader.html',
  styleUrl: './loader.scss',
})
export class Loader implements OnInit, OnDestroy {

  private readonly loader = inject(LoaderService);

  // señales conectadas al servicio
  visible = this.loader.isVisible;
  messages = this.loader.messages;

  // lógica de rotación de mensajes:
  currentMessage = '';
  private intervalId: any = null;
  private currentIndex = 0;
  private readonly intervalMs = 1800;


 ngOnInit(): void {
    const list = this.messages();

    this.currentIndex = 0;
    this.currentMessage = list[this.currentIndex];

    this.intervalId = setInterval(() => {
      const msgs = this.messages();
      if (!msgs.length) return;

      this.currentIndex = (this.currentIndex + 1) % msgs.length;
      this.currentMessage = msgs[this.currentIndex];
    }, this.intervalMs);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
