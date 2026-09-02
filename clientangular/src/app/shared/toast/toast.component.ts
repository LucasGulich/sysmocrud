import {Component, computed, effect, input, output} from '@angular/core';

export type ToastType = 'success' | 'danger' | 'warning' | 'info';

@Component({
  selector: 'app-toast',
  imports: [],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.css',
})
export class ToastComponent {
  readonly message = input.required<string>();
  readonly type = input<ToastType>('success');
  readonly duration = input(4000);

  readonly closed = output<void>();

  // Icone conforme o tipo da mensagem e grava na variavel iconClass
  readonly iconClass = computed(() => {
    switch (this.type()) {
      case 'success':
        return 'bi-check-circle-fill';
      case 'danger':
        return 'bi-exclamation-triangle-fill';
      case 'warning':
        return 'bi-exclamation-circle-fill';
      case 'info':
        return 'bi-info-circle-fill';
    }
  });

  constructor() {
    // Reinicia o cronômetro sempre que a mensagem muda, e o desliga ao destruir o componente.
    effect((onCleanup) => {
      const message = this.message();
      const duration = this.duration();

      // valida se tem algo na mensagem
      if (!message) {
        return;
      }

      /* Inicia um temporizador do JavaScript. Quando passar o tempo de duration (ex: 4000ms = 4 segundos),
      ele executa this.closed.emit(), que dispara o evento avisando o componente pai de que o Toast deve ser fechado.*/
      const timeoutId = setTimeout(() => this.closed.emit(), duration);

      onCleanup(() => clearTimeout(timeoutId));
    });
  }
}
