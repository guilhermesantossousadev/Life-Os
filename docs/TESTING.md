# Testes e aceite

## Objetivo

Validar regras, fronteiras arquiteturais, build e fluxos críticos sem usar contas
reais. A suíte local não substitui o aceite no ambiente integrado com PostgreSQL,
Supabase Auth e Storage.

## Matriz de validação

| Nível | Comando | Cobertura principal | Dependências externas |
| --- | --- | --- | --- |
| TypeScript | `npm run typecheck` | tipos e contratos do frontend | nenhuma |
| Vitest | `npm test` | datas, Auth seguro, Assistente inativo e arquitetura | nenhuma |
| Build web | `npm run build` | bundle de produção e imports | nenhuma |
| .NET | `dotnet test ... --configuration Release` | regras, ownership e segurança | nenhuma |
| Catálogo E2E | `npx playwright test --list` | descoberta desktop/mobile | nenhuma |
| E2E integrado | `npm run test:e2e` | UI, Auth, API, banco e Storage | ambiente e conta de teste |

## Verificação local obrigatória

```bash
npm ci
npm run typecheck
npm test
npm run build
npx playwright test --list
dotnet test backend/LifeOS.Tests/LifeOS.Tests.csproj --configuration Release
git diff --check
```

A CI em `.github/workflows/ci.yml` executa essa base em pushes para `main` e pull
requests. Ela lista os E2E, mas não os executa contra Supabase porque credenciais
não são armazenadas no repositório.

## E2E integrado

Use uma conta exclusiva, sem dados pessoais e criada para o ambiente alvo:

```bash
E2E_BASE_URL=https://<ambiente> \
E2E_EMAIL=<conta-e2e> \
E2E_PASSWORD=<senha> \
npm run test:e2e
```

Sem e-mail ou senha, os testes são ignorados por segurança. A configuração usa um
worker para reduzir conflitos e executa os mesmos seis fluxos em Desktop Chrome e
Pixel 7:

1. login e dashboard;
2. criação, edição e conclusão de tarefa;
3. conta e transação financeira;
4. criação de evento;
5. criação de meta;
6. upload e exclusão de documento.

Apesar do nome histórico do primeiro cenário mencionar cadastro, ele autentica uma
conta já existente. Cadastro, confirmação, recuperação de senha, logout, download
e isolamento entre usuários continuam no checklist manual.

### Efeitos colaterais

Cada execução cria tarefa, conta financeira, transação, evento e meta. O documento
é removido pelo próprio cenário; os demais registros permanecem. Limpe somente a
conta E2E após revisar o resultado e nunca execute a suíte com uma conta pessoal.

Artefatos HTML e traces podem conter nomes gerados, URLs e metadados do ambiente.
Não publique esses arquivos sem revisão e nunca registre JWT, senha ou signed URL.

## Aceite manual de segurança

Use duas contas descartáveis A e B:

1. crie um registro e um documento com A;
2. capture apenas os UUIDs, nunca tokens;
3. autenticado como B, tente consultar, alterar e excluir os recursos de A;
4. confirme `404` ou resposta sem dados e ausência de alteração;
5. confira que uma signed URL expirou no tempo configurado;
6. teste arquivo acima de 20 MB e extensão/MIME não permitidos;
7. confira que logs contêm `traceId`, mas não payload, JWT ou URL assinada.

Teste também refresh direto em rotas internas, recuperação de senha e links de
confirmação, pois dependem dos redirects configurados no Supabase.

## Registro de resultado

Em releases, registre no [plano de implementação](../IMPLEMENTATION_PLAN.md):

- data/hora e fuso;
- commit e URL testados;
- resultado de desktop e mobile;
- resultado do teste de isolamento;
- falhas conhecidas aceitas.

Não congele contagens em documentos conceituais. Quando a suíte mudar, atualize
este guia e o resumo verificável do plano.
