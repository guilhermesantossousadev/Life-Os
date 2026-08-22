# Life OS

Aplicação pessoal full-stack para tarefas, inbox, agenda, metas, projetos, notas, finanças, estudos, carreira, patrimônio e documentos. O frontend preserva a interface React/Vite existente; `Templates/Figma/` continua sendo apenas a referência visual e não foi alterada.

## Arquitetura

```text
React 19 + Vite 8 + TypeScript + Tailwind
                    │ Supabase Auth JWT
                    ▼
             ASP.NET Core 10 API
                    │ EF Core / Npgsql
                    ▼
             PostgreSQL (Supabase)
                    │
                    └── Supabase Storage privado
```

- `src/`: frontend, rotas protegidas, camada central de API e módulos da aplicação.
- `backend/LifeOS.Api`: endpoints, autenticação, autorização, ProblemDetails, Swagger e health checks.
- `backend/LifeOS.Application`: validações, datas e regras financeiras.
- `backend/LifeOS.Domain`: entidades e enums.
- `backend/LifeOS.Infrastructure`: EF Core, PostgreSQL e migrations.
- `backend/LifeOS.Tests`: testes xUnit.
- `supabase/migrations`: RLS e policies do bucket privado.
- `e2e/`: fluxos críticos Playwright para desktop e mobile.

Integrações externas e o Assistente/IA permanecem deliberadamente desativados, exibindo “Em breve” ou “Em desenvolvimento”. Não existe chamada a LLM.

## Requisitos

- Node.js 22 (consulte `.nvmrc`) e npm.
- .NET SDK 10 LTS.
- PostgreSQL 17 ou projeto Supabase.
- Projeto Supabase com Auth habilitado.

O gerenciador oficial do frontend é npm. O `package-lock.json` é o único lockfile mantido.

## Configuração

Frontend:

```bash
cp .env.example .env.local
```

```env
VITE_API_URL=http://localhost:5080
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=SUA_CHAVE_ANON_PUBLICA
```

Backend: defina as variáveis abaixo no shell, no provedor cloud ou em User Secrets. O ASP.NET Core lê nomes com `__` como seções hierárquicas.

```env
ConnectionStrings__DefaultConnection=
Supabase__Url=
Supabase__JwtIssuer=
Supabase__JwtAudience=authenticated
Supabase__ServiceRoleKey=
Supabase__StorageBucket=documents
Cors__AllowedOrigins__0=http://localhost:5173
```

Use [backend/.env.example](backend/.env.example) como referência. A API não carrega arquivos `.env` por conta própria; exporte as variáveis ou configure-as no host. A chave `service_role` é exclusivamente do backend e nunca deve usar o prefixo `VITE_`.

## Supabase e banco

1. Crie um projeto Supabase e copie URL, anon key e service role key.
2. Configure a connection string PostgreSQL com SSL.
3. Aplique as migrations EF Core:

```bash
dotnet tool install --global dotnet-ef
dotnet ef database update \
  --project backend/LifeOS.Infrastructure \
  --startup-project backend/LifeOS.Api
```

Para criar uma migration futura:

```bash
dotnet ef migrations add NomeDaMigration \
  --project backend/LifeOS.Infrastructure \
  --startup-project backend/LifeOS.Api \
  --output-dir Migrations
```

4. No SQL Editor do Supabase, execute [0002_rls_storage.sql](supabase/migrations/0002_rls_storage.sql). Ele habilita RLS, cria as policies por `auth.uid()` e registra o bucket privado `documents`.

As migrations EF são versionadas no repositório e não são executadas automaticamente na inicialização da API.

## Desenvolvimento local

Terminal 1 — API:

```bash
dotnet run --project backend/LifeOS.Api
```

Terminal 2 — frontend:

```bash
npm ci
npm run dev
```

- Frontend: `http://localhost:5173`
- API: `http://localhost:5080` conforme `launchSettings.json`
- Swagger em desenvolvimento: `http://localhost:5080/swagger`
- Health check: `http://localhost:5080/health`

O `/health` devolve somente o estado agregado da API/banco e responde `503` se o banco estiver indisponível.

## Docker Compose

Para um PostgreSQL local e os dois serviços:

```bash
cp .env.docker.example .env.docker
docker compose --env-file .env.docker up --build
```

Depois aplique as migrations apontando `ConnectionStrings__DefaultConnection` para o PostgreSQL do Compose. O Supabase continua necessário para autenticação e Storage; o container PostgreSQL local é destinado ao desenvolvimento.

Os Dockerfiles são independentes do provedor e podem ser usados em Azure, Render, Railway, Fly.io ou outro host compatível com containers.

## Testes e build

Frontend:

```bash
npm run typecheck
npm test
npm run build
```

Backend:

```bash
dotnet test backend/LifeOS.Tests/LifeOS.Tests.csproj --configuration Release
```

E2E contra um ambiente de teste configurado:

```bash
E2E_BASE_URL=http://localhost:5173 \
E2E_EMAIL=usuario-de-teste@example.com \
E2E_PASSWORD=senha-do-usuario-de-teste \
npm run test:e2e
```

Os E2E são ignorados quando as credenciais não são fornecidas, evitando mutações acidentais em contas reais. A CI executa typecheck, testes, builds, listagem dos cenários Playwright e `git diff --check`.

## Segurança e dados

- O backend valida assinatura, emissor, audiência e validade dos JWTs do Supabase.
- Todo CRUD filtra por `user_id` e valida ownership das relações.
- Valores monetários usam `decimal`/`numeric`, nunca `double`.
- Datas civis permanecem `DateOnly`; timestamps usam UTC; a apresentação usa `America/Sao_Paulo` e `pt-BR`.
- Documentos ficam em Storage privado e são acessados por URLs assinadas temporárias.
- Uploads validam tamanho (20 MB), extensão, MIME e proprietário.
- Erros seguem ProblemDetails e incluem um trace ID, sem expor exceções internas.
- Secrets, tokens e connection strings reais não são versionados.

O servidor é a fonte de verdade. `localStorage` é consultado somente para oferecer a importação opcional do legado `life-os-data-v1`; os dados não são removidos até o usuário validar a importação. Backups JSON são versionados e incluem somente dados estruturados e metadados de documentos, nunca binários.

## Deploy

1. Provisione PostgreSQL/Auth/Storage no Supabase.
2. Aplique migrations EF e o SQL de RLS.
3. Faça deploy de `backend/Dockerfile` com secrets no cofre do provedor.
4. Configure `Cors__AllowedOrigins__0` com a origem HTTPS real do frontend.
5. Faça o build do frontend com as três variáveis `VITE_*` públicas.
6. Publique o frontend estático usando o `Dockerfile` raiz ou qualquer CDN/host SPA.
7. Valide `/health`, autenticação, upload e os E2E em uma conta exclusiva de teste.

O repositório está preparado para deploy, mas não contém credenciais nem comprova que uma instância cloud tenha sido publicada.
