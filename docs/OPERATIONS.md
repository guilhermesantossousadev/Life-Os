# Operação e resposta a incidentes

## Objetivo

Manter o Life OS disponível e recuperável sem expor dados pessoais. Este runbook
complementa o deploy; valores reais, credenciais e contatos devem ficar em um
gerenciador seguro, não no repositório.

## Sinais mínimos

- monitorar `GET /health` externamente;
- acompanhar status de deploy e logs do Render;
- acompanhar saúde, uso, Auth, banco e Storage no Supabase;
- alertar para indisponibilidade persistente, 5xx recorrente, falha de migration,
  aumento de 401/429 e consumo próximo aos limites do plano;
- correlacionar requisições por `traceId`, sem registrar payload pessoal ou token.

O health check confirma API e banco, mas não testa Auth nem Storage. Mantenha um
smoke test separado para login e documento com conta operacional descartável.

## Triagem

| Sintoma | Verificações iniciais | Ação segura |
| --- | --- | --- |
| `/health` retorna 503 | conexão, SSL, limites e logs PostgreSQL | restaurar conectividade; não desabilitar health check |
| aplicação não inicia | primeira exceção e migration nos logs | corrigir configuração ou republicar commit compatível |
| página pede configuração | `VITE_SUPABASE_URL` e anon key no build | corrigir e gerar novo deploy |
| API retorna 401 | URL/issuer, audience e sessão do navegador | corrigir Auth; não afrouxar validação JWT |
| recuperação redireciona errado | Site URL, Redirect URLs e domínio | cadastrar origem exata e retestar link novo |
| upload falha | service role, bucket, MIME, tamanho e rate limit | corrigir configuração/policy; não tornar bucket público |
| rota interna retorna 404 | fallback SPA e imagem utilizada | confirmar `Dockerfile.production` e commit |
| dados incorretos após deploy | commit, migrations e logs correlacionados | interromper novas escritas se houver risco de corrupção |

## Severidade

- **SEV-1:** exposição/perda de dados, acesso cruzado entre usuários ou suspeita de
  credencial comprometida;
- **SEV-2:** aplicação indisponível ou gravações críticas falhando sem alternativa;
- **SEV-3:** função degradada com alternativa e sem risco aparente a dados.

Para SEV-1, preserve evidências, restrinja o acesso necessário, rotacione o material
afetado e não apague logs antes da análise. Não copie dados pessoais para issues.

## Rollback e migrations

1. identifique o último commit saudável e as migrations já aplicadas;
2. verifique se a versão anterior entende o schema atual;
3. use rollback/redeploy do Render apenas quando houver compatibilidade;
4. se não houver, publique uma correção forward-compatible;
5. nunca execute `Down`, remova tabela/coluna ou restaure backup sobre produção sem
   cópia validada e avaliação explícita de perda de dados;
6. após estabilizar, repita health check, smoke test e isolamento.

Um deploy com erro de migration deve falhar fechado. Não marque a migration como
aplicada manualmente sem confirmar que todo o SQL foi executado.

## Backup e restauração

O backup deve cobrir separadamente:

- PostgreSQL: schema, migrations e dados;
- Storage: objetos do bucket privado `documents`;
- configuração: nomes das variáveis, redirects, domínio e policies, sem valores
  secretos no Git.

Defina responsável, frequência, retenção, criptografia e local separado do projeto.
A exportação JSON da tela de configurações é uma conveniência para dados
estruturados; ela não substitui backup do banco e não inclui os binários.

Teste restauração em ambiente isolado periodicamente. Um backup só é considerado
válido depois de restaurar, conferir contagens/integridade e abrir um documento.

## Rotação de credenciais

Em caso de exposição suspeita:

1. identifique o material afetado: senha do banco, service role, sessão/JWT ou conta
   do provedor;
2. revogue/rotacione no provedor;
3. atualize o secret no Render e gere novo deploy quando necessário;
4. encerre sessões ou redefina senha quando o material for de usuário;
5. valide health, Auth, Storage e logs;
6. registre horário, escopo e resultado sem copiar o segredo.

A anon/publishable key é pública por desenho, mas sua substituição ainda exige novo
build do frontend e revisão de RLS/policies.

## Mudanças rotineiras

Antes de publicar:

- CI aprovada no commit exato;
- migration revisada quanto a lock, compatibilidade e rollback;
- exemplos de ambiente e documentação atualizados;
- janela e responsável definidos para mudança de risco alto.

Depois de publicar:

- confirmar commit, `/health` e ausência de 5xx;
- executar smoke test proporcional ao risco;
- observar o ambiente durante a estabilização;
- preencher o registro de aceite no plano.

## Revisões periódicas

- testar restauração de backup;
- revisar membros e acessos ao GitHub, Render e Supabase;
- revisar redirects, CORS, SMTP e domínio;
- atualizar dependências e imagem base com CI completa;
- revisar limites de banco, Storage, banda e suspensão do plano;
- excluir contas e dados E2E antigos de forma controlada.

Referências relacionadas: [Deploy](DEPLOYMENT.md), [Segurança](SECURITY.md),
[Testes](TESTING.md) e [plano de implementação](../IMPLEMENTATION_PLAN.md).
