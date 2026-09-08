# SysmoCrud

Sistema de gerenciamento de tarefas com API REST em Java/Quarkus e interface web em Angular.

Permite criar, listar, atualizar e excluir tarefas, cada uma com título, descrição, status (Aberto, Em andamento, Concluído) e data de criação preenchida automaticamente.

## Tecnologias

**Backend** — Java 21, Quarkus 3.39.1, Hibernate ORM com Panache, PostgreSQL, SmallRye OpenAPI.

**Frontend** — Angular 21, TypeScript 5.9, Bootstrap 5.3, Bootstrap Icons.

---

## Pré-requisitos

| Ferramenta | Versão | Observação |
|---|---|---|
| **JDK** | 21 ou superior | obrigatório — veja o aviso abaixo |
| **PostgreSQL** | 12 ou superior |
| **Node.js** | 20.19+, 22.12+ ou 24+ | as versões 21 e 23 **não** são suportadas pelo Angular |
| **npm** | 8 ou superior | vem junto com o Node.js |

Desenvolvido e testado com JDK 21, PostgreSQL 14, Node.js 24.13 e npm 11.8.

⚠️ O backend exige JDK 21 e a variável de ambiente JAVA_HOME

O projeto é compilado com `maven.compiler.release=21`, e o Maven Wrapper precisa da variável `JAVA_HOME` apontando para um JDK 21. Sem ela, o build falha antes de começar, com a mensagem:

```
The JAVA_HOME environment variable is not defined correctly
```

Confira a versão instalada com `java -version`. Para criar ou corrigir a variável no Windows:

1. Aperte a tecla Windows e digite `variáveis de ambiente`
2. Abra **Editar as variáveis de ambiente do sistema**
3. Clique no botão **Variáveis de Ambiente...**
4. No quadro **Variáveis do sistema**, clique em **Novo...** (ou selecione `JAVA_HOME` e clique em **Editar...**, se ela já existir)
5. Nome da variável: `JAVA_HOME`
6. Valor da variável: o caminho da pasta do JDK, por exemplo `C:\Program Files\Java\jdk-21`
7. Confirme com **OK** em todas as janelas
8. **Feche e abra o terminal** — janelas já abertas não enxergam a variável nova

No Linux e no macOS, o equivalente é acrescentar `export JAVA_HOME=/caminho/para/jdk-21` ao seu `~/.bashrc` ou `~/.zshrc`.

Obs.: **não é necessário instalar o Maven.** O projeto inclui o Maven Wrapper (`mvnw`), que baixa e usa a versão correta automaticamente.

Obs.: **não é necessário instalar o Angular CLI.** Os comandos `npm run start` e `npm test` usam a versão instalada localmente pelo projeto.

---

## Como rodar

1. Banco de dados

É necessário ter o **PostgreSQL instalado e rodando**, na versão 12 ou superior. Se você não tiver, baixe em https://www.postgresql.org/download/windows/ e anote o usuário e a senha definidos durante a instalação — eles serão usados na configuração do projeto.

Obs.: qualquer versão a partir da 12 funciona **sem alterar nenhum arquivo do projeto**. O driver de conexão vem fixado pelo Quarkus e o Hibernate detecta a versão do servidor automaticamente ao conectar.

Para usar os comandos do PostgreSQL no terminal, a pasta `bin` dele precisa estar no `Path` do sistema. Para acrescentar no Windows:

1. Aperte a tecla Windows e digite `variáveis de ambiente`
2. Abra **Editar as variáveis de ambiente do sistema**
3. Clique no botão **Variáveis de Ambiente...**
4. No quadro **Variáveis do sistema**, selecione a variável **Path** e clique em **Editar...**
5. Clique em **Novo** e informe o caminho da pasta `bin` do PostgreSQL, por exemplo `C:\Program Files\PostgreSQL\versaopost\bin`
6. Confirme com **OK** em todas as janelas
7. **Feche e abra o terminal**

