export type TaskStatus = 'ABERTO' | 'EM_ANDAMENTO' | 'CONCLUIDO';

export interface Task {
  id?: string;
  title: string;
  description?: string;
  status: TaskStatus;
  createdAt?: string;
}
