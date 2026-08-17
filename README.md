# EventTicket

Sistema de gerenciamento e venda de ingressos, composto por uma aplicação frontend em Next.js, uma API backend em Express.js/TypeScript, PostgreSQL e Prisma.

O projeto pode ser executado integralmente com Docker e Docker Compose, sem necessidade de instalar Node.js ou PostgreSQL localmente.

---

## 1. Tecnologias

- Next.js 16
- React 19
- Express.js 5
- TypeScript
- PostgreSQL 17
- Prisma 7
- Docker
- Docker Compose

---

## 2. Arquitetura

A aplicação é composta por três serviços Docker:

```text
                    Docker Compose
                         |
          +--------------+--------------+
          |              |              |
          v              v              v
   +-------------+ +-------------+ +-------------+
   | PostgreSQL  | |   Express   | |   Next.js   |
   |    :5432    | |    :4000    | |    :3000    |
   +-------------+ +-------------+ +-------------+
          ^              |
          |              |
          +--------------+
```

### Portas

| Serviço | Porta | Acesso |
|---|---:|---|
| Frontend | 3000 | http://localhost:3000 |
| Backend | 4000 | http://localhost:4000 |
| PostgreSQL | 5432 | localhost:5432 |

Dentro da rede Docker, o backend acessa o PostgreSQL através do hostname:

```text
database:5432
```

Por isso a `DATABASE_URL` usada pelos containers deve utilizar `database`, e não `localhost`.

---

# 3. Pré-requisitos

Antes de iniciar, instale:

- Docker Desktop
- Git

Não é necessário instalar:

- Node.js
- npm
- PostgreSQL
- Prisma

O Docker fará isso através das imagens dos containers.

### Verificar Docker

```bash
docker --version
```

### Verificar Docker Compose

```bash
docker compose version
```

---

# 4. Clonar o projeto

Clone o repositório:

```bash
git clone https://github.com/Ruan-Lauro/EvenTicket.git
```

Entre na pasta:

```bash
cd Etickets
```

---

# 5. Estrutura do projeto

A estrutura esperada é:

```text
Etickets/
│
├── docker-compose.yml
├── .env.example
├── .gitignore
├── README.md
│
├── database/
│   └── dump/
│       └── dump.sql
│
├── backend/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── package.json
│   ├── package-lock.json
│   ├── prisma/
│   └── src/
│
└── frontend/
    ├── Dockerfile
    ├── .dockerignore
    ├── package.json
    ├── package-lock.json
    └── app/
```

---


## 👥 Usuários para teste

Os seguintes usuários já estão cadastrados no sistema e podem ser utilizados para testar as diferentes funcionalidades e permissões da aplicação:

| Usuário | Senha | Perfil |
|---|---|---|
| ruan@gmail.com | `Ruan12345678@` | Bilheteiro |
| lais@gmail.com | `Lais12345678@` | Administrador |
| rian@gmail.com | `Rian123435678@` | Cliente |
| teste@gmail.com | `12345678` | Organizador |

### Perfis disponíveis

- **Ruan** → Bilheteiro
- **Laís** → Administrador
- **Rian** → Cliente
- **Teste** → Organizador


# 6. Configuração das variáveis de ambiente

O arquivo `.env` contém informações de configuração e possíveis segredos.

Por segurança, o `.env` não deve ser enviado para o GitHub.

O projeto possui um arquivo:

```text
.env.example
```

Copie esse arquivo para `.env`.

## Windows PowerShell

```powershell
Copy-Item .env.example .env
```

## Linux/macOS

```bash
cp .env.example .env
```

Depois abra o `.env` e configure as variáveis.

Exemplo:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=eventticket

DATABASE_URL=postgresql://postgres:postgres@database:5432/eventticket

NEXT_PUBLIC_API_URL=http://localhost:4000

