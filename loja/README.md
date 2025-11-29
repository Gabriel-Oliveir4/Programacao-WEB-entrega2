# Loja (Frontend Angular)

Aplicação Angular que consome a API La Couro com login JWT, área administrativa e catálogo protegido por guardas de rota.

## Estrutura de pastas
- `src/app/core`: serviços HttpClient, models, interceptors e guards (auth + role).
- `src/app/features`: módulos/rotas lazy dos domínios (`auth`, `home`, `admin`).
- `src/environments`: variáveis por ambiente (`environment.ts` define `apiUrl`).
- Configurações principais em `angular.json` (Angular Material e Bootstrap) e `proxy.conf.json` (proxy /api → backend na dev).

## Roteamento (Lazy Loading)
- Definido em `src/app/app.routes.ts` com rotas carregadas sob demanda para `auth`, `home` e `admin`.
- `<router-outlet>` no `app.component` renderiza dinamicamente cada módulo.

## Integração com API
- Services dedicados: `AuthService`, `UserService`, `ProdutoService`, `PedidoService`, `EstoqueService` (todos em `core/services`).
- Chamadas HTTP com `HttpClient` para `GET/POST/PUT/PATCH/DELETE` usando `environment.apiUrl`.
- Proxy local (`npm start`) envia `/api` para `http://localhost:8080`, evitando CORS na dev.

## Segurança e Autenticação
- Login via `AuthService.login` (`POST /api/auth/login`); token JWT salvo em `localStorage`.
- `AuthInterceptor` anexa `Authorization: Bearer <token>` automaticamente.
- `AuthGuard` protege rotas privadas; `RoleGuard` restringe `/admin/**` a ADMIN.

## Formulários e Validação
- Formulários reativos com `FormBuilder` e validadores (`required`, `email`, `minLength`).
- Feedback de erro via `<mat-error>` em campos inválidos.

## UI/UX
- Componentes Angular Material (toolbar, card, form-field, button, icon, table) e utilitários Bootstrap para grid/responsividade.
- Listagens e ações de CRUD presentes nos módulos de admin (pedidos, estoque, usuários) e na home protegida.

## Como rodar
```bash
cd loja
npm install
npm start
```
Acesse `http://localhost:4200/`. Certifique-se de que o backend esteja em `http://localhost:8080` (ou ajuste `environment.ts`).
