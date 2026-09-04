import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {DatePipe, ViewportScroller} from '@angular/common';
import {TaskService} from '../../services/task.service';
import {Task, TaskStatus} from '../../models/task';
import {TaskFormComponent} from '../task-form/task-form.component';
import {ConfirmDialogComponent} from '../../shared/confirm-dialog/confirm-dialog.component';
import {HeaderComponent} from '../../shared/header/header.component';
import {ToastComponent, ToastType} from '../../shared/toast/toast.component';
import {PagedResponse} from '../../models/paged-response';

@Component({
  selector: 'app-task-list',
  imports: [DatePipe, TaskFormComponent, ConfirmDialogComponent, HeaderComponent, ToastComponent],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.css',
})
export class TaskListComponent implements OnInit {

  private readonly taskService = inject(TaskService);   // Injetando na variavel a class TaskService para acesso a APIs.
  private readonly viewportScroller = inject(ViewportScroller);
  readonly pageSize = 10;

  readonly tasks = signal<Task[]>([]);          // Cria o estado reativo para guardar a lista. Começa com array vazio [] e apenas aceita dados no formato Task[]
  readonly loading = signal(true);   // Controlar carregamento da tela.
  readonly errorMessage = signal<string | null>(null); // Usar para acusar erro, valor inicial null. <string | null> Pode ser string ou null.
  readonly showForm = signal(false);
  readonly editingTask = signal<Task | null>(null);
  readonly taskToDelete = signal<Task | null>(null);
  readonly deleting = signal(false);
  readonly deleteError = signal<string | null>(null);
  readonly toast = signal<{ message: string; type: ToastType } | null>(null);
  readonly savingStatusId = signal<string | null>(null);
  readonly totalElements = signal(0);
  readonly loadingMore = signal(false);
  readonly allLoaded = computed(() => this.tasks().length >= this.totalElements());

  // Monta a mensagem do modal com o titulo da terefa.
  readonly deleteMessage = computed(() => {
    const task = this.taskToDelete();
    return task ? `Deseja realmente excluir a tarefa "${task.title}"?` : '';
  });

  askDelete(task: Task): void {
    this.closeForm(); // fechar o formulario se ele estiver aberto.
    this.deleteError.set(null);
    this.taskToDelete.set(task);    // abre o modal
  }

  cancelDelete(): void {
    this.taskToDelete.set(null);
    this.deleteError.set(null);
  }

  confirmDelete(): void {
    const task = this.taskToDelete();
    if (!task?.id) {  // garante que tenha um ID vindo na task.
      return;
    }

    this.deleting.set(true);
    this.deleteError.set(null);

    this.taskService.deleteById(task.id).subscribe({
      next: () => {
        this.deleting.set(false);
        this.taskToDelete.set(null);                      // Fecha o modal.
        this.showToast('Tarefa excluída com sucesso!')  // Mostra o Toast verde de sucesso
        this.reloadCurrentView();
      },
      error: (err) => {
        console.error(err);
        this.deleting.set(false);
        this.deleteError.set('Não foi possível excluir a tarefa!');
        // Modal vai seguir aberto, mostrando erro.
      }
    });
  }

  ngOnInit(): void {    // Angular chama na renderizacao.
    this.loadTasks();   // Dispara o carregamento inicial dos dados.
  }

  showToast(message: string, type: ToastType = 'success'): void {
    this.toast.set({message: message, type: type});
  }

  // Carga inicial: primeira pagina.
  loadTasks(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.taskService.findPage(0, this.pageSize).subscribe({
      next: (response) => {
        this.tasks.set(response.content);
        this.totalElements.set(response.totalElements);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.showToast('Não foi possível carregar todas as tarefas.', 'danger');
        this.loading.set(false);
      }
    });
  }

