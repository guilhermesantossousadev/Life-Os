# Contexto do Life OS

**Versão documental:** 3.0.0

**Data de referência:** 2026-08-23

**Idioma/fuso:** `pt-BR` / `America/Sao_Paulo`

**Status:** implementação full-stack presente; implantação cloud não verificada

## Autoridade e limites

Este arquivo registra o estado verificável do produto. A ordem de verdade é: código executável, migrations/configuração, testes, este documento e README. `Templates/Figma/` é referência visual protegida e não participa do build.

Nunca registre secrets, tokens, connection strings reais ou dados pessoais. “Implementado” significa presente no repositório, não provisionado em produção.

## Arquitetura atual

O frontend usa Clean Architecture pragmática:

- `src/domain`: modelos e linguagem do negócio;
- `src/application`: portas e orquestração de sessão/workspace;
- `src/infrastructure`: Supabase Auth e HTTP REST;
- `src/presentation`: páginas, componentes e hooks;
- `src/app` e `src/main.tsx`: shell e composição.

As portas de Auth/API são injetadas no composition root. Um teste arquitetural impede que `domain` dependa de camadas externas, que `application` importe infraestrutura/UI e que infraestrutura importe apresentação.

O backend é dividido em:

- `LifeOS.Domain`: entidades;
- `LifeOS.Application`: abstrações, validações, finanças e tempo;
- `LifeOS.Infrastructure`: EF Core, PostgreSQL e migrations;
- `LifeOS.Api`: controllers e adaptadores ASP.NET/Supabase;
- `LifeOS.Tests`: testes de regra, ownership e segurança.

`Application` depende apenas de `Domain`. A identificação do usuário e o Storage privado são portas de Application implementadas nos adaptadores da API. Consulte [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Dados e segurança

- IDs persistentes são UUID.
- Toda entidade pessoal possui ownership direto ou derivado.
- `user_id` do cliente é ignorado; a API usa o claim `sub`.
- Relações entre entidades exigem o mesmo proprietário.
- EF Core usa queries parametrizadas, FKs, índices, limites e constraints.
- Dinheiro usa `decimal`/`numeric`.
- Datas civis usam `DateOnly`/`YYYY-MM-DD`; timestamps usam UTC.
- O JWT Supabase valida assinatura, issuer, audience e lifetime.
- RLS e policies do Storage ficam em `supabase/migrations/0002_rls_storage.sql`.
- O bucket `documents` é privado; downloads usam URLs assinadas.
- Upload máximo é 20 MB e tem allowlist de extensão/MIME.
- API usa correlation ID, headers de segurança, CORS configurável, rate limit e ProblemDetails.

## Modelo persistente

Migrations EF atuais:

- `20260822013952_InitialCreate`;
- `20260822020555_AddLengthConstraints`;
- `20260822124000_EnableSupabaseSecurity`.

O modelo inclui perfil/preferências, categorias/tags, tarefas/subtarefas, inbox, eventos, metas/ações, projetos, notas, contas/movimentos, cartões, parcelamentos, dívidas, orçamentos, estudos, carreira, patrimônio, veículos, manutenções e documentos. Relações de tags são normalizadas.

Não existe tabela `AppData`. `/api/v1/workspace` monta um agregado de leitura das tabelas normalizadas; o servidor é a fonte de verdade.

## Estado funcional

- Auth: cadastro, login, recuperação, sessão, logout e rotas protegidas.
- Perfil: nome, e-mail, avatar privado, preferências e tema sistema.
- Organização: tarefas, inbox/conversão, agenda, metas, projetos e notas Markdown/autosave.
- Finanças: contas, transações, transferências, cartões, faturas, parcelamentos, dívidas e orçamentos.
- Estudos/carreira: disciplinas, atividades, cursos, tópicos, posições, trajetória, competências e certificações.
- Patrimônio/documentos: bens, veículos, manutenções, upload privado, busca, metadados e download assinado.
- Plataforma: dashboard, notificações, criação rápida, busca global, backup JSON e importação opcional do legado.

Integrações externas e Assistente/IA continuam fora de escopo e não simulam conexão ou resposta.

## API e tempo

Recursos vivem sob `/api/v1`; a lista e convenções estão em [docs/API.md](docs/API.md). Falhas seguem ProblemDetails com `traceId`.

Datas civis não devem ser construídas com `new Date("YYYY-MM-DD")`. Use `src/shared/datetime/dates.ts` no frontend e `LifeClock` no backend.

## Execução e validação

Os comandos canônicos estão em [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md). O frontend possui typecheck estrito, Vitest, build Vite e cenários Playwright. O backend possui build/testes .NET. E2E completo exige Supabase e conta de teste; deploy exige credenciais no provedor.

O estado de validação desta refatoração deve ser lido no handoff/commit correspondente; este documento não congela contagens de testes, pois elas mudam com a suíte.

## Estado operacional

Existem Dockerfiles, Compose, Blueprint Render, exemplos de ambiente e CI. Não há secrets reais versionados nem evidência local de que migrations/RLS tenham sido aplicadas em um projeto remoto. Para publicar, siga [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) e [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md).
