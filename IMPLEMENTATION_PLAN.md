# Plano de implementação e publicação

Atualizado em 22 de agosto de 2026.

## Objetivo

Colocar o Life OS em funcionamento em uma URL HTTPS, com frontend, API, banco,
autenticação e documentos privados. O caminho preparado usa um serviço Docker no
Render e um projeto Supabase para PostgreSQL, Auth e Storage.

## Estado atual

- [x] Frontend React/Vite compilando para produção.
- [x] API ASP.NET Core compilando em Release.
- [x] 4 testes do frontend e 14 testes do backend aprovados.
- [x] 12 cenários E2E catalogados para desktop e mobile.
- [x] Frontend e API configurados para a mesma origem HTTPS.
- [x] Imagem conjunta definida em `Dockerfile.production`.
- [x] Blueprint gratuito definido em `render.yaml`.
- [x] Migrations automatizadas na inicialização de produção.
- [x] RLS, policies e bucket privado `documents` incluídos nas migrations.
- [x] Configuração publicada na branch `main`, commit `000c0f7`.
- [x] CI do commit aprovada no GitHub.
- [ ] Projeto Supabase criado ou selecionado.
- [ ] Serviço Render provisionado.
- [ ] Secrets de produção configurados.
- [ ] URLs de autenticação configuradas no Supabase.
- [ ] Ambiente publicado validado ponta a ponta.

## Pré-requisitos para retomar