  // Busca a proxima pagina e ACRESCENTA ao que ja esta na tela.
  loadMore(): void {
    const nextPage = Math.floor(this.tasks().length / this.pageSize);

    this.loadingMore.set(true);

    this.taskService.findPage(nextPage, this.pageSize).subscribe({
      next: (response) => {
        this.tasks.update(list => [...list, ...response.content]);
        this.totalElements.set(response.totalElements);
        this.loadingMore.set(false);
      },
      error: (err) => {
        console.error(err);
        this.showToast('Não foi possível carregar mais tarefas.', 'danger');
        this.loadingMore.set(false);
      }
    });
  }

  // Busca todas de uma vez e SUBSTITUI a lista.
  loadAll(): void {
    this.loadingMore.set(true);

    this.taskService.findAll().subscribe({
      next: (tasks) => {
        this.tasks.set(tasks);
        this.totalElements.set(tasks.length);
        this.loadingMore.set(false);
      },
      error: (err) => {
        console.error(err);
        this.showToast('Não foi possível carregar todas as tarefas.', 'danger');
        this.loadingMore.set(false);
      }
    });
  }

  // Recarrega mantendo a MESMA quantidade que ja estava visivel.
  private reloadCurrentView(): void {
    const visible = Math.max(this.pageSize, this.tasks().length);

    this.taskService.findPage(0, visible).subscribe({
      next: (response) => {
        this.tasks.set(response.content);
        this.totalElements.set(response.totalElements);
      },
      error: (err) => {
        console.error(err);
        this.showToast('Não foi possível atualizar a lista.', 'danger');
      }
    });
  }

  closeToast(): void {
    this.toast.set(null);
  }

  openCreateForm(): void {
    this.editingTask.set(null); // null = modo de criacao.
    this.showForm.set(true);
  }

  openEditForm(task: Task): void {
    this.editingTask.set(task);
    this.showForm.set(true);
    this.viewportScroller.scrollToPosition([0, 0]);   // sobe a pagina ate o formulario.
  }

  onStatusChange(task: Task, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const newStatus = select.value as TaskStatus;

    if (!task.id || newStatus === task.status) {
      return;
    }

    this.savingStatusId.set(task.id);


    // Cria uma nova copia do objeto da tarefa com todas as propriedades preservadas e apenas o status atualizado com a opção escolhida.
    const updated: Task = {
      title: task.title,
      description: task.description,
      status: newStatus
    };

    this.taskService.updateTask(task.id, updated).subscribe({
      next: (savedTask) => {
        this.savingStatusId.set(null);
        // Troca apenas a tarefa alterada dentro da lista, sem recarregar tudo.
        this.tasks.update(list => list.map(t => t.id === savedTask.id ? savedTask : t));
        this.showToast('Status atualizado com sucesso.');
      },
      error: (err) => {
        console.error(err);
        this.savingStatusId.set(null);
        select.value = task.status;   // devolve o select ao valor real do banco
        this.showToast('Não foi possível atualizar o status.', 'danger');
      }
    });
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingTask.set(null); // reativa o botao "Nova tarefa".
  }

  onSaved(): void {
    const wasEditing = this.editingTask() !== null;                                       // Guarda se era edicao ANTES de fechar
    this.closeForm();                                                                             // Limpa o formulario e 'editingTask' vira null
    this.showToast(wasEditing ? 'Tarefa atualizada com sucesso!' : 'Tarefa criada com sucesso!')  // Dispara o Toast
    this.reloadCurrentView();                                                                             // recarrega a tabela para a nova tarefa aparecer.
  }

  // Declara o metodo 'statusLabel' que recebe uma variavel 'status' do tipo 'TaskStatus' do task.ts. Tudo String.
  statusLabel(status: TaskStatus): string {
    switch (status) {
      case 'ABERTO':
        return 'Aberto';
      case 'EM_ANDAMENTO':
        return 'Em andamento';
      case 'CONCLUIDO':
        return 'Concluído';
    }
  }

  badgeClass(status: TaskStatus): string {
    switch (status) {
      case 'ABERTO':
        return 'text-bg-secondary';
      case 'EM_ANDAMENTO':
        return 'text-bg-warning';
      case 'CONCLUIDO':
        return 'text-bg-success';
    }
  }

}
