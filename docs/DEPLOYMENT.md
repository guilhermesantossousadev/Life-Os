# Deploy

## Topologia recomendada

[Dockerfile.production](../Dockerfile.production) compila frontend e API e publica ambos na mesma origem. [render.yaml](../render.yaml) descreve o serviço Render; Supabase fornece PostgreSQL, Auth e Storage.

Variáveis obrigatórias:

- `ConnectionStrings__DefaultConnection`;
- `Supabase__Url`;
- `Supabase__ServiceRoleKey`;
- `VITE_SUPABASE_URL`;
- `VITE_SUPABASE_ANON_KEY`.

O Blueprint já define audience, bucket e migrations na inicialização.

## Sequência

1. Crie/selecione o projeto Supabase e habilite Email/Password.
2. Obtenha URL, anon/publishable key, service role e connection string com SSL.
3. Crie o Blueprint Render usando `render.yaml` e configure secrets no painel.
4. Aguarde build, migrations e health check.
5. Cadastre a URL HTTPS como Site URL e Redirect URL no Supabase Auth.
6. Execute smoke test e E2E com conta exclusiva.

## Verificação

- `/health` responde 200 e `{"status":"healthy"}`;
- Auth e recuperação funcionam;
- dados persistem após novo login;
- documentos podem ser enviados, baixados e excluídos;
- usuário B não acessa dados do usuário A;
- rotas internas carregam após refresh;
- não há 5xx recorrente.

## Rollback

Republique um commit validado. Não reverta migrations destrutivamente sem backup. Quando a migration não for compatível com a versão anterior, prefira correção forward-compatible.

Use `/health` para disponibilidade e `traceId` para correlacionar erros. Não registre payloads pessoais, JWTs, signed URLs ou secrets.

O checklist detalhado está em [IMPLEMENTATION_PLAN.md](../IMPLEMENTATION_PLAN.md).
