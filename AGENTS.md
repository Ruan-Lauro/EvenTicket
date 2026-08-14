Sim. E, como sua autenticação já está pronta na **API Express com JWT + HttpOnly Cookie**, eu recomendo **não duplicar a autenticação no Next com NextAuth**. O Next deve consumir a sua API e usar o cookie como sessão.

Pela sua estrutura, você está usando **App Router**, então dá para organizar isso muito bem.

A ideia principal é esta:

```text
                  ┌──────────────────────┐
                  │       Next.js        │
                  │       Frontend       │
                  │                      │
                  │  /auth/login         │
                  │  /dashboard          │
                  │  /admin              │
                  └──────────┬───────────┘
                             │
                      HTTP + Cookie
                             │
                             ▼
                  ┌──────────────────────┐
                  │    Express API       │
                  │                      │
                  │ POST /auth/login     │
                  │ POST /auth/logout    │
                  │ GET  /auth/me        │
                  │ GET  /tickets        │
                  └──────────┬───────────┘
                             │
                       JWT + banco
                             │
                             ▼
                       PostgreSQL
```

O ponto mais importante: **o JWT não deve ficar em `localStorage` nem ser acessado pelo React**. Sendo `HttpOnly`, o navegador gerencia o cookie e o JavaScript do cliente não consegue lê-lo. Isso é justamente uma das vantagens dessa abordagem. O Next consegue acessar cookies recebidos na requisição no servidor; no Next atual, `cookies()` é assíncrono. ([Next.js][1])

---

# 1. Primeiro: como eu organizaria seu Next

Sua estrutura atual está parecida com:

```text
src/
├── app/
│   ├── auth/
│   │   ├── login/
│   │   └── register/
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
│
├── assets/
├── components/
├── hooks/
├── lib/
├── services/
├── types/
└── public/
```

Eu acrescentaria:

```text
src/
├── app/
│   ├── auth/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   │
│   ├── dashboard/
│   │   └── page.tsx
│   │
│   ├── admin/
│   │   └── page.tsx
│   │
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│
├── hooks/
│   └── useAuth.ts
│
├── lib/
│   ├── api.ts
│   ├── auth.ts
│   └── permissions.ts
│
├── services/
│   ├── auth.service.ts
│   └── ticket.service.ts
│
├── types/
│   ├── auth.ts
│   └── user.ts
│
└── proxy.ts
```

Como você provavelmente está usando Next 16, um detalhe importante: o antigo `middleware.ts` foi renomeado para **`proxy.ts`**. A documentação atual recomenda `proxy.ts` para esse tipo de verificação/redirect. ([Next.js][2])

---

# 2. Sua API precisa ter um `/auth/me`

Eu considero essa rota **fundamental** para o frontend.

Sua API deveria ter algo como:

```text
POST /auth/register
POST /auth/login
POST /auth/logout
GET  /auth/me
```

O login poderia responder:

```json
{
  "user": {
    "id": "123",
    "name": "João",
    "email": "joao@email.com",
    "role": "ADMIN"
  }
}
```

E, além disso, enviar:

```http
Set-Cookie: access_token=JWT_AQUI; HttpOnly; ...
```

O frontend **não precisa conhecer o JWT**.

Ele só precisa saber:

> "Existe uma sessão válida? Quem é o usuário?"

Por isso `/auth/me` é tão útil.

---

# 3. Configurando o CORS da API

Se durante desenvolvimento você tiver:

```text
Next:     http://localhost:3001
Express:  http://localhost:3000
```

Sua API precisa aceitar credenciais.

Por exemplo:

```typescript
import cors from "cors";

app.use(
  cors({
    origin: "http://localhost:3001",
    credentials: true,
  }),
);
```

Não use:

```typescript
origin: "*"
```

junto com autenticação baseada em cookies.

O `cors` do Express permite configurar `origin` e `credentials`, e CORS não é um mecanismo de autenticação/autorização — ele apenas controla como o navegador permite que uma origem leia respostas. ([Express.js][3])

---

# 4. O cookie da sua API

No login do Express, algo nessa linha:

```typescript
res.cookie("access_token", accessToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production"
    ? "none"
    : "lax",
  maxAge: 15 * 60 * 1000,
  path: "/",
});
```

Mas existe um detalhe importante aqui:

### Desenvolvimento

Se estiver:

```text
localhost:3001
localhost:3000
```

você precisa tomar cuidado com `SameSite`, domínio e `Secure`.

### Produção

Idealmente:

```text
app.seusite.com
api.seusite.com
```

ou, melhor ainda, colocar o frontend e API atrás do mesmo domínio/reverse proxy.

Por exemplo:

```text
https://seusite.com
```

para o usuário, e internamente:

```text
https://seusite.com/api/*
        ↓
Express
```

Isso simplifica bastante cookies e CORS.

---

# 5. Criando seu `lib/api.ts`

Agora vem a parte importante.

Você pode criar:

```text
src/lib/api.ts
```

E colocar uma função para chamadas à API.

Se estiver fazendo chamadas **do Client Component**, por exemplo:

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export async function apiFetch(
  path: string,
  options: RequestInit = {},
) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  return response;
}
```

O:

```typescript
credentials: "include"
```

é fundamental quando o frontend está fazendo uma requisição cross-origin e você quer que os cookies sejam enviados.

---

# 6. Seu `auth.service.ts`

Eu deixaria a comunicação com autenticação separada:

```text
src/services/auth.service.ts
```

Por exemplo:

```typescript
import { apiFetch } from "@/lib/api";

export interface LoginData {
  email: string;
  password: string;
}

export async function login(data: LoginData) {
  const response = await apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Email ou senha inválidos");
  }

  return response.json();
}

export async function logout() {
  const response = await apiFetch("/auth/logout", {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Erro ao sair");
  }
}

export async function getMe() {
  const response = await apiFetch("/auth/me");

  if (!response.ok) {
    return null;
  }

  return response.json();
}
```

---

# 7. Login no Next

Seu:

```text
app/auth/login/page.tsx
```

pode ter um componente client:

```text
app/
└── auth/
    └── login/
        ├── page.tsx
        └── LoginForm.tsx
```

O `page.tsx`:

```tsx
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return <LoginForm />;
}
```

E o formulário:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/services/auth.service";

export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    try {
      setError("");

      await login({
        email,
        password,
      });

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Email ou senha inválidos");
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />

      <input
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />

      <button type="submit">
        Entrar
      </button>

      {error && <p>{error}</p>}
    </form>
  );
}
```

Quando:

```typescript
await login(...)
```

acontecer, a API responde com:

```http
Set-Cookie: access_token=...
```

O navegador armazena o cookie.

O React **não precisa fazer nada com o JWT**.

---

# 8. Como saber se o usuário está autenticado?

Aqui entra o `/auth/me`.

Imagine que:

```http
GET /auth/me
```

responda:

```json
{
  "user": {
    "id": "1",
    "name": "João",
    "email": "joao@email.com",
    "role": "ADMIN"
  }
}
```

Então você pode ter:

```text
src/
└── types/
    └── user.ts
```

```typescript
export type UserRole =
  | "ADMIN"
  | "CONCIERGE"
  | "USER";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}
```

---

# 9. Uma coisa MUITO importante sobre autorização

Você tem que separar:

### Autenticação

> "Esse usuário está logado?"

### Autorização

> "Esse usuário pode fazer isso?"

A própria documentação do Next diferencia autenticação de autorização dessa forma. ([Next.js][4])

Por exemplo:

```text
Usuário logado?
       │
       ├── NÃO → /auth/login
       │
       └── SIM
            │
            ▼
       Qual é a role?
            │
       ┌────┼─────────┐
       ▼    ▼         ▼
     USER  STAFF     ADMIN
```

---

# 10. Não confie somente no Next para permissões

Esse é um dos pontos mais importantes da arquitetura.

Imagine que você tenha:

```text
/admin
```

O Next pode esconder essa página de um usuário:

```text
USER → não mostra /admin
```

Mas isso **não protege sua API**.

Alguém poderia simplesmente fazer:

```http
PATCH /users/123
```

diretamente contra sua API.

Por isso sua API Express deve continuar tendo:

```typescript
authMiddleware
```

e:

```typescript
requireRole("ADMIN")
```

como você já estava fazendo.

A arquitetura fica:

```text
                  NEXT
                    │
          "Pode entrar nessa página?"
                    │
                    ▼
               autorização UI
                    │
                    ▼
                  API
                    │
          "Pode executar essa ação?"
                    │
                    ▼
          authMiddleware
                    │
                    ▼
             requireRole()
```

**A API é a autoridade final.**

O Next serve para proteger navegação e experiência do usuário. A autorização real precisa continuar no Express.

A própria documentação atual do Next alerta que o Proxy é útil para verificações otimistas/redirects, mas não deve ser usado como solução completa de gerenciamento de sessão/autorização. ([Next.js][5])

---

# 11. Protegendo `/dashboard`, `/admin`, etc.

Como você está usando Next atual, pode criar:

```text
proxy.ts
```

na raiz:

```text
eventticket/
├── src/
│   └── app/
├── proxy.ts
├── package.json
└── next.config.ts
```

E:

```typescript
import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("access_token");

  const isAuthenticated = !!token;

  const isProtectedRoute =
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/admin");

  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(
      new URL("/auth/login", request.url),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
  ],
};
```

O Next permite acessar cookies da requisição através de `NextRequest.cookies`. ([Next.js][6])

---

# 12. Mas atenção: isso só verifica a existência do cookie

Esse código:

```typescript
const token = request.cookies.get("access_token");
```

não significa:

> "O JWT é válido."

Significa somente:

> "Existe um cookie chamado `access_token`."

E isso é propositalmente uma **verificação otimista**.

Para uma autorização realmente confiável, você precisa validar o JWT ou consultar a API.

---

# 13. E aqui aparece uma decisão arquitetural importante

Se sua arquitetura for:

```text
Browser
   │
   ├── localhost:3001 → Next
   │
   └── localhost:3000 → Express
```

e o Express cria:

```text
access_token
```

como cookie, esse cookie pertence ao domínio do Express.

Então existe uma dificuldade:

```text
Cookie do localhost
        ↓
Browser
        ↓
Next consegue receber?
```

Isso depende de como o cookie está configurado.

Por isso, para seu projeto, eu recomendo considerar uma arquitetura ainda melhor:

# Next como BFF/proxy

Em vez de:

```text
Browser → Express
```

fazer:

```text
Browser
   │
   ▼
 Next.js
   │
   ▼
 Express API
```

Por exemplo:

```text
Browser
   │
   │ POST /api/auth/login
   ▼
Next Route Handler
   │
   │ POST http://localhost:3000/auth/login
   ▼
Express
```

O Next pode receber o `Set-Cookie` da API e definir o cookie no domínio do próprio frontend.

O Next possui Route Handlers justamente para criar endpoints e trabalhar com cookies. ([Next.js][7])

---

# 14. Exemplo desse BFF

Você poderia criar:

```text
src/
└── app/
    └── api/
        └── auth/
            ├── login/
            │   └── route.ts
            ├── logout/
            │   └── route.ts
            └── me/
                └── route.ts
```

Então:

```text
POST /api/auth/login
```

no Next chama:

```text
POST http://localhost:3000/auth/login
```

no Express.

Isso dá:

```text
Browser
   │
   │ cookie
   ▼
Next
   │
   │ cookie
   ▼
Express
```

E você pode manter o JWT completamente fora do JavaScript do navegador.

---

# 15. Ficaria assim

Sua arquitetura poderia ficar:

```text
eventticket/
│
├── src/
│   │
│   ├── app/
│   │   ├── api/
│   │   │   └── auth/
│   │   │       ├── login/
│   │   │       │   └── route.ts
│   │   │       ├── logout/
│   │   │       │   └── route.ts
│   │   │       └── me/
│   │   │           └── route.ts
│   │   │
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   ├── page.tsx
│   │   │   │   └── LoginForm.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   │
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   │
│   │   ├── admin/
│   │   │   └── page.tsx
│   │   │
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── components/
│   │
│   ├── hooks/
│   │   └── useAuth.ts
│   │
│   ├── lib/
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   └── permissions.ts
│   │
│   ├── services/
│   │   ├── auth.service.ts
│   │   └── ticket.service.ts
│   │
│   └── types/
│       ├── auth.ts
│       └── user.ts
│
├── proxy.ts
├── .env.local
├── next.config.ts
└── package.json
```

---

# 16. Como eu faria as permissões

Você pode ter:

```typescript
export type Role =
  | "USER"
  | "CONCIERGE"
  | "ADMIN";
```

E uma função:

```typescript
export function hasRole(
  userRole: Role,
  allowedRoles: Role[],
) {
  return allowedRoles.includes(userRole);
}
```

Por exemplo:

```typescript
hasRole("ADMIN", ["ADMIN"]);
```

→ `true`

E:

```typescript
hasRole("USER", ["ADMIN"]);
```

→ `false`.

Mas eu **não colocaria toda essa lógica somente no `proxy.ts`**.

Para páginas:

```text
/admin
```

você pode fazer uma verificação.

Para ações:

```text
DELETE /tickets/:id
PATCH /users/:id
POST /tickets/:id/validate
```

a API Express deve obrigatoriamente verificar.

---

# 17. Exemplo com seu sistema de tickets

Como você já estava usando algo como:

```typescript
authMiddleware
requireRole("CONCIERGE")
```

sua API pode ter:

```text
GET /tickets
        ↓
authMiddleware

GET /tickets/:code
        ↓
authMiddleware

PATCH /tickets/:code/validate
        ↓
authMiddleware
        ↓
requireRole("CONCIERGE")
```

No Next:

```text
/dashboard
        ↓
qualquer usuário autenticado

/dashboard/tickets
        ↓
qualquer usuário autenticado

/dashboard/validate
        ↓
CONCIERGE

/admin
        ↓
ADMIN
```

E você pode até controlar o menu:

```text
USER
├── Dashboard
└── Meus ingressos

CONCIERGE
├── Dashboard
├── Ingressos
└── Validar ingresso

ADMIN
├── Dashboard
├── Ingressos
├── Usuários
└── Configurações
```

Mas isso é **UI**.

A API ainda precisa proteger tudo.

---

# 18. O fluxo completo de login

O fluxo que eu recomendo para você é:

```text
1. Usuário abre /auth/login
             │
             ▼
2. Digita email + senha
             │
             ▼
3. Next → POST /api/auth/login
             │
             ▼
4. Next → Express /auth/login
             │
             ▼
5. Express valida email/senha
             │
             ▼
6. Express cria JWT
             │
             ▼
7. Express → Set-Cookie
             │
             ▼
8. Next/browser armazena HttpOnly Cookie
             │
             ▼
9. Next redireciona /dashboard
             │
             ▼
10. Proxy verifica sessão
             │
             ▼
11. Página /dashboard
```

Depois:

```text
GET /dashboard
       │
       ▼
   Proxy
       │
       ▼
Existe sessão?
   │          │
   NÃO        SIM
   │           │
   ▼           ▼
 /login    dashboard
```

E quando o Next precisar dos dados:

```text
Next
 │
 │ GET /api/auth/me
 ▼
Route Handler
 │
 │ Cookie
 ▼
Express
 │
 │ JWT verify
 ▼
User
 │
 ▼
Next
```

---

# 19. Refresh token

Como você mencionou anteriormente que sua API está usando **access + refresh JWT**, eu faria:

```text
access_token
HttpOnly
vida curta
ex: 15 minutos

refresh_token
HttpOnly
vida longa
ex: 7 dias
```

O fluxo:

```text
access_token válido
       │
       ▼
     API
       │
       ▼
    sucesso
```

Quando expirar:

```text
access_token expirou
       │
       ▼
API → 401
       │
       ▼
POST /auth/refresh
       │
       ▼
refresh_token
       │
       ▼
novo access_token
       │
       ▼
repete requisição
```

E novamente:

**nenhum desses tokens precisa ser colocado em `localStorage`.**

---

# 20. O que eu NÃO faria

Eu evitaria esta arquitetura:

```text
localStorage
   │
   └── accessToken

React
   │
   └── Authorization: Bearer token
```

Se você já decidiu usar:

```text
JWT + HttpOnly Cookie
```

continue nessa direção.

Também não faria:

```text
Next verifica permissão
        ↓
API não verifica
```

Isso seria inseguro.

Faça:

```text
Next
 ↓
proteção da interface/navegação

Express
 ↓
autenticação + autorização REAL
```

---

## Em resumo

Para o seu projeto, eu montaria **4 camadas**:

```text
┌──────────────────────────────────────────┐
│                  Next.js                 │
│                                          │
│ Pages / Components / UI                  │
└────────────────────┬─────────────────────┘
                     │
┌────────────────────▼─────────────────────┐
│              Next Auth Layer             │
│                                          │
│ proxy.ts                                 │
│ /api/auth/*                              │
│ cookies HttpOnly                         │
└────────────────────┬─────────────────────┘
                     │
┌────────────────────▼─────────────────────┐
│               Express API                │
│                                          │
│ authMiddleware                           │
│ requireRole()                            │
│ controllers                              │
│ services                                 │
└────────────────────┬─────────────────────┘
                     │
┌────────────────────▼─────────────────────┐
│               PostgreSQL                 │
└──────────────────────────────────────────┘
```

E a regra de ouro seria:

> **Next decide quem pode navegar; Express decide quem realmente pode executar.**

Isso combina muito bem com a arquitetura que você já está construindo na API. E como você está usando App Router, a API de `cookies()` e os Route Handlers do Next são particularmente úteis para essa integração. ([Next.js][1])

Se você me passar **como estão exatamente suas rotas de `login`, `register`, `refresh`, `logout` e `me` no Express e o código que está criando o cookie**, eu consigo montar essa integração **arquivo por arquivo em cima da sua estrutura atual**, incluindo `proxy.ts`, `api/auth/*`, `auth.service.ts`, refresh automático e proteção por `USER/CONCIERGE/ADMIN`.

Também posso criar uma imagem mostrando visualmente esse fluxo Next → Cookie → Express → JWT → permissões.

[1]: https://nextjs.org/docs/app/api-reference/functions/cookies?utm_source=chatgpt.com "Functions: cookies | Next.js"
[2]: https://nextjs.org/docs/app/api-reference/file-conventions/proxy?utm_source=chatgpt.com "File-system conventions: proxy.js | Next.js"
[3]: https://expressjs.com/pt-br/resources/middleware/cors/?utm_source=chatgpt.com "cors middleware · Express.js"
[4]: https://nextjs.org/learn/dashboard-app/adding-authentication?utm_source=chatgpt.com "App Router: Adding Authentication | Next.js"
[5]: https://nextjs.org/docs/app/getting-started/proxy?utm_source=chatgpt.com "Getting Started: Proxy | Next.js"
[6]: https://nextjs.org/docs/app/api-reference/functions/next-request?utm_source=chatgpt.com "Functions: NextRequest | Next.js"
[7]: https://nextjs.org/docs/app/api-reference/file-conventions/route?utm_source=chatgpt.com "File-system conventions: route.js | Next.js"
