package crudsysmo.buildrun.exception;

import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;

@Provider
public class TaskNotFoundExceptionMapper implements ExceptionMapper<TaskNotFoundException> {

    @Override
    public Response toResponse(TaskNotFoundException exception) {
        return Response.status(Response.Status.NOT_FOUND.getStatusCode(), "Task not found").build();
    }
}
