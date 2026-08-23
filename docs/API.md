# API

## Convenções

- Base local: `http://localhost:5080/api/v1`.
- JSON em `camelCase`; IDs UUID.
- Autenticação: `Authorization: Bearer <JWT do Supabase>`.
- Datas civis: `YYYY-MM-DD`; instantes: ISO 8601/UTC.
- Swagger: somente em `Development`, em `/swagger`.
- Health check público: `GET /health`.

O health check retorna apenas o estado agregado e usa HTTP 503 quando o banco está indisponível.

## Recursos

CRUD padrão (`GET`, `GET /{id}`, `POST`, `PUT /{id}`, `DELETE /{id}`):

- `/tasks`, `/subtasks`, `/inbox`, `/events`, `/goals`, `/goal-actions`, `/projects`, `/notes`;
- `/categories`, `/tags`;
- `/finances/accounts`, `/finances/transactions`, `/finances/cards`, `/finances/installment-purchases`, `/finances/installments`, `/finances/debts`, `/finances/budgets`;
- `/studies/subjects`, `/studies/assignments`, `/studies/courses`, `/studies/topics`;
- `/career/positions`, `/career/goals`, `/career/skills`, `/career/certifications`;
- `/assets`, `/assets/maintenances`.

Também há perfil/preferências, conversão de inbox, transferências, resumo financeiro, faturas, pagamentos, tags, veículo, documentos, `/workspace`, `/search` e `/notifications`. Use o Swagger local para a lista exata de rotas e schemas; os controllers são a fonte de verdade.

## Ownership

Todo endpoint autenticado resolve o usuário pelo claim `sub`. CRUDs filtram por `user_id`, ignoram `user_id` do cliente e validam o dono de cada relação. Recurso inexistente e recurso de outro usuário normalmente retornam o mesmo `404`.

## Erros

Erros seguem Problem Details:

```json
{
  "title": "Validation failed",
  "status": 400,
  "errors": { "title": ["Campo obrigatório."] },
  "traceId": "..."
}
```

- `400`: entrada ou relação inválida;
- `401`: sessão ausente/inválida;
- `404`: recurso não encontrado para o proprietário;
- `429`: limite de upload excedido;
- `500`: erro interno com mensagem pública;
- `503`: banco indisponível no health check.

Informe o `traceId` ao investigar falhas, sem compartilhar JWTs ou secrets.
