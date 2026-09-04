package crudsysmo.buildrun.service;

import crudsysmo.buildrun.entity.TaskEntity;
import crudsysmo.buildrun.enums.TaskStatus;
import crudsysmo.buildrun.exception.TaskNotFoundException;
import crudsysmo.buildrun.repository.TaskRepository;
import io.quarkus.test.TestTransaction;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

@QuarkusTest
class TaskServiceTest {

    @Inject
    TaskService taskService;

    @Inject
    TaskRepository taskRepository;

    // Auxiliar: monta uma tarefa nova para os testes, evitando repetir isso em cada um.
    private TaskEntity novaTarefa(String titulo) {
        var task = new TaskEntity();
        task.setTitle(titulo);
        task.setDescription("Descrição de teste");
        task.setStatus(TaskStatus.ABERTO);
        return task;
    }

    @Test
    @TestTransaction
    void deveCriarTarefaComIdEDataDeCriacao() {
        // PREPARAR + EXECUTAR
        var criada = taskService.createTask(novaTarefa("Tarefa de teste"));
        taskRepository.flush();   // força o INSERT ir para o banco agora

        // VERIFICAR
        assertNotNull(criada.getId(), "o id deveria ser gerado automaticamente");
        assertNotNull(criada.getCreatedAt(), "a data de criação deveria ser preenchida automaticamente");
        assertEquals("Tarefa de teste", criada.getTitle());
        assertEquals(TaskStatus.ABERTO, criada.getStatus());
    }

    @Test
    @TestTransaction
    void deveEncontrarTarefaPeloId() {
        var criada = taskService.createTask(novaTarefa("Buscar por id"));

        var encontrada = taskService.findById(criada.getId());

        assertEquals(criada.getId(), encontrada.getId());
        assertEquals("Buscar por id", encontrada.getTitle());
    }

    @Test
    @TestTransaction
    void deveLancarExcecaoQuandoIdNaoExiste() {
        var idInexistente = UUID.randomUUID();

        assertThrows(TaskNotFoundException.class, () -> taskService.findById(idInexistente));
    }

    @Test
    @TestTransaction
    void deveAtualizarCamposSemAlterarIdNemDataDeCriacao() {
        var criada = taskService.createTask(novaTarefa("Título original"));
        taskRepository.flush();

        var idOriginal = criada.getId();
        var dataOriginal = criada.getCreatedAt();

        var alteracao = new TaskEntity();
        alteracao.setTitle("Título alterado");
        alteracao.setDescription("Descrição alterada");
        alteracao.setStatus(TaskStatus.CONCLUIDO);

        var atualizada = taskService.updateTask(idOriginal, alteracao);

        assertEquals("Título alterado", atualizada.getTitle());
        assertEquals("Descrição alterada", atualizada.getDescription());
        assertEquals(TaskStatus.CONCLUIDO, atualizada.getStatus());

        assertEquals(idOriginal, atualizada.getId(), "o id não deveria mudar numa atualização");
        assertEquals(dataOriginal, atualizada.getCreatedAt(), "createdAt não deveria mudar numa atualização");
    }

    @Test
    @TestTransaction
    void deveExcluirTarefa() {
        var criada = taskService.createTask(novaTarefa("Para excluir"));
        taskRepository.flush();

        var id = criada.getId();

        taskService.deleteById(id);
        taskRepository.flush();

        assertThrows(TaskNotFoundException.class, () -> taskService.findById(id));
    }
}