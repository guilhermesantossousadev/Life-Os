# Plano de implementação e publicação

Atualizado em 24 de agosto de 2026.

## Objetivo e escopo

Publicar o Life OS em uma URL HTTPS com frontend, API, PostgreSQL, Supabase Auth e
Storage privado. O repositório está preparado para um único serviço Docker no
Render e um projeto Supabase.

Este é o checklist vivo do lançamento. Um item só deve ser marcado como concluído
quando houver evidência verificável no repositório ou no provedor. “Preparado no
código” não significa “aplicado em produção”.

## Resumo executivo

| Frente | Estado | Próxima ação |
| --- | --- | --- |
| Aplicação e arquitetura | Concluída | preservar CI e contratos |
| Testes locais e CI | Concluída | repetir antes do deploy |
| Infraestrutura como código | Concluída | criar o Blueprint |
| Supabase remoto | Não verificado | criar/selecionar o projeto |
| Render remoto | Não verificado | provisionar o serviço |
| Aceite de produção | Pendente | executar smoke test e E2E |
| Rotina operacional | Pendente | definir backup, alertas e responsáveis |

## Evidências do repositório

Validação repetida localmente em 24 de agosto de 2026:

- [x] `npm run typecheck` aprovado;
- [x] 7 testes Vitest aprovados em 4 arquivos;
- [x] `npm run build` aprovado;
- [x] 14 testes .NET aprovados em Release;
- [x] 12 cenários Playwright listados, 6 fluxos em desktop e mobile;
- [x] CI do commit `b38fccc` aprovada no GitHub;
- [x] frontend e API empacotados na mesma imagem/origem em
  `Dockerfile.production`;
- [x] Blueprint Render em `render.yaml`, com health check em `/health`;
- [x] migrations EF com schema, constraints, RLS, policies e bucket privado
  `documents`;
- [x] exemplos de ambiente sem credenciais reais;
- [x] documentação de arquitetura, API, desenvolvimento, segurança, testes,
  deploy e operação.

Os cenários E2E foram apenas catalogados nessa validação: executá-los exige uma
conta exclusiva e um ambiente integrado. As mensagens `NU1900` observadas no teste
.NET vieram da indisponibilidade do índice de vulnerabilidades do NuGet e não de
falha de compilação ou teste.

## Decisões antes do provisionamento

- [ ] Escolher a região do Supabase mais próxima dos usuários e confirmar se a
  região `virginia` do Render continua adequada.
- [ ] Decidir se cadastro exige confirmação por e-mail.
- [ ] Definir quem guarda e pode rotacionar senha do banco e service role key.
- [ ] Definir uma conta E2E exclusiva, sem dados pessoais.
- [ ] Aceitar temporariamente as limitações do plano gratuito ou escolher planos
  com disponibilidade e backup compatíveis com o uso esperado.

## Fase 1 — Configurar o Supabase

- [ ] Criar ou selecionar o projeto `Life OS`.
- [ ] Guardar a senha do banco em um gerenciador de senhas.
- [ ] Obter em configurações do projeto:
  - Project URL;
  - publishable/anon key;
  - service role key;
  - connection string PostgreSQL com SSL e conectividade compatível com o Render,
    preferencialmente pelo pooler quando necessário.
- [ ] Confirmar que Email/Password está habilitado no Auth.
- [ ] Aplicar as três migrations EF, incluindo
  `20260822124000_EnableSupabaseSecurity`.
- [ ] Conferir no banco que RLS está habilitado nas tabelas pessoais.
- [ ] Conferir no Storage que `documents` é privado, limitado a 20 MB e possui as
  quatro policies por proprietário.
- [ ] Não executar `supabase/migrations/0002_rls_storage.sql` depois da migration
  EF; o arquivo é uma alternativa manual de referência para ambientes onde a EF
  não possa executar essa etapa.

Valores exigidos pelo Blueprint:

| Variável | Origem | Exposição |
| --- | --- | --- |
| `ConnectionStrings__DefaultConnection` | connection string do Supabase | secreta, somente API |
| `Supabase__Url` | Project URL | não secreta |
| `Supabase__ServiceRoleKey` | service role key | secreta, somente API |
| `VITE_SUPABASE_URL` | Project URL | pública no bundle |
| `VITE_SUPABASE_ANON_KEY` | publishable/anon key | pública no bundle |

Nunca use a service role key em uma variável `VITE_*`.

## Fase 2 — Provisionar o Render

- [ ] Entrar no Render com acesso ao repositório
  `guilhermesantossousadev/Life-Os`.
- [ ] Criar um Blueprint a partir do `render.yaml` da branch `main`.
- [ ] Conferir serviço `life-os-guilhermesantos`, runtime Docker,
  `Dockerfile.production`, plano/região escolhidos e health check `/health`.
