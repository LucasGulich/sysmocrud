# SysmoCrud

Sistema de gerenciamento de tarefas com API REST em Java/Quarkus e interface web em Angular.

Permite criar, listar, atualizar e excluir tarefas, cada uma com título, descrição, status (Aberto, Em andamento, Concluído) e data de criação preenchida automaticamente.

## Tecnologias

**Backend** — Java 21, Quarkus 3.39.1, Hibernate ORM com Panache, PostgreSQL, SmallRye OpenAPI.

**Frontend** — Angular 21, TypeScript 5.9, Bootstrap 5.3, Bootstrap Icons.

---

## Pré-requisitos

⚠️ O backend exige JDK 21

O projeto é compilado com `maven.compiler.release=21`.


Confira sua versão com `java -version`. Se você tiver mais de um JDK instalado, aponte o `JAVA_HOME` para o 21 antes de rodar os comandos do backend:

```bash
# Linux / macOS
export JAVA_HOME=/caminho/para/jdk-21
```

```powershell
# Windows (vale só para a janela atual do terminal)
$env:JAVA_HOME = "C:\caminho\para\jdk-21"
```


Obs.: **Não é necessário instalar o Maven.** O projeto inclui o Maven Wrapper (`mvnw`), que baixa e usa a versão correta automaticamente.

---

## Como rodar

1. Banco de dados

Crie a base no PostgreSQL:

```sql
CREATE DATABASE sysmocrud;
```

Não é preciso criar tabelas: o Hibernate gera a estrutura na primeira execução automático.

As credenciais padrão estão em `serverquarkus/src/main/resources/application.properties`:

```properties
quarkus.datasource.username=postgres 	(alterar conforme seu usuário do post)
quarkus.datasource.password=root		(alterar conforme a senha do seu usuário do post)
quarkus.datasource.jdbc.url=jdbc:postgresql://localhost:5432/sysmocrud
```

Ajuste usuário, senha e porta conforme a sua instalação.

2. Backend

```bash
cd serverquarkus

# Linux / macOS
./mvnw quarkus:dev

# Windows
.\mvnw.cmd quarkus:dev
```

A API sobe em http://localhost:8080

Para encerrar, pressione 'q' no terminal.

3. Frontend

Em outro terminal, com o backend rodando:

```bash
cd clientangular
npm install
npm run start
```

A aplicação abre em **http://localhost:4200**.

---

## Endereços

| O quê | URL |
|---|---|
| Aplicação web | http://localhost:4200 |
| API | http://localhost:8080 |
| **Documentação Swagger** | http://localhost:8080/q/swagger-ui |
| Contrato OpenAPI | http://localhost:8080/q/openapi |

---

## Endpoints da API

| Método   | Rota          | Descrição                                    |
|----------|---------------|----------------------------------------------|
| `GET`    | `/tasks`      | Lista paginada. Aceita `?page=0&pageSize=10` |
| `GET`    | `/tasks/all`  | Lista todas as tarefas                       |
| `GET`    | `/tasks/{id}` | Busca uma tarefa pelo id                     |
| `POST`   | `/tasks`      | Cria uma tarefa                              |
| `PUT`    | `/tasks/{id}` | Atualiza título, descrição e status          |
| `DELETE` | `/tasks/{id}` | Exclui uma tarefa                            |

Corpo de requisição para `POST` e `PUT`:

```json
{
  "title": "Título da tarefa",
  "description": "Descrição da tarefa.",
  "status": "ABERTO"
}
```


Valores aceitos em 'status': 'ABERTO', 'EM_ANDAMENTO', 'CONCLUIDO'.

O 'title' é obrigatório; requisições sem ele recebem *400*. 
Ids inexistentes recebem *404*. 
Os campos 'id' e 'createdAt' são gerados pelo servidor e ignorados se enviados pelo cliente.

---

## Testes

1. Backend

Os testes do backend exigem o PostgreSQL rodando e a base sysmocrud criada.

```bash
# Navegar até o diretório do backend
cd serverquarkus

# Executar testes em sistemas Unix (Linux / macOS / Git Bash)
./mvnw test

# Executar testes no Windows (CMD / PowerShell)
.\mvnw.cmd test
```

2. Frontend

```bash
# Navegar até o diretório do frontend
cd clientangular

# Executar suíte de testes
npm test
```
