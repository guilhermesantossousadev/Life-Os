# Life OS

Aplicação pessoal full-stack para organizar tarefas, agenda, metas, projetos, notas, finanças, estudos, carreira, patrimônio e documentos privados.

O repositório segue uma Clean Architecture pragmática: regras e contratos ficam no centro; React, ASP.NET Core, EF Core, Supabase e PostgreSQL são detalhes externos. A composição das implementações acontece apenas nos pontos de entrada.

## Visão geral

```text
React 19 / TypeScript / Vite
          │ JWT do Supabase Auth
          ▼
ASP.NET Core 10 Web API
          │ EF Core / Npgsql
          ▼
PostgreSQL + Supabase Storage privado
```

- Frontend em `src/`, organizado em `domain`, `application`, `infrastructure`, `presentation` e `app`.
- Backend em `backend/`, com projetos separados para `Domain`, `Application`, `Infrastructure` e `Api`.
- Autenticação pelo Supabase Auth; a API é a única porta de acesso aos dados pessoais.
- Arquivos privados no Supabase Storage, entregues por URLs assinadas temporárias.
- Datas civis em `YYYY-MM-DD`, timestamps em UTC e apresentação em `pt-BR`/`America/Sao_Paulo`.

## Início rápido

Requisitos: Node.js 22, npm, .NET SDK 10 e um projeto Supabase. PostgreSQL 17 é necessário apenas para o fluxo local via Docker.

```bash
cp .env.example .env.local
npm ci
npm run dev
```

Em outro terminal:

```bash
dotnet run --project backend/LifeOS.Api
```

Endereços padrão:

- Frontend: `http://localhost:5173`
- API e Swagger: `http://localhost:5080` e `http://localhost:5080/swagger`
- Health check: `http://localhost:5080/health`

O frontend precisa de `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`. A API precisa das configurações listadas em [backend/.env.example](backend/.env.example); ela não carrega `.env` automaticamente.

## Banco e Supabase

```bash
dotnet tool install --global dotnet-ef
dotnet ef database update \
  --project backend/LifeOS.Infrastructure \
  --startup-project backend/LifeOS.Api
```

Depois, execute [0002_rls_storage.sql](supabase/migrations/0002_rls_storage.sql) no SQL Editor do Supabase para garantir RLS, policies por usuário e o bucket privado `documents`. Em produção, `Database__MigrateOnStartup=true` aplica as migrations na inicialização.

## Validação

```bash
npm run typecheck
npm test
npm run build
dotnet test backend/LifeOS.Tests/LifeOS.Tests.csproj --configuration Release
```

Os E2E exigem uma conta exclusiva de teste:

```bash
E2E_BASE_URL=http://localhost:5173 \
E2E_EMAIL=usuario-de-teste@example.com \
E2E_PASSWORD=senha-da-conta-de-teste \
npm run test:e2e
```

Sem essas variáveis, os cenários são ignorados para não alterar contas reais.

## Docker

```bash
cp .env.docker.example .env.docker
docker compose --env-file .env.docker up --build
```

O Compose inicia PostgreSQL, API e frontend. Supabase ainda é necessário para Auth e Storage.

## Documentação

- [Arquitetura](docs/ARCHITECTURE.md): camadas, dependências e decisões.
- [Desenvolvimento](docs/DEVELOPMENT.md): configuração, comandos e convenções.
- [API](docs/API.md): autenticação, contratos, recursos e erros.
- [Segurança](docs/SECURITY.md): ownership, secrets e arquivos.
- [Deploy](docs/DEPLOYMENT.md): containers, Render, Supabase e rollback.
- [Contexto atual](CONTEXT.md): escopo funcional e estado verificável.
- [Checklist de publicação](IMPLEMENTATION_PLAN.md): tarefas operacionais restantes.

`Templates/Figma/` é somente uma referência visual e não participa do build. Não altere essa pasta sem autorização explícita.

## Fora de escopo

Integrações com Google, Notion, Open Finance e o Assistente/IA permanecem deliberadamente desativados e aparecem como “Em breve” ou “Em desenvolvimento”. O projeto não chama LLMs.
