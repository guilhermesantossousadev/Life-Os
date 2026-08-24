# Segurança

## Fronteiras de confiança

O navegador não é confiável. A UI melhora a experiência, mas autorização e validação relevante são repetidas na API. PostgreSQL e Storage são acessados pelo backend; o cliente Supabase do navegador é usado para Auth.

## Controles implementados

- validação de assinatura, issuer, audience, lifetime e chave do JWT;
- `user_id` derivado do claim `sub`;
- filtros de ownership e validação de relações;
- RLS como defesa adicional;
- bucket privado e URLs assinadas temporárias;
- upload limitado a 20 MB com allowlist de extensão/MIME;
- rate limit por usuário/IP em upload;
- queries parametrizadas pelo EF Core;
- dinheiro em `decimal`/`numeric`;
- ProblemDetails sem detalhes internos;
- correlation ID, logs estruturados e headers de segurança;
- CORS explícito e Swagger apenas em desenvolvimento.

## Secrets

Nunca versione service role key, senha/connection string, JWT, refresh token, credenciais E2E reais ou exportações pessoais.

A anon/publishable key é pública por desenho; a segurança depende de Auth, RLS e policies corretas. A service role ignora RLS e deve existir somente na API/secret store.

## Documentos

- caminhos incluem o UUID do proprietário;
- a API confere ownership antes de assinar/excluir;
- backups JSON incluem metadados, nunca binários;
- nome, MIME e tamanho são validados;
- URLs assinadas não devem aparecer em logs.

## Operação

- use HTTPS;
- configure CORS e redirects com origens exatas;
- mantenha backup antes de armazenar dados importantes;
- rotacione credenciais após suspeita de exposição;
- monitore falhas sem registrar conteúdo pessoal;
- valide isolamento com duas contas antes da liberação.

Não abra issue pública com credenciais ou dados pessoais. Revogue material exposto e comunique o mantenedor por canal privado.

Para triagem, rotação e restauração, siga [OPERATIONS.md](OPERATIONS.md). Para o
teste de isolamento com duas contas, siga [TESTING.md](TESTING.md).
