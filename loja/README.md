# Loja

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.0.1.

## Como rodar o frontend

1. Instale as dependências (já estão commitadas em `package-lock.json`):

```bash
npm install
```

2. Garanta que o backend da La Couro esteja rodando em `http://localhost:8080`.

3. Suba o servidor de desenvolvimento (ele usa um proxy local para encaminhar `/api` para `http://localhost:8080`, evitando erros de CORS durante o desenvolvimento):

```bash
npm start
```

Depois disso, acesse `http://localhost:4200/`. A aplicação recarrega automaticamente conforme você altera os arquivos.

### Login e autenticação

Conte com o proxy: a base das requisições (`environment.apiUrl`) é relativa, então todas as chamadas vão para o mesmo host da SPA (`/api/...`). Em desenvolvimento o proxy cuida de encaminhar para `http://localhost:8080` sem CORS; em produção você pode servir o frontend no mesmo host da API ou editar `src/environments/environment.ts` para um host absoluto.

- A página de login está em `/login` e usa o endpoint `POST /api/auth/login` da API.
- O token JWT retornado é salvo no `localStorage` e incluído automaticamente nas requisições seguintes pelo interceptor HTTP.
- Se você quiser testar com um usuário existente, o backend cria o admin padrão `admin@lacouro.com` (senha definida no script de seed). Também é possível registrar um novo cliente via `POST /api/auth/register` diretamente pela API.

### Fluxo sugerido de teste (espelha a coleção Postman)

1. **Seed obrigatório**: garanta que o ADMIN inicial exista (via seed SQL), pois a API só permite criar novos admins autenticado como ADMIN.
2. Abra `http://localhost:4200/login`.
   - Como CLIENTE, use o formulário de cadastro da página para executar o passo 1 do Postman.
   - Faça login como CLIENTE (passo 2) ou como ADMIN seed (passo 3).
3. Na home protegida:
   - ADMIN publica produtos (passo 4) e pode criar outros ADMINs (passo 5).
   - CLIENTE escolhe um produto publicado e cria um pedido (passo 6).
   - ADMIN seleciona um pedido e registra o pagamento (passo 7), podendo ver todos os pedidos.
   - CLIENTE vê apenas os próprios pedidos (passo 8) e pode acompanhar o status.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