- [ ] Preencher os cinco valores com `sync: false` durante a criação inicial.
- [ ] Confirmar que nenhuma credencial foi escrita em `render.yaml`, logs ou Git.
- [ ] Iniciar o deploy e acompanhar build, migrations e health check até `Live`.
- [ ] Registrar a URL final HTTPS e o commit implantado, sem registrar secrets.

O Render disponibiliza variáveis do serviço Docker como argumentos de build. É por
isso que os dois valores públicos `VITE_*` entram no bundle. Alterá-los exige novo
build/deploy. Em sincronizações posteriores do Blueprint, novos campos com
`sync: false` precisam ser preenchidos manualmente no serviço.

## Fase 3 — Configurar redirects do Auth

Depois que a URL final existir:

- [ ] Definir **Site URL** como a origem HTTPS de produção, sem barra final.
- [ ] Adicionar a origem/rotas necessárias à lista de **Redirect URLs**.
- [ ] Manter localhost somente se ainda for necessário ao desenvolvimento.
- [ ] Adicionar o domínio próprio quando existir e remover origens obsoletas.
- [ ] Evitar curingas amplos em produção quando URLs exatas forem suficientes.
- [ ] Validar os links reais de confirmação e recuperação de senha.

Referências oficiais: [Blueprints do Render](https://render.com/docs/blueprint-spec),
[Docker no Render](https://render.com/docs/docker) e
[Redirect URLs do Supabase](https://supabase.com/docs/guides/auth/redirect-urls).

## Fase 4 — Aceite de produção

Execute com uma conta exclusiva e registre data, commit e resultado conforme
[TESTING.md](docs/TESTING.md).

- [ ] `/health` responde HTTP 200 com `{"status":"healthy"}`.
- [ ] Página inicial carrega sem “Configuração necessária”.
- [ ] Cadastro, confirmação (se habilitada), login, logout e recuperação funcionam.
- [ ] Tarefa pode ser criada, editada, concluída e excluída.
- [ ] Transação atualiza os totais financeiros corretamente.
- [ ] Evento, meta, projeto e nota persistem após novo login.
- [ ] Documento permitido pode ser enviado, baixado e excluído.
- [ ] Arquivo inválido ou maior que 20 MB é rejeitado.
- [ ] Usuário B não acessa registros, relações ou documentos do usuário A.
- [ ] Rotas internas funcionam após refresh direto.
- [ ] Os seis fluxos E2E passam em desktop e mobile.
- [ ] Logs não mostram 5xx recorrente, falha de migration ou erro de autenticação.

```bash
E2E_BASE_URL=https://<servico>.onrender.com \
E2E_EMAIL=<conta-exclusiva-de-teste> \
E2E_PASSWORD=<senha-da-conta-de-teste> \
npm run test:e2e
```

Os E2E criam dados e excluem apenas o documento enviado; limpe os demais registros
da conta de teste depois da execução.

## Fase 5 — Preparar operação

Antes de tratar o ambiente como produção permanente, seguir
[OPERATIONS.md](docs/OPERATIONS.md) e concluir:

- [ ] configurar SMTP próprio para confirmação e recuperação;
- [ ] definir backup, retenção e teste periódico de restauração;
- [ ] configurar monitoramento externo de `/health` e canal de alerta;
- [ ] definir responsável por incidentes e rotação de credenciais;
- [ ] decidir sobre plano sem suspensão por inatividade;
- [ ] configurar domínio próprio e atualizar redirects/CORS;
- [ ] programar revisão de dependências, logs e capacidade;
- [ ] validar exportações periódicas de dados estruturados.

## Bloqueios atuais

O repositório não contém e não deve conter evidência de credenciais ou acesso aos
painéis. Permanecem não verificados: existência do projeto Supabase, aplicação das
migrations no ambiente remoto, serviço Render, redirects e aceite ponta a ponta.
Essas etapas exigem sessões autenticadas nos provedores.

## Definição de pronto

O lançamento termina somente quando:

1. o commit aprovado está `Live` em HTTPS;
2. health check e migrations estão saudáveis;
3. Auth e persistência sobrevivem a um novo login;
4. documentos privados funcionam do upload à exclusão;
5. isolamento entre duas contas está comprovado;
6. E2E críticos passam em desktop e mobile;
7. não há erros recorrentes nos logs;
8. backup, monitoramento, rollback e responsáveis estão definidos;
9. a evidência do aceite abaixo foi preenchida.

## Registro de aceite

Preencher sem dados pessoais ou segredos:

| Campo | Valor |
| --- | --- |
| Data/hora e fuso | Pendente |
| URL de produção | Pendente |
| Commit implantado | Pendente |
| Responsável pelo aceite | Pendente |
| Health check | Pendente |
| E2E desktop/mobile | Pendente |
| Isolamento entre usuários | Pendente |
| Backup/restauração | Pendente |
| Pendências aceitas | Pendente |
