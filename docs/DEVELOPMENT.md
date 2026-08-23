# Desenvolvimento

## Preparação

Requisitos: Node.js 22 (`.nvmrc`), npm, .NET SDK 10, projeto Supabase e PostgreSQL acessível pela API.

```bash
cp .env.example .env.local
npm ci
npm run dev
```

Em outro terminal, exporte as variáveis de [backend/.env.example](../backend/.env.example) e execute:

```bash
dotnet run --project backend/LifeOS.Api
```

A API não lê `.env` automaticamente. Use o shell, User Secrets ou a configuração do host.

## Variáveis

| Variável | Processo | Sensível | Finalidade |
| --- | --- | --- | --- |
| `VITE_API_URL` | frontend | Não | origem da API |
| `VITE_SUPABASE_URL` | frontend | Não | URL pública do projeto |
| `VITE_SUPABASE_ANON_KEY` | frontend | Não | chave pública/publishable |
| `ConnectionStrings__DefaultConnection` | API | Sim | conexão PostgreSQL com SSL |
| `Supabase__Url` | API | Não | URL do projeto |
| `Supabase__JwtIssuer` | API | Não | issuer esperado |
| `Supabase__JwtAudience` | API | Não | normalmente `authenticated` |
| `Supabase__ServiceRoleKey` | API | Sim | acesso servidor ao Storage |
| `Supabase__StorageBucket` | API | Não | padrão `documents` |
| `Cors__AllowedOrigins__0` | API | Não | origem exata do frontend |
| `Database__MigrateOnStartup` | API | Não | aplica migrations ao iniciar |

Nunca use `VITE_` em secrets: essas variáveis podem entrar no bundle público.

## Comandos

```bash
npm run typecheck       # TypeScript estrito
npm test                # Vitest e fronteiras arquiteturais
npm run test:watch      # testes em watch
npm run build           # bundle de produção
npm run format          # oxfmt
npm run test:e2e        # Playwright com conta de teste
```

```bash
dotnet build backend/LifeOS.slnx --configuration Release
dotnet test backend/LifeOS.Tests/LifeOS.Tests.csproj --configuration Release
```

## Migrations

```bash
dotnet ef migrations add NomeDaMigration \
  --project backend/LifeOS.Infrastructure \
  --startup-project backend/LifeOS.Api \
  --output-dir Migrations
```

```bash
dotnet ef database update \
  --project backend/LifeOS.Infrastructure \
  --startup-project backend/LifeOS.Api
```

Não edite migrations aplicadas. Crie uma migration corretiva e revise SQL destrutivo.

## Convenções

- Use alias `@/` em imports entre diretórios do frontend.
- Datas civis são `YYYY-MM-DD`; use `shared/datetime`.
- Timestamps são instantes ISO/UTC.
- Declare modelos no domínio e contratos nas portas; não derive tipos de mocks.
- Controllers validam HTTP e ownership; regras reutilizáveis ficam em `Application`.
- Toda entidade pessoal precisa de ownership direto ou verificável e índice apropriado.
- Erros públicos usam ProblemDetails e nunca expõem stack trace ou secrets.

## Checklist de mudança

1. Leia [ARCHITECTURE.md](ARCHITECTURE.md) e escolha a camada correta.
2. Preserve contratos ou documente a quebra.
3. Atualize entidade, migration, API, gateway e UI conforme necessário.
4. Adicione testes de regra e isolamento.
5. Rode typecheck, testes e builds.
6. Atualize documentação e exemplos de ambiente.

`Templates/Figma/` é uma referência protegida e não deve ser alterada no trabalho comum.
