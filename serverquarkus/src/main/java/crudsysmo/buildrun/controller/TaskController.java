package crudsysmo.buildrun.controller;


import crudsysmo.buildrun.entity.TaskEntity;
import crudsysmo.buildrun.service.TaskService;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.UriInfo;

import java.util.UUID;

@Path("/tasks")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    // Lista as tarefas com paginação. Se não vier page/pageSize na URL, usa o padrão (página 0, 10 por página).
    @GET
    public Response findAllWithPage(@QueryParam("page") @DefaultValue("0") Integer page,
                                    @QueryParam("pageSize") @DefaultValue("10") Integer pageSize) {
        var pagedResponse = taskService.findAllWithPage(page, pageSize);

        return Response.ok(pagedResponse).build();
    }

    // Endpoint separado pra listar tudo de uma vez, sem paginação (pro botão "listar todas" do front).
    @GET
    @Path("/all")
    public Response findAll() {
        var tasks = taskService.findAll();

        return Response.ok(tasks).build();
    }

    // Cria uma tarefa nova. O @Valid ja barra requisicao sem titulo antes de chegar no service.
    // Devolve 201 Created com o cabecalho Location apontando para a tarefa criada.
    @POST
    @Transactional
    public Response createTask(@Valid TaskEntity taskEntity, @Context UriInfo uriInfo) {
        var created = taskService.createTask(taskEntity);

        var location = uriInfo.getAbsolutePathBuilder()    // Descobre a URL que recebeu o POST (ex: http://localhost:8080/api/tasks)
                .path(created.getId().toString())          // Anexa o ID ao final (ex: /15)
                .build();                                  // Monta a URI final: http://localhost:8080/api/tasks/15

        return Response.created(location).entity(created).build();
    }

    // Atualiza título, descrição e status de uma tarefa existente (o id vem pela URL).
    @PUT
    @Path("/{id}")
    @Transactional
    public Response updateTask(@PathParam("id") UUID taskId, @Valid TaskEntity taskEntity) {
        return Response.ok(taskService.updateTask(taskId, taskEntity)).build();
    }

    // Busca uma tarefa específica pelo id. Se não achar, o TaskNotFoundExceptionMapper devolve 404 sozinho.
    @GET
    @Path("/{id}")
    public Response findById(@PathParam("id") UUID taskId) {
        return Response.ok(taskService.findById(taskId)).build();
    }

    // Apaga a tarefa. Devolve 204 (sem corpo) quando da certo.
    @DELETE
    @Path("/{id}")
    @Transactional
    public Response deleteById(@PathParam("id") UUID taskId) {
        taskService.deleteById(taskId);
        return Response.noContent().build();
    }

}
