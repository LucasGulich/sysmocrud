import {Component, input, output} from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  imports: [],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.css',
  host: {
    '(document:keydown.escape)': 'onCancel()'
  }
})
export class ConfirmDialogComponent {

  // Obrigatorios: modal precisa titulo e mensagem
  readonly dialogTitle = input.required<string>();
  readonly message = input.required<string>();

  // Opcionais, com valor padrao.
  readonly details = input('');
  readonly confirmText = input('Confirmar');
  readonly confirmClass = input('btn-primary');
  readonly processing = input(false);
  readonly errorMessage = input<string | null>(null);

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  onConfirm(): void {
    this.confirmed.emit();
  }

  // Unico caminho de cancelamento. Usado pelo botao Cancelar, pelo X, pelo Esc e pelo clique no fundo.
  onCancel(): void {
    if (this.processing()) {
      return;     // Nao deixa fechar enquanto a operacao esta em andamento.
    }
    this.cancelled.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onCancel();
    }
  }
}
