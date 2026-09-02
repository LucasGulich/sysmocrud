import {Component, input, output} from '@angular/core';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  // Permite que outra tela use o cabecalho.
  readonly showNewTaskButton = input(true);
  readonly newTaskDisabled = input(false);

  readonly newTask = output<void>();
}
