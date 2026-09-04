import { Injectable, inject } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Task} from '../models/task';
import {PagedResponse} from '../models/paged-response';

@Injectable({
  providedIn: 'root',
})
export class TaskService {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/tasks';

  // GET do /tasks/all (ja esta vindo ordenado do backend).
  findAll(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/all`);
  }

  // GET /tasks?page=&pageSize= (Lista paginada).
  findPage(page: number, pageSize: number): Observable<PagedResponse<Task>> {
    const params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize);

    return this.http.get<PagedResponse<Task>>(this.apiUrl, { params });
  }

  // POST /tasks (criar task).
  createTask(task: Task): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, task);
  }

  // PUT /tasks/{id} (alterar dados de uma task).
  updateTask(id: string, task: Task): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/${id}`, task);
  }

  // DELETE /tasks/{id} (excluir uma task).
  deleteById(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
