import { expect, test, type Page } from "@playwright/test";

const email = process.env.E2E_EMAIL;
const password = process.env.E2E_PASSWORD;
test.beforeEach(() => test.skip(!email || !password, "Defina E2E_EMAIL e E2E_PASSWORD para executar contra o ambiente Supabase de testes."));

async function login(page: Page) {
  await page.goto("/");
  await page.getByLabel("E-mail").fill(email!);
  await page.getByLabel("Senha").fill(password!);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/dashboard/);
}

test("cadastro/login e dashboard", async ({ page }) => { await login(page); await expect(page.getByRole("heading", { name: /bom dia|boa tarde|boa noite/i })).toBeVisible(); });

test("criar, editar e concluir tarefa", async ({ page }) => {
  await login(page); await page.goto("/tasks"); await page.getByRole("button", { name: /nova tarefa/i }).click();
  const title = `Tarefa E2E ${Date.now()}`; await page.getByPlaceholder("Título da tarefa...").fill(title); await page.getByRole("button", { name: "Adicionar", exact: true }).click();
  await expect(page.getByText(title)).toBeVisible(); await page.getByText(title).locator("..").getByRole("checkbox").check();
});

test("criar transação e refletir no financeiro", async ({ page }) => {
  await login(page); await page.goto("/finances"); await page.getByRole("button", { name: /registrar/i }).click(); await page.getByRole("button", { name: "Despesa" }).click();
  await page.getByLabel("Título").fill(`Despesa E2E ${Date.now()}`); await page.getByLabel("Valor (R$)").fill("12.34"); await page.getByRole("button", { name: "Salvar" }).click();
});

test("criar evento e visualizar agenda", async ({ page }) => { await login(page); await page.goto("/calendar"); await page.getByRole("button", { name: /evento/i }).click(); await page.getByLabel("Título").fill(`Evento E2E ${Date.now()}`); await page.getByRole("button", { name: "Salvar" }).click(); });
test("criar meta e atualizar progresso", async ({ page }) => { await login(page); await page.goto("/goals"); await page.getByRole("button", { name: /nova meta/i }).click(); await page.getByLabel("Título").fill(`Meta E2E ${Date.now()}`); await page.getByLabel("Valor-alvo").fill("100"); await page.getByRole("button", { name: "Salvar" }).click(); });
test("upload, download e exclusão de documento", async ({ page }) => { await login(page); await page.goto("/documents"); await page.getByLabel("Selecionar documentos").setInputFiles({ name: "e2e.txt", mimeType: "text/plain", buffer: Buffer.from("Life OS") }); await expect(page.getByText("Upload concluído.")).toBeVisible(); await page.getByRole("button", { name: /excluir e2e/i }).click(); });