Com isso feito, abra um terminal e crie a base com um comando só:

```bash
createdb -U postgres sysmocrud
```

O `-U postgres` indica com qual **usuário do PostgreSQL** a base será criada. O `postgres` é o usuário administrador padrão, criado junto com a instalação — troque pelo seu, se usar outro. O `sysmocrud` no fim é o nome da base, e precisa ser exatamente esse (ou você terá que ajustar a configuração do projeto). O comando vai pedir a senha do usuário informado.

Se preferir não mexer no `Path`, dá para criar a base pelo **pgAdmin** (instalado junto com o PostgreSQL) ou por qualquer cliente SQL, executando:

```sql
CREATE DATABASE sysmocrud;
```

Não é preciso criar tabelas: o Hibernate gera a estrutura automaticamente na primeira execução do backend.

As credenciais padrão do projeto estão em `serverquarkus/src/main/resources/application.properties`:

```properties
quarkus.datasource.username=postgres
quarkus.datasource.password=root
quarkus.datasource.jdbc.url=jdbc:postgresql://localhost:5432/sysmocrud
```

Ajuste o usuário, a senha e a porta conforme a sua instalação. O usuário e a senha são os que você definiu ao instalar o PostgreSQL; a porta padrão é a `5432`.

2. Backend

Os comandos do backend precisam ser executados **de dentro da pasta `serverquarkus`**. Duas formas de chegar lá:

- Abra o terminal e navegue até ela com `cd`:

```bash
cd caminho\para\sysmocrud\serverquarkus
```

- Ou, no Explorador de Arquivos, entre na pasta `serverquarkus`, clique na barra de endereço, digite `cmd` e aperte Enter. O terminal abre já dentro dela.

Com o terminal na pasta certa, suba a aplicação:

```bash
# Windows
.\mvnw.cmd quarkus:dev

# Linux / macOS
./mvnw quarkus:dev
```

Obs.: no Windows o `.\` na frente é obrigatório. Ele indica que o arquivo a executar está na pasta atual — sem isso, o PowerShell não encontra o comando.

⏳ **A primeira execução demora alguns minutos.** O Maven Wrapper baixa o próprio Maven e todas as dependências do Quarkus (cerca de 400 MB, guardados na pasta `.m2` do seu usuário). Você vai ver centenas de linhas de download passando no terminal — é o comportamento esperado, não é erro. A partir da segunda execução, a aplicação sobe em poucos segundos.

A API sobe em http://localhost:8080

Para encerrar, pressione `q` no terminal.

3. Frontend

É necessário ter o **Node.js instalado**, nas versões 20.19+, 22.12+ ou 24 ou superior. As versões 21 e 23 não são suportadas pelo Angular. O npm vem junto com o Node.js, não é instalação separada.

Confira o que está instalado com `node --version` e `npm --version`. Se não tiver, a forma mais rápida no Windows é pelo winget:

```bash
winget install --id OpenJS.NodeJS.LTS -e --accept-package-agreements --accept-source-agreements
```

Obs.: depois de instalar, **feche e abra o terminal**. O instalador acrescenta o Node ao `Path` do sistema, e janelas já abertas não enxergam a mudança.

Também é possível baixar o instalador em https://nodejs.org — a opção **LTS** é a recomendada.

Com o Node instalado e **o backend rodando**, abra um segundo terminal na pasta `clientangular` (mesmas duas formas descritas no passo anterior) e execute:

```bash
# Baixa as dependências do projeto (só na primeira vez)
npm install

# Sobe a aplicação
npm run start
```

⏳ O `npm install` também demora na primeira vez — baixa cerca de 300 MB para a pasta `node_modules`. Depois disso, o `npm run start` sobe em segundos.

A aplicação abre em http://localhost:4200

Para encerrar, pressione `Ctrl + C` no terminal.

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
