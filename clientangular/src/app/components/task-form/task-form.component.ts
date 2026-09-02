import {Component, computed, effect, inject, input, output, signal} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {TaskService} from '../../services/task.service';
import {Task, TaskStatus} from '../../models/task';

@Component({
  selector: 'app-task-form',
  imports: [ReactiveFormsModule],
  templateUrl: './task-form.component.html',
  styleUrl: './task-form.component.css',
})
export class TaskFormComponent {

  private readonly taskService = inject(TaskService);
  private readonly formBuilder = inject(FormBuilder);

  // Tarefa a EDITAR. null = modo criacao.
  // input: Diz ao Angular que essa propriedade eh uma entrada de dados (o componente pai(task-list.component) eh quem vai enviar o valor).
  readonly task = input<Task | null>(null);

  // Avisos que esse componente manda para quem o usa (Ex: task-list).
  readonly saved = output<void>();
  readonly cancelled = output<void>();

  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);

  // Valores derivados do input, usados no template.
  readonly isEditing = computed(() => this.task() !== null);  // Se this.task() tiver dados, o isEditing retorna true. Se for null, retorna false.
  readonly cardTitle = computed(() => this.isEditing() ? 'Editar tarefa' : 'Nova tarefa'); // Se isEditing(): true = "Editar tarefa". false = "Nova tarefa".
  readonly submitLabel = computed(() => this.isEditing() ? 'Salvar alterações' : 'Salvar'); // Se isEditing(): true = "Salvar alterações". false = "Salvar".

  readonly form = this.formBuilder.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(255)]],
    description: ['', [Validators.maxLength(255)]],
    status: ['ABERTO' as TaskStatus, [Validators.required]]
  });

  // Se receber uma tarefa (edicao): preenche os campos com os dados do banco.
  // Se receber 'null' (criacao): limpa todos os campos do formulario.
  constructor() {
    // Roda toda vez que o input 'task' mudar. Mesmo sem o componente ser recriado (usado para quando clicar em editar uma task com outra ja aberta).
    effect(() => {
      const taskToEdit = this.task();

      if (taskToEdit) {
        this.form.setValue({
          title: taskToEdit.title,
          description: taskToEdit.description ?? '',
          status: taskToEdit.status
        });
      } else {
        this.form.reset();
      }
    });
  }

  // Diz se um campo deve exibir erro. So quando eh invalido E o usuario ja interagiu com ele.
  isInvalid(controlName: 'title' | 'description' | 'status'): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && control.touched;
  }

  onSubmit(): void {
    // 1. Se houver erro de validação, exibe as mensagens no HTML e interrompe o envio
    if (this.form.invalid) {
      this.form.markAllAsTouched();   // forcar os erros a aparecerem
      return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);

    const formValue: Task = this.form.getRawValue();
    const taskToEdit = this.task();

    // 2. Define dinamicamente: se ja possui ID altera (PUT), caso contrario cria (POST)
    const request = taskToEdit?.id  // Valida se a variavel taskToEdit tem id. Com id verdadeiro: PUT. Sem id falso: POST
      ? this.taskService.updateTask(taskToEdit.id, formValue)   // Chama updateTask (faz um PUT) enviando o id da tarefa e os novos dados digitados (formValue).
      : this.taskService.createTask(formValue);   // Chama createTask (faz um POST) enviando apenas os dados digitados (formValue).

    // 3. Executa a requisição HTTP configurada acima
    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.saved.emit();  // Notifica a lista para recarregar
      },
      error: (err) => {
        console.error(err);
        this.errorMessage.set('Não foi possível salvar a tarefa.');
        this.saving.set(false);
      }
    });
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
