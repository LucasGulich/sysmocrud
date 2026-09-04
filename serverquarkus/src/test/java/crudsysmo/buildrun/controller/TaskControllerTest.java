package crudsysmo.buildrun.controller;

import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.notNullValue;

@QuarkusTest
class TaskControllerTest {

    @Test
    void deveRetornar400QuandoTituloEstaVazio() {
        given()
                .contentType(ContentType.JSON)
                .body("""
                        { "description": "tarefa sem titulo", "status": "ABERTO" }
                        """)
                .when()
                .post("/tasks")
                .then()
                .statusCode(400);
    }

    @Test
    void deveRetornar404QuandoIdNaoExiste() {
        given()
                .when()
                .get("/tasks/00000000-0000-0000-0000-000000000000")
                .then()
                .statusCode(404);
    }

    @Test
    void deveCriarBuscarEExcluirTarefaPelaApi() {
        // 1. cria e guarda o id devolvido
        String id =
                given()
                        .contentType(ContentType.JSON)
                        .body("""
                                { "title": "Tarefa via API", "status": "ABERTO" }
                                """)
                        .when()
                        .post("/tasks")
                        .then()
                        .statusCode(201)
                        .header("Location", containsString("/tasks/"))
                        .body("id", notNullValue())
                        .body("createdAt", notNullValue())
                        .body("title", equalTo("Tarefa via API"))
                        .extract().path("id");

        // 2. busca a tarefa criada
        given()
                .when()
                .get("/tasks/" + id)
                .then()
                .statusCode(200)
                .body("title", equalTo("Tarefa via API"));

        // 3. exclui
        given()
                .when()
                .delete("/tasks/" + id)
                .then()
                .statusCode(204);

        // 4. confirma que não existe mais
        given()
                .when()
                .get("/tasks/" + id)
                .then()
                .statusCode(404);
    }
}