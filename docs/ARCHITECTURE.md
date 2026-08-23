# Arquitetura

## Objetivo

Manter regras de negócio independentes de UI, banco, autenticação e provedores externos. As dependências apontam para dentro; detalhes externos implementam contratos definidos pelas camadas centrais.

```text
Frameworks/drivers → adaptadores → application → domain
React/Supabase       UI/HTTP/DB     portas/regras   entidades
```

## Frontend

```text
src/
├── app/                     composição, shell e roteamento
├── domain/                  entidades e linguagem do negócio
├── application/
│   ├── ports/               contratos de Auth, HTTP e recursos
│   └── state/               orquestração do workspace e sessão
├── infrastructure/
│   ├── auth/                adaptador Supabase Auth
│   └── http/                cliente da API e gateways REST
├── presentation/
│   ├── components/          componentes compartilhados da UI
│   ├── hooks/               comportamento exclusivo da UI
│   └── pages/               telas por módulo
├── shared/datetime/         utilitários puros de data e fuso
└── main.tsx                 composition root
```

Regras de dependência:

1. `domain` não importa camadas externas.
2. `application` não importa `infrastructure`, `presentation` ou `app`.
3. `infrastructure` implementa portas de `application` e não conhece a UI.
4. `presentation` consome estado/casos de uso. Chamadas diretas aos gateways existentes são adaptadores legados permitidos durante a evolução, mas novas regras devem entrar em `application`.
5. `main.tsx` conecta implementações concretas às portas (`supabaseAuthGateway`, `api` e `resources`).

O teste `src/architecture.test.ts` protege as três primeiras regras.

## Backend

```text
backend/
├── LifeOS.Domain/           entidades persistentes e contratos do domínio
├── LifeOS.Application/
│   ├── Abstractions/        portas para usuário atual e arquivos privados
│   ├── Validation/          invariantes de entidades
│   ├── Finances/            cálculos monetários
│   └── Time/                relógio e fuso da aplicação
├── LifeOS.Infrastructure/   EF Core, Npgsql, DbContext e migrations
├── LifeOS.Api/
│   ├── Authentication/      adaptador do usuário autenticado
│   ├── Controllers/         entrada HTTP e ownership
│   ├── Infrastructure/      adaptador do Supabase Storage
│   ├── Presentation/        middleware, erros e health response
│   └── Program.cs           composition root
└── LifeOS.Tests/            regras, isolamento e segurança
```

Grafo permitido:

```text
Domain ← Application
   ↑          ↑
Infrastructure   Api (composition root)
   ↑              │
   └───────────────┘
```

- `Domain` não referencia outros projetos.
- `Application` referencia apenas `Domain`.
- `Infrastructure` referencia `Domain`; não referencia `Application` sem necessidade.
- `Api` referencia as três camadas para compor o processo e hospedar adaptadores HTTP.

Os controllers usam `LifeOsDbContext` diretamente nas operações CRUD e agregadas. Essa é uma decisão pragmática para evitar repositórios genéricos sem valor: regras reutilizáveis permanecem em `Application`, e detalhes HTTP permanecem nos controllers. Extraia um caso de uso quando houver coordenação complexa, reutilização, transação multietapa ou necessidade de teste sem ASP.NET/EF.

## Fluxo de uma requisição

```text
Página React
  → porta ApiClient/ResourceGateway
  → adaptador fetch com Bearer JWT
  → controller ASP.NET autorizado
  → validação e ownership
  → EF Core/PostgreSQL ou porta IPrivateFileStorage
  → resposta JSON/ProblemDetails
```

## Dados e identidade

- IDs persistentes são UUID; o frontend usa IDs numéricos somente para identidade local e mantém `serverId` para sincronização.
- `user_id` é derivado do claim `sub`; valores enviados pelo cliente são sobrescritos.
- Relações são aceitas apenas quando o recurso relacionado pertence ao usuário.
- O workspace é um agregado de leitura; não existe tabela JSON `AppData`.
- Valores monetários usam `decimal`/`numeric` no servidor.

## Como adicionar funcionalidade

1. Modele conceitos estáveis em `Domain`/`src/domain`.
2. Coloque regras e contratos externos em `Application`.
3. Implemente banco, HTTP ou provedor em `Infrastructure`.
4. Exponha a operação por controller e/ou UI em `Presentation`.
5. Registre implementações no composition root.
6. Cubra regra, integração e fronteira arquitetural com testes proporcionais ao risco.

Evite utilitários genéricos sem dono, imports relativos atravessando camadas e regras de negócio dentro de componentes visuais.