TICKETMASTER_API_KEY=SUA_CHAVE_AQUI
```

Se o backend utilizar outras variáveis, elas também devem estar presentes no `.env.example` e no `.env`.

Por exemplo:

```env
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
```

Nunca publique chaves reais, senhas ou tokens no GitHub.

---

# 7. Criar as imagens Docker

Na raiz do projeto, execute:

```bash
docker compose build
```

Esse comando irá:

1. Baixar a imagem do Node.js, se necessário.
2. Instalar as dependências do backend.
3. Gerar o Prisma Client.
4. Compilar o backend TypeScript.
5. Instalar as dependências do frontend.
6. Compilar o Next.js.
7. Criar as imagens Docker do backend e frontend.

Para fazer uma reconstrução completa sem utilizar cache:

```bash
docker compose build --no-cache
```

---

# 8. Criar e iniciar o PostgreSQL

Inicie somente o banco:

```bash
docker compose up -d database
```

Verifique o status:

```bash
docker compose ps
```

O PostgreSQL deve aparecer como:

```text
Up (healthy)
```

Exemplo:

```text
NAME                   STATUS
eventticket-database   Up (healthy)
```

---

# 9. Restaurar o banco através do dump

O projeto possui um dump PostgreSQL em:

```text
database/dump/dump.sql
```

### Importante

Apesar da extensão `.sql`, o arquivo utilizado pelo projeto é um dump PostgreSQL em **custom format**.

Por isso ele deve ser restaurado com:

```text
pg_restore
```

e não com:

```text
psql
```

---

## 9.1 Copiar o dump para o container

### Windows PowerShell

```powershell
docker cp .\database\dump\dump.sql eventticket-database:/tmp/dump.sql
```

### Linux/macOS

```bash
docker cp ./database/dump/dump.sql eventticket-database:/tmp/dump.sql
```

---

## 9.2 Restaurar o dump

Execute:

```bash
docker exec eventticket-database pg_restore -U postgres -d eventticket --clean --if-exists /tmp/dump.sql
```

Se o seu usuário ou banco forem diferentes dos valores padrão do exemplo, utilize os valores correspondentes.

---

# 10. Verificar se o banco foi restaurado

Execute:

```bash
docker exec eventticket-database psql -U postgres -d eventticket -c "\dt"
```

As tabelas do projeto devem aparecer.

Exemplo:

```text
 Schema |        Name        | Type  |  Owner
--------+--------------------+-------+----------
 public | Payment            | table | postgres
 public | Publication        | table | postgres
 public | Purchase           | table | postgres
 public | Seat               | table | postgres
 public | ShoppingCart       | table | postgres
 public | ShoppingCartItem   | table | postgres
 public | Ticket             | table | postgres
 public | User               | table | postgres
 public | _prisma_migrations | table | postgres