1. Conectar um navegador em **Settings > Computer use**.
2. Entrar no [Supabase Dashboard](https://supabase.com/dashboard).
3. Entrar no [Render Dashboard](https://dashboard.render.com).
4. Conectar ao Render a conta GitHub que tem acesso ao repositório
   `guilhermesantossousadev/Life-Os`.
5. Não enviar senhas, tokens ou chaves pelo chat e nunca adicioná-los ao Git.

## Fase 1 — Supabase

- [ ] Criar um projeto chamado `Life OS`, preferencialmente em uma região próxima
  dos usuários.
- [ ] Manter o projeto no plano gratuito inicialmente, salvo decisão explícita de
  contratar um plano pago.
- [ ] Guardar a senha do banco em um gerenciador de senhas.
- [ ] Em **Project Settings > API**, obter:
  - Project URL;
  - publishable/anon key;
  - service role key.
- [ ] Em **Project Settings > Database**, copiar uma connection string compatível
  com IPv4, preferencialmente do Transaction Pooler, com SSL habilitado.
- [ ] Confirmar que Email/Password está habilitado em **Authentication > Providers**.
- [ ] Decidir se novos cadastros exigirão confirmação por e-mail.

Valores que serão usados no Render:

| Variável | Origem | Sensível |
| --- | --- | --- |
| `ConnectionStrings__DefaultConnection` | Connection string do banco Supabase | Sim |
| `Supabase__Url` | Project URL | Não |
| `Supabase__ServiceRoleKey` | Service role key | Sim |
| `VITE_SUPABASE_URL` | Mesmo Project URL | Não |
| `VITE_SUPABASE_ANON_KEY` | Publishable/anon key | Pública no frontend |

## Fase 2 — Render

- [ ] No Render, criar um novo **Blueprint** a partir do repositório
  `https://github.com/guilhermesantossousadev/Life-Os`.
- [ ] Confirmar que o Render encontrou `render.yaml` na raiz.
- [ ] Conferir antes de provisionar:
  - serviço `life-os-guilhermesantos`;
  - runtime Docker;
  - `Dockerfile.production`;
  - região Virginia;
  - plano Free;
  - health check `/health`.
- [ ] Preencher os cinco valores solicitados pelo Blueprint usando os valores da
  Fase 1.
- [ ] Iniciar o deploy e acompanhar o build até o serviço ficar `Live`.
- [ ] Confirmar nos logs que todas as migrations foram aplicadas.
- [ ] Guardar a URL final `https://<servico>.onrender.com`.

O primeiro início pode demorar porque o container compila o frontend e a API e
aplica as migrations. Em instâncias gratuitas, novos acessos também podem aguardar
o serviço sair do estado de suspensão.

## Fase 3 — URLs de autenticação

Depois que a URL final do Render existir:

- [ ] Abrir **Supabase > Authentication > URL Configuration**.
- [ ] Definir **Site URL** como a URL HTTPS do Render, sem barra final.
- [ ] Adicionar a mesma origem em **Redirect URLs**.
- [ ] Se um domínio próprio for configurado, adicionar também a URL HTTPS dele.
- [ ] Nunca permitir curingas amplos em produção quando a URL exata estiver
  disponível.

## Fase 4 — Validação do ambiente publicado

- [ ] Abrir `https://<servico>.onrender.com/health` e confirmar HTTP 200 com
  `{"status":"healthy"}`.
- [ ] Abrir a página inicial e confirmar que não aparece “Configuração necessária”.
- [ ] Criar uma conta exclusiva de teste.
- [ ] Confirmar cadastro, login, logout e recuperação de senha.
- [ ] Criar, editar, concluir e excluir uma tarefa.
- [ ] Criar uma transação financeira e conferir os totais.
- [ ] Criar evento, meta, projeto e nota.
- [ ] Enviar, baixar e excluir um documento permitido.
- [ ] Confirmar que outro usuário não consegue acessar dados ou documentos da conta
  de teste.
- [ ] Repetir os fluxos principais em uma viewport móvel.
- [ ] Inspecionar os logs do Render e do Supabase procurando erros 5xx ou falhas de
  autenticação.

Para executar a suíte E2E sem guardar credenciais no repositório:

```bash
E2E_BASE_URL=https://<servico>.onrender.com \
E2E_EMAIL=<conta-exclusiva-de-teste> \
E2E_PASSWORD=<senha-da-conta-de-teste> \
npm run test:e2e
```

## Fase 5 — Operação e segurança

Estas ações não bloqueiam o primeiro acesso, mas devem ser avaliadas antes de
tratar o sistema como produção permanente:

- [ ] Configurar SMTP próprio no Supabase para e-mails de confirmação e recuperação.
- [ ] Definir política de backup; o plano gratuito não deve ser a única cópia de
  dados importantes.
- [ ] Decidir se o serviço Render deve sair do plano gratuito para evitar suspensão
  por inatividade.
- [ ] Configurar domínio próprio e atualizar as URLs do Supabase.
- [ ] Configurar monitoramento externo para `/health`.
- [ ] Revisar logs periodicamente sem registrar tokens ou dados pessoais.
- [ ] Rotacionar service role key e senha do banco se houver suspeita de exposição.
- [ ] Manter dependências e imagens Docker atualizadas.
- [ ] Criar exportações periódicas dos dados estruturados pela tela de configurações.

## Diagnóstico rápido

| Sintoma | Verificação inicial |
| --- | --- |
| `/health` retorna 503 | Connection string, disponibilidade e logs do PostgreSQL |
| Loop de redirecionamento HTTPS | `ASPNETCORE_FORWARDEDHEADERS_ENABLED=true` no Render |
| Login falha | Project URL, anon key, provider Email e URLs de Auth |
| API retorna 401 | Emissor/audiência do JWT e sessão Supabase do navegador |
| Upload falha | Service role key, migration de Storage, MIME e limite de 20 MB |
| Página mostra configuração necessária | `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` no build |
| Rota interna retorna 404 | Confirmar que o deploy usa `Dockerfile.production` |

## Recuperação e rollback

- Um deploy com falha não deve substituir o último deploy saudável no Render.
- Para voltar o código, usar o recurso de rollback/redeploy do Render apontando para
  um commit previamente aprovado; não reverter migrations destrutivamente sem um
  backup validado.
- Antes de alterar banco, Auth ou Storage após o lançamento, gerar um backup e
  revisar o impacto em dados existentes.

## Definição de pronto

O lançamento estará concluído quando:

1. o deploy estiver `Live` em HTTPS;
2. `/health` estiver saudável;
3. cadastro/login funcionarem;
4. dados persistirem após novo login;
5. upload, download e exclusão de documentos funcionarem;
6. isolamento entre dois usuários estiver confirmado;
7. testes E2E críticos passarem em desktop e mobile;
8. não houver erro recorrente nos logs do Render ou Supabase.
