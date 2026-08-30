package crudsysmo.buildrun.service;

import crudsysmo.buildrun.dto.PagedResponse;
import crudsysmo.buildrun.entity.TaskEntity;
import crudsysmo.buildrun.exception.TaskNotFoundException;
import crudsysmo.buildrun.repository.TaskRepository;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class TaskService {

    private final TaskRepository taskRepository;

    public TaskService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }


    public TaskEntity createTask(TaskEntity taskEntity) {
        taskRepository.persist(taskEntity);
        return taskEntity;
    }


    // page começa em 0. O count()/pageCount() disparam uma query de COUNT à parte, além da que busca os dados.
    public PagedResponse<TaskEntity> findAllWithPage(Integer page, Integer pageSize) {
        var query = taskRepository.findAll().page(page, pageSize);

        List<TaskEntity> content = query.list();
        long totalElements = query.count();
        int totalPages = query.pageCount();

        return new PagedResponse<>(content, totalElements, totalPages);
    }


    // Sem paginação, retorna todas as tasks.
    public List<TaskEntity> findAll() {
        return taskRepository.findAll().list();
    }


    // Lança TaskNotFoundException se o id não existir no banco (o mapper cuida de virar um 404 pra API).
    public TaskEntity findById(UUID taskId) {
        return taskRepository.findByIdOptional(taskId)
                .orElseThrow(TaskNotFoundException::new);
    }


    // Só atualiza os campos que o usuário pode mexer (título, descrição, status). Id e createdAt nunca são tocados aqui.
    // Não precisa persist de novo, "task" já veio gerenciada pelo Hibernate, então o dirty checking cuida do UPDATE.
    public TaskEntity updateTask(UUID taskId, TaskEntity taskEntity) {
        var task = findById(taskId);

        task.setTitle(taskEntity.getTitle());
        task.setDescription(taskEntity.getDescription());
        task.setStatus(taskEntity.getStatus());

        return task;
    }


    // Busca antes de deletar. ID que não existe vai cair no 404 em vez de um "sucesso".
    public void deleteById(UUID taskId) {
        var task = findById(taskId);
        taskRepository.deleteById(task.getId());
    }
}