```

Se as tabelas aparecerem, o dump foi restaurado corretamente.

---

# 11. Iniciar toda a aplicação

Depois de restaurar o banco:

```bash
docker compose up -d
```

Verifique:

```bash
docker compose ps
```

Você deverá encontrar os três containers:

```text
eventticket-database
eventticket-backend
eventticket-frontend
```

O banco deve estar:

```text
Up (healthy)
```

---

# 12. Acessar a aplicação

## Frontend

Abra:

```text
http://localhost:3000
```

## Backend

A API estará disponível em:

```text
http://localhost:4000
```

## PostgreSQL

O PostgreSQL estará disponível externamente em:

```text
localhost:5432
```

---

# 13. Comunicação entre os containers

É importante diferenciar os endereços utilizados pelo navegador e pelos containers.

## Do navegador para o backend

O frontend acessado pelo navegador utiliza:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## Do backend para o PostgreSQL

O backend dentro do Docker utiliza:

```env
DATABASE_URL=postgresql://postgres:postgres@database:5432/eventticket
```

Não utilize:

```text
localhost:5432
```

na `DATABASE_URL` do backend.

Dentro do container, `localhost` significa o próprio container do backend.

O hostname:

```text
database
```

é o nome do serviço PostgreSQL definido no `docker-compose.yml`.

---

# 14. Comandos principais

## Iniciar tudo

```bash
docker compose up -d
```

## Iniciar mostrando os logs

```bash
docker compose up
```

## Parar os containers

```bash
docker compose down
```

Esse comando mantém o volume do PostgreSQL.

## Recriar as imagens e iniciar

```bash
docker compose up --build -d
```

## Rebuild sem cache

```bash
docker compose build --no-cache
docker compose up -d
```

## Ver containers

```bash
docker compose ps
```

## Ver logs de todos os serviços

```bash
docker compose logs -f
```

## Ver logs do backend

```bash
docker compose logs -f backend
```

## Ver logs do frontend

```bash
docker compose logs -f frontend
```

## Ver logs do banco

```bash
docker compose logs -f database
```

---

# 15. Parar a aplicação sem apagar os dados

Use:

```bash
docker compose down
```

Isso remove os containers, mas mantém o volume:

```text
postgres_data
```

Ao executar novamente:

```bash
docker compose up -d
```

os dados continuam no banco.

---

# 16. Apagar completamente o banco

Para remover também o volume do PostgreSQL:

```bash
docker compose down -v
```

### ATENÇÃO

Esse comando remove os dados armazenados no volume do PostgreSQL.

Depois será necessário criar o banco novamente e restaurar o dump:

```bash
docker compose up -d database
```

Depois:

```powershell
docker cp .\database\dump\dump.sql eventticket-database:/tmp/dump.sql
```

E:

```bash
docker exec eventticket-database pg_restore -U postgres -d eventticket --clean --if-exists /tmp/dump.sql
```

---

# 17. Alterações no código

Durante o desenvolvimento, se você alterar o backend ou frontend e estiver utilizando as imagens de produção, será necessário reconstruir a imagem:

```bash
docker compose up --build -d
```

Se quiser garantir que nenhuma camada antiga seja utilizada:

```bash
docker compose build --no-cache
docker compose up -d
```

---

# 18. Desenvolvimento local

Caso queira desenvolver sem Docker, o backend e frontend também possuem scripts próprios.

## Backend

Entre na pasta:

```bash
cd backend
```

Instale as dependências:

```bash
npm install
```

Execute:

```bash
npm run dev
```

## Frontend

Entre na pasta:

```bash
cd frontend
```

Instale as dependências:

```bash
npm install
```

Execute:

```bash
npm run dev
```

Porém, para executar o projeto completo de forma padronizada, recomenda-se utilizar Docker Compose.

---

# 19. Prisma

O backend utiliza Prisma.

Durante o build da imagem Docker, o Prisma Client é gerado automaticamente através de:

```bash
npx prisma generate
```

O banco deste ambiente é restaurado através do dump PostgreSQL.

O dump também contém a tabela:

```text
_prisma_migrations
```

Portanto, o banco restaurado deve corresponder ao schema/migrations utilizados pelo projeto.

---

# 20. Verificar o Prisma

Para verificar o estado das migrations, entre no container:

```bash
docker exec -it eventticket-backend sh
```

Depois:

```bash
npx prisma migrate status
```

Para sair:

```bash
exit
```

Não execute migrations destrutivas em um banco contendo dados importantes sem verificar primeiro o estado do banco.

---

# 21. Testar o backend

Os testes podem ser executados no container ou localmente.

Entre no container:

```bash
docker exec -it eventticket-backend sh
```

Execute:

```bash
npm test
```

Ou:

```bash
npm run test:run
```

Para testes unitários:

```bash
npm run test:unit
```

Saia do container:

```bash
exit
```

---

# 22. Problemas comuns

## Erro: container do banco não está healthy

Verifique os logs:

```bash
docker compose logs database
```

Verifique também:

```bash
docker compose ps
```

O banco precisa aparecer como:

```text
Up (healthy)
```

---

## Erro: TICKETMASTER_API_KEY não configurada

Verifique o `.env`:

```env
TICKETMASTER_API_KEY=SUA_CHAVE
```

Depois reconstrua o frontend:

```bash
docker compose build --no-cache frontend
```

E inicie novamente:

```bash
docker compose up -d
```

---

## Erro ao restaurar o dump

Confirme que o dump é um PostgreSQL custom-format.

O comando correto para esse tipo de dump é:

```bash
pg_restore
```

e não:

```bash
psql
```

Verifique o conteúdo do dump:

```bash
docker cp ./database/dump/dump.sql eventticket-database:/tmp/dump.sql
```

Depois:

```bash
docker exec eventticket-database pg_restore -l /tmp/dump.sql
```

---

## Erro de conexão com o PostgreSQL

Dentro do Docker, a conexão deve utilizar:

```text
database:5432
```

Exemplo:

```env
DATABASE_URL=postgresql://postgres:postgres@database:5432/eventticket
```

Não utilize:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/eventticket
```

