import { expect, test, type Page } from "@playwright/test"

const email = process.env.E2E_EMAIL
const password = process.env.E2E_PASSWORD

test.beforeEach(() => {
  test.skip(
    !email || !password,
    "Defina E2E_EMAIL e E2E_PASSWORD para executar contra o ambiente Supabase de testes.",
  )
})

async function waitForApp(page: Page, heading: string | RegExp) {
  await expect(
    page.getByRole("heading", { name: heading, level: 1 }),
  ).toBeVisible({ timeout: 30_000 })
}

async function login(page: Page) {
  await page.goto("/")
  await page.getByLabel("E-mail").fill(email!)
  await page.getByLabel("Senha").fill(password!)
  await page.getByRole("button", { name: "Entrar" }).click()
  await expect(page).toHaveURL(/dashboard/, { timeout: 30_000 })
  await waitForApp(page, /bom dia|boa tarde|boa noite/i)
}

async function expectSuccessfulWrite(
  page: Page,
  path: RegExp,
  action: () => Promise<unknown>,
) {
  const responsePromise = page.waitForResponse(
    (response) =>
      path.test(new URL(response.url()).pathname) &&
      ["POST", "PUT", "PATCH", "DELETE"].includes(response.request().method()),
    { timeout: 30_000 },
  )
  await action()
  const response = await responsePromise
  expect(
    response.ok(),
    `${response.request().method()} ${response.url()} retornou ${response.status()}`,
  ).toBeTruthy()
}

test("cadastro/login e dashboard", async ({ page }) => {
  await login(page)
  await expect(
    page.getByText(/visão geral|tarefas de hoje/i).first(),
  ).toBeVisible()
})

test("criar, editar e concluir tarefa", async ({ page }) => {
  await login(page)
  await page.goto("/tasks")
  await waitForApp(page, "Tarefas")
  await page.getByRole("button", { name: /nova tarefa/i }).click()

  const title = `Tarefa E2E ${Date.now()}`
  const editedTitle = `${title} editada`
  const quickAdd = page.getByPlaceholder("Título da tarefa...").locator("..")
  await quickAdd.getByPlaceholder("Título da tarefa...").fill(title)
  await expectSuccessfulWrite(page, /\/api\/v1\/tasks$/, () =>
    quickAdd.getByRole("button", { name: "Adicionar", exact: true }).click(),
  )

  let checkbox = page.getByRole("checkbox", {
    name: `Concluir tarefa ${title}`,
  })
  await expect(checkbox).toBeVisible()
  await checkbox
    .locator("..")
    .getByRole("button", { name: "Editar tarefa" })
    .click()
  await expectSuccessfulWrite(page, /\/api\/v1\/tasks\//, async () => {
    await page.getByLabel("Título").fill(editedTitle)
    await page.getByRole("button", { name: "Concluir edição" }).click()
  })

  checkbox = page.getByRole("checkbox", {
    name: `Concluir tarefa ${editedTitle}`,
  })
  await expectSuccessfulWrite(page, /\/api\/v1\/tasks\//, () =>
    checkbox.click(),
  )
  await expect(page.getByText(editedTitle)).toBeHidden()
})

test("criar transação e refletir no financeiro", async ({ page }) => {
  await login(page)
  await page.goto("/finances")
  await waitForApp(page, "Finanças")

  const accountName = `Conta E2E ${Date.now()}`
  await page.getByRole("button", { name: "Operações" }).click()
  const manager = page.getByRole("dialog", { name: "Operações financeiras" })
  await manager.getByLabel("Nome").fill(accountName)
  await manager.getByLabel("Valor").fill("100")
  await expectSuccessfulWrite(page, /\/api\/v1\/finances\/accounts$/, () =>
    manager.getByRole("button", { name: "Salvar" }).click(),
  )

  const expenseTitle = `Despesa E2E ${Date.now()}`
  await page.getByRole("button", { name: "Registrar" }).click()
  const expenseDialog = page.getByRole("dialog")
  await expect(
    expenseDialog.getByRole("heading", { name: "Nova despesa" }),
  ).toBeVisible()
  await expenseDialog.getByLabel("Título").fill(expenseTitle)
  await expenseDialog.getByLabel("Valor (R$)").fill("12.34")
  await expenseDialog.getByLabel("Conta").selectOption({ label: accountName })
  await expectSuccessfulWrite(page, /\/api\/v1\/finances\/transactions$/, () =>
    expenseDialog.getByRole("button", { name: "Salvar" }).click(),
  )

  await page.getByRole("button", { name: "Transações" }).click()
  await expect(page.getByText(expenseTitle)).toBeVisible()
})

test("criar evento e visualizar agenda", async ({ page }) => {
  await login(page)
  await page.goto("/calendar")
  await waitForApp(page, "Agenda")
  await page.getByRole("button", { name: /evento/i }).click()
  const title = `Evento E2E ${Date.now()}`
  const dialog = page.getByRole("dialog")
  await dialog.getByLabel("Título").fill(title)
  await expectSuccessfulWrite(page, /\/api\/v1\/events$/, () =>
    dialog.getByRole("button", { name: "Salvar" }).click(),
  )
  await expect(page.getByText(title)).toBeVisible()
})

test("criar meta e atualizar progresso", async ({ page }) => {
  await login(page)
  await page.goto("/goals")
  await waitForApp(page, "Metas")
  await page.getByRole("button", { name: /nova meta/i }).click()
  const title = `Meta E2E ${Date.now()}`
  const dialog = page.getByRole("dialog")
  await dialog.getByLabel("Título").fill(title)
  await dialog.getByLabel("Valor-alvo").fill("100")
  await expectSuccessfulWrite(page, /\/api\/v1\/goals$/, () =>
    dialog.getByRole("button", { name: "Salvar" }).click(),
  )
  await expect(page.getByText(title)).toBeVisible()
})

test("upload, download e exclusão de documento", async ({ page }) => {
  await login(page)
  await page.goto("/documents")
  await waitForApp(page, "Documentos")
  const filename = `e2e-${Date.now()}.txt`

  await expectSuccessfulWrite(page, /\/api\/v1\/documents$/, () =>
    page.getByLabel("Selecionar documentos").setInputFiles({
      name: filename,
      mimeType: "text/plain",
      buffer: Buffer.from("Life OS"),
    }),
  )
  await expect(page.getByRole("status")).toHaveText("Upload concluído.")
  await expect(
    page.getByText(filename.replace(/\.txt$/, ""), { exact: true }),
  ).toBeVisible()

  await expectSuccessfulWrite(page, /\/api\/v1\/documents\//, () =>
    page
      .getByRole("button", {
        name: new RegExp(`excluir ${filename.replace(/\.txt$/, "")}`, "i"),
      })
      .click(),
  )
  await expect(page.getByRole("status")).toHaveText("Documento excluído.")
})
