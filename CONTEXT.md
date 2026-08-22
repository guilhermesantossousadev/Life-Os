# CONTEXT.md — Life OS

**Versão:** 2.0.0

**Data de referência:** 2026-08-22

**Idioma:** `pt-BR`

**Fuso principal:** `America/Sao_Paulo`
**Status:** implementação full-stack presente no repositório; implantação cloud não verificada

## 1. Autoridade e limites

Este arquivo descreve o estado real do Life OS e deve ser lido antes de qualquer alteração. A ordem de verdade é: código executável, migrations/configuração, testes, este documento, README e, por último, a referência visual `Templates/Figma/`.

`Templates/Figma/` é intocável sem autorização explícita. Ela não participa do build raiz e permaneceu sem alterações durante a implementação 2.0.

Nunca registre neste arquivo secrets, tokens, connection strings reais ou dados pessoais. “Implementado” significa presente no código; não significa que Supabase ou produção já estejam provisionados.

## 2. Arquitetura vigente

```text
Navegador
└── React 19 + Vite 8 + TypeScript + Tailwind 4
    ├── React Router e rotas protegidas
    ├── Supabase Auth (sessão no cliente)
    └── camada central src/services
         │ Bearer JWT
         ▼
ASP.NET Core 10 Web API
├── API: endpoints, JWT, ownership, ProblemDetails e middleware
├── Application: validação, fuso e regras financeiras
├── Domain: entidades normalizadas
└── Infrastructure: EF Core 10 + Npgsql + migrations
         │
         ▼
Supabase
├── PostgreSQL
├── Auth
└── Storage privado
```

O frontend não acessa PostgreSQL diretamente. As exceções são o cliente oficial do Supabase para autenticação; operações de arquivos pessoais passam pela API, que usa a service role apenas no servidor.

## 3. Estrutura do repositório

```text
src/                              frontend vigente
backend/LifeOS.Api/               API, auth, controllers, storage
backend/LifeOS.Application/       regras de aplicação
backend/LifeOS.Domain/            entidades
backend/LifeOS.Infrastructure/    DbContext e migrations
backend/LifeOS.Tests/             testes xUnit
supabase/migrations/              RLS e Storage policies
e2e/                              testes Playwright
.github/workflows/ci.yml          CI frontend/backend
Templates/Figma/                  referência visual preservada
```

O gerenciador de pacotes canônico é npm; `package-lock.json` é o único lockfile. Node 22 está fixado em `.nvmrc`. O backend usa .NET 10 LTS e PostgreSQL 17 no Compose.

## 4. Dados e segurança

- IDs das entidades são UUIDs.
- Toda entidade pessoal possui `user_id` direto ou ownership derivado e validado.
- O controller CRUD base sempre sobrescreve `user_id` recebido pelo cliente e filtra leituras/alterações pelo `sub` autenticado.
- Foreign keys de usuário são validadas antes da persistência.
- EF Core usa queries parametrizadas, FKs, índices, limites e check constraints.
- Valores financeiros usam `decimal` no .NET e `numeric` no PostgreSQL.
- Senhas permanecem exclusivamente no Supabase Auth.
- A API exige JWT Supabase e valida issuer, audience, lifetime e signing key.
- RLS e policies de Storage estão em `supabase/migrations/0002_rls_storage.sql` e precisam ser aplicadas no projeto Supabase.
- O bucket `documents` é privado; acesso é por URL assinada de curta duração.
- Upload máximo é 20 MB e possui allowlist de extensão/MIME.
- A API adiciona correlation ID, headers de segurança, CORS configurável, rate limit de upload e logs JSON sem conteúdo pessoal intencional.
- Swagger é exposto somente em Development. `/health` é público e não expõe detalhes do banco.

## 5. Modelo persistente

As migrations EF atuais são:

- `20260822013952_InitialCreate`
- `20260822020555_AddLengthConstraints`

O modelo contém perfis, preferências, categorias, tags, tarefas/subtarefas, inbox, eventos, metas/ações, projetos, notas, contas, movimentos, transferências, cartões, compras parceladas/parcelas, dívidas, orçamentos, disciplinas, atividades, cursos, tópicos, posições, objetivos de carreira, competências, certificações, patrimônios, veículos, manutenções e documentos. Relações de tags são normalizadas.

Não existe tabela `AppData`. O servidor é a fonte de verdade e o endpoint `/api/v1/workspace` devolve um agregado de leitura construído das tabelas normalizadas.

## 6. Estado funcional

### Autenticação e perfil

Cadastro, login, recuperação de senha, recuperação de sessão, logout, proteção de rotas e usuário atual usam Supabase Auth. O perfil permite nome, e-mail pelo fluxo permitido do Supabase e avatar privado. Preferências persistem tema, formato de data, primeira página, fuso e opções de notificação. O tema “sistema” reage a alterações do sistema operacional.

### Organização pessoal

- Tarefas: criação, edição, conclusão/reabertura, exclusão, busca, filtros Hoje/Próximas/Todas/Concluídas, categoria, projeto, prioridade e subtarefas ordenadas.
- Inbox: criação rápida, edição, exclusão, arquivamento/restauração e conversão transacional em tarefa, evento, nota, meta ou projeto.
- Agenda: criação, edição, exclusão, seleção e visualizações dia/semana/mês baseadas no relógio real.
- Metas: CRUD, progresso validado/normalizado, sobreprogresso visível e ações associadas.
- Projetos: CRUD, estados planejar/pausar/retomar/concluir, tags e progresso derivado das tarefas.
- Notas: CRUD, favoritos, busca, categoria, tags, Markdown e autosave com debounce/estado visual.

### Finanças

- Contas usam saldo canônico `saldo inicial + movimentos`.
- Transações distinguem `income`, `expense` e `transfer`; valores são armazenados positivos com tipo explícito.
- Transferências geram movimentos vinculados em transação e não entram como receita/despesa nos relatórios.
- Cartões calculam uso, disponível e faturas por competência.
- Compras parceladas geram parcelas com divisão decimal exata; parcelas podem ser pagas ou quitadas sem reescrever o histórico.
- Dívidas aceitam registro de pagamento e quitação.
- Orçamentos calculam gasto pelo mês/ano e transações reais.
- Dashboard financeiro filtra o mês civil atual.

### Vida e plataforma

- Estudos: CRUD de disciplinas, atividades, cursos e tópicos; urgência usa a data real.
- Carreira: CRUD de posições, trajetória, competências e certificações.
- Patrimônio: CRUD de bens, dados específicos de veículo e manutenções; não usa `prompt`, `alert` ou `confirm`.
- Documentos: upload, listagem, pesquisa, renomeação, categoria, tags, URL assinada/download e exclusão no Storage privado.
- Dashboard, notificações internas, criação rápida e busca global usam dados reais. A busca retorna IDs e abre a rota do item.
- Backup exporta JSON versionado sem binários. A migração `life-os-data-v1` é opcional, solicita consentimento e preserva a cópia local até confirmação do usuário.

### Fora de escopo deliberado

- Google Calendar, Drive, Gmail, Notion, Open Finance e demais integrações externas exibem “Em breve” e não simulam conexão.
- Assistente/IA exibe “Em desenvolvimento”; não existe endpoint de chat, SDK OpenAI, LLM ou resposta simulada.

## 7. API

Os recursos ficam sob `/api/v1`: `tasks`, `subtasks`, `inbox`, `events`, `goals`, `goal-actions`, `projects`, `notes`, `categories`, `tags`, `profile`, `preferences`, `finances/*`, `studies/*`, `career/*`, `assets`, `documents`, `workspace`, `search` e `notifications`.

Endpoints CRUD aceitam GET/POST/PUT/DELETE. Operações específicas incluem arquivar/restaurar/converter inbox, transferir entre contas, resumo financeiro, faturas, pagar/quitar dívida e parcela, relações de tags, dados de veículo, upload/download e URLs assinadas. Falhas seguem `ProblemDetails`/`HttpValidationProblemDetails`.

## 8. Datas e fuso

- Data civil sem hora: `DateOnly` no backend e string `YYYY-MM-DD` no frontend.
- Instantes: `DateTimeOffset`, persistidos em UTC.
- Conversões locais: helpers centralizados em `src/lib/dates.ts` e `LifeClock`.
- Datas civis não são construídas por `new Date("YYYY-MM-DD")`.
- Interface: `pt-BR`; fuso: `America/Sao_Paulo`.

## 9. Execução e validação

Consulte `README.md` para variáveis, Supabase, migrations, Docker e deploy.

Validações executadas em 2026-08-22:

- `npm run typecheck`: aprovado.
- `npm test`: 3 arquivos, 4 testes aprovados.
- `npm run build`: aprovado.
- `dotnet test backend/LifeOS.Tests/LifeOS.Tests.csproj --configuration Release`: 14 testes aprovados.
- `npx playwright test --list`: 12 cenários reconhecidos (6 fluxos em desktop e mobile).
- `/health` com banco deliberadamente indisponível: respondeu `503` e payload seguro, como esperado.
- `docker compose config`: não executado porque o binário Docker não está instalado no ambiente desta sessão.

Os E2E não foram executados ponta a ponta porque exigem um projeto Supabase e uma conta de teste configurados. A inspeção visual interativa também não foi concluída porque o navegador embutido não estava disponível nesta sessão. Portanto, o código está compilado/testado no escopo acima, mas o funcionamento cloud e a QA visual final devem ser validados depois do provisionamento.

## 10. Deploy e estado operacional

Existem Dockerfiles para frontend/API, `docker-compose.yml`, exemplos de ambiente e GitHub Actions. O desenho é portável e não hospeda ASP.NET artificialmente no Supabase.

Não há secrets reais versionados. Não há evidência, neste repositório, de que migrations/RLS tenham sido aplicadas em Supabase ou de que frontend/API estejam publicados. O checklist operacional restante é: provisionar Supabase, aplicar migrations, configurar secrets/CORS/URLs HTTPS, publicar os containers e executar os E2E/QA visual contra o ambiente implantado.