para o backend dentro do Docker.

---

## Porta 3000 já está sendo utilizada

Se a porta 3000 estiver ocupada, altere no `docker-compose.yml`:

```yaml
ports:
  - "3001:3000"
```

A aplicação será acessada em:

```text
http://localhost:3001
```

---

## Porta 4000 já está sendo utilizada

Altere:

```yaml
ports:
  - "4001:4000"
```

E ajuste o frontend:

```env
NEXT_PUBLIC_API_URL=http://localhost:4001
```

Depois reconstrua o frontend:

```bash
docker compose up --build -d
```

---

## Porta 5432 já está sendo utilizada

Altere:

```yaml
ports:
  - "5433:5432"
```

Importante: entre os containers, o PostgreSQL continua sendo:

```text
database:5432
```

A porta externa `5433` é apenas para acesso a partir do computador host.

---

# 23. Segurança

Nunca publique no GitHub:

```text
.env
```

ou informações como:

```text
TICKETMASTER_API_KEY
JWT_ACCESS_SECRET
JWT_REFRESH_SECRET
POSTGRES_PASSWORD
EMAIL_PASSWORD
```

Utilize:

```text
.env.example
```

com valores vazios ou exemplos.

Exemplo:

```env
TICKETMASTER_API_KEY=
JWT_ACCESS_SECRET=
POSTGRES_PASSWORD=
```

---

# 24. Primeiro uso após clonar o GitHub

O procedimento completo para uma máquina nova é:

```bash
git clone https://github.com/Ruan-Lauro/EvenTicket.git
```

```bash
cd Etickets
```

Criar o `.env`:

### Windows

```powershell
Copy-Item .env.example .env
```

### Linux/macOS

```bash
cp .env.example .env
```

Configurar as variáveis:

```text
.env
```

Construir as imagens:

```bash
docker compose build
```

Criar o banco:

```bash
docker compose up -d database
```

Copiar o dump:

### Windows

```powershell
docker cp .\database\dump\dump.sql eventticket-database:/tmp/dump.sql
```

### Linux/macOS

```bash
docker cp ./database/dump/dump.sql eventticket-database:/tmp/dump.sql
```

Restaurar:

```bash
docker exec eventticket-database pg_restore -U postgres -d eventticket --clean --if-exists /tmp/dump.sql
```

Iniciar a aplicação:

```bash
docker compose up -d
```

Verificar:

```bash
docker compose ps
```

Acessar:

```text
http://localhost:3000
```

---

# 25. Fluxo resumido

```text
1. Clonar GitHub
        ↓
2. Criar .env
        ↓
3. docker compose build
        ↓
4. docker compose up -d database
        ↓
5. Copiar dump para o container
        ↓
6. Executar pg_restore
        ↓
7. docker compose up -d
        ↓
8. Acessar localhost:3000
```

---

# 26. Comando para o dia a dia

Depois que a instalação inicial já tiver sido feita, normalmente basta:

```bash
docker compose up -d
```

Depois de alterações no código:

```bash
docker compose up --build -d
```

Para parar:

```bash
docker compose down
```

Os dados do PostgreSQL continuarão preservados no volume Docker.

---

# 27. Status esperado

Quando tudo estiver funcionando:

```bash
docker compose ps
```

deve mostrar aproximadamente:

```text
NAME                    SERVICE    STATUS
eventticket-database    database   Up (healthy)
eventticket-backend     backend    Up
eventticket-frontend    frontend   Up
```

A aplicação estará disponível em:

```text
Frontend:
http://localhost:3000

Backend:
http://localhost:4000
```

---

## Licença

ISC
Ruan Lauro