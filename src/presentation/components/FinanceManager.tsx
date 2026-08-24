import { useState } from "react"
import { Plus, Trash2, X } from "lucide-react"
import { nextId, today, useData } from "@/application/state/DataContext"
import { api } from "@/infrastructure/http/apiClient"

type Kind = "account" | "card" | "installment" | "debt" | "budget" | "transfer"
const labels: Record<Kind, string> = {
  account: "Conta",
  card: "Cartão",
  installment: "Compra parcelada",
  debt: "Dívida",
  budget: "Orçamento",
  transfer: "Transferência",
}

export default function FinanceManager() {
  const { data, setData, reload } = useData()
  const [open, setOpen] = useState(false)
  const [kind, setKind] = useState<Kind>("account")
  const [feedback, setFeedback] = useState<string | null>(null)
  const [draft, setDraft] = useState({
    name: "",
    amount: "",
    secondary: "",
    count: "1",
    day: "5",
    date: today(),
    source: "",
    target: "",
  })
  const reset = (next = kind) => {
    setKind(next)
    setDraft({
      name: next === "budget" ? (data.categories[0] ?? "") : "",
      amount: "",
      secondary:
        next === "installment" ? (data.finances.cards[0]?.name ?? "") : "",
      count: "1",
      day: "5",
      date: today(),
      source: data.finances.accounts[0]?.name ?? "",
      target: data.finances.accounts[1]?.name ?? "",
    })
    setFeedback(null)
  }
  const items: any[] =
    kind === "account"
      ? data.finances.accounts
      : kind === "card"
        ? data.finances.cards
        : kind === "installment"
          ? data.finances.installments
          : kind === "debt"
            ? data.finances.debts
            : kind === "budget"
              ? data.finances.budgets
              : []
  const amount = Math.abs(Number(draft.amount.replace(",", "."))) || 0

  const save = async () => {
    if (kind === "transfer") {
      const from = data.finances.accounts.find(
        (item) => item.name === draft.source,
      )?.serverId
      const to = data.finances.accounts.find(
        (item) => item.name === draft.target,
      )?.serverId
      if (!from || !to || from === to || amount <= 0) {
        setFeedback("Selecione contas diferentes e um valor válido.")
        return
      }
      try {
        await api.post("/api/v1/finances/transfers", {
          fromAccountId: from,
          toAccountId: to,
          amount,
          transferDate: draft.date,
          description: draft.name || "Transferência",
        })
        await reload()
        setOpen(false)
      } catch (reason) {
        setFeedback(
          reason instanceof Error ? reason.message : "Falha na transferência.",
        )
      }
      return
    }
    if (!draft.name.trim() || amount <= 0) {
      setFeedback("Preencha nome e valor.")
      return
    }
    setData((current) => {
      const finances: any = structuredClone(current.finances)
      if (kind === "account")
        finances.accounts.push({
          id: nextId(finances.accounts),
          name: draft.name.trim(),
          type: draft.secondary || "Conta corrente",
          initialBalance: amount,
          balance: amount,
          color: "#2563EB",
        })
      if (kind === "card")
        finances.cards.push({
          id: nextId(finances.cards),
          name: draft.name.trim(),
          limit: amount,
          used: 0,
          closing: `${draft.date.slice(0, 8)}${String(Number(draft.day)).padStart(2, "0")}`,
          due: `${draft.date.slice(0, 8)}${String(Math.min(31, Number(draft.day) + 10)).padStart(2, "0")}`,
          color: "#7C3AED",
        })
      if (kind === "installment") {
        const count = Math.max(1, Number(draft.count))
        finances.installments.push({
          id: nextId(finances.installments),
          desc: draft.name.trim(),
          total: amount,
          installment: Math.round((amount / count) * 100) / 100,
          current: 0,
          total_installments: count,
          account: draft.secondary || finances.cards[0]?.name || "",
        })
      }
      if (kind === "debt") {
        const count = Math.max(1, Number(draft.count))
        finances.debts.push({
          id: nextId(finances.debts),
          creditor: draft.name.trim(),
          initial: amount,
          remaining: amount,
          installment: Math.round((amount / count) * 100) / 100,
          installments_left: count,
          end_date: draft.date,
        })
      }
      if (kind === "budget")
        finances.budgets.push({
          id: nextId(
            finances.budgets.map((item: any, index: number) => ({
              id: item.id ?? index + 1,
            })),
          ),
          category: draft.name.trim(),
          limit: amount,
          spent: 0,
        })
      return { ...current, finances }
    })
    setOpen(false)
  }
  const remove = (item: any, index: number) =>
    setData((current) => {
      const finances: any = structuredClone(current.finances)
      const key =
        kind === "account"
          ? "accounts"
          : kind === "card"
            ? "cards"
            : kind === "installment"
              ? "installments"
              : kind === "debt"
                ? "debts"
                : "budgets"
      finances[key] = finances[key].filter(
        (candidate: any, candidateIndex: number) =>
          (candidate.id ?? candidateIndex) !== (item.id ?? index),
      )
      return { ...current, finances }
    })

  return (
    <>
      <button
        onClick={() => {
          setOpen(true)
          reset("account")
        }}
        className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] border border-[var(--border)] rounded-lg bg-white"
      >
        <Plus size={14} /> Operações
      </button>
      {open && (
        <div className="fixed inset-0 z-50 bg-black/35 grid place-items-center p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Operações financeiras"
            className="w-full max-w-2xl bg-white rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between mb-4">
              <h2 className="text-lg font-semibold">Finanças</h2>
              <button aria-label="Fechar" onClick={() => setOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="flex gap-1 overflow-x-auto mb-5">
              {(Object.keys(labels) as Kind[]).map((value) => (
                <button
                  key={value}
                  onClick={() => reset(value)}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs ${
                    kind === value
                      ? "bg-[var(--primary)] text-white"
                      : "bg-[var(--secondary)]"
                  }`}
                >
                  {labels[value]}
                </button>
              ))}
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              {kind !== "transfer" && (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {items.map((item, index) => (
                    <div
                      key={item.id ?? index}
                      className="flex items-center gap-2 p-3 bg-[var(--secondary)] rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {item.name ??
                            item.desc ??
                            item.creditor ??
                            item.category}
                        </p>
                        <p className="text-xs text-[var(--muted-foreground)]">
                          {item.type ?? item.account ?? ""}
                        </p>
                      </div>
                      <button
                        aria-label="Excluir"
                        onClick={() => remove(item, index)}
                        className="text-red-600"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                  {items.length === 0 && (
                    <p className="text-sm text-center text-[var(--muted-foreground)] py-5">
                      Nenhum registro.
                    </p>
                  )}
                </div>
              )}
              <div
                className={`space-y-3 ${
                  kind === "transfer" ? "md:col-span-2 max-w-md" : ""
                }`}
              >
                {kind === "transfer" ? (
                  <>
                    <label className="field-label">
                      Origem
                      <select
                        value={draft.source}
                        onChange={(event) =>
                          setDraft((value) => ({
                            ...value,
                            source: event.target.value,
                          }))
                        }
                        className="field-input"
                      >
                        {data.finances.accounts.map((item) => (
                          <option key={item.id}>{item.name}</option>
                        ))}
                      </select>
                    </label>
                    <label className="field-label">
                      Destino
                      <select
                        value={draft.target}
                        onChange={(event) =>
                          setDraft((value) => ({
                            ...value,
                            target: event.target.value,
                          }))
                        }
                        className="field-input"
                      >
                        {data.finances.accounts.map((item) => (
                          <option key={item.id}>{item.name}</option>
                        ))}
                      </select>
                    </label>
                  </>
                ) : kind === "budget" ? (
                  <label className="field-label">
                    Categoria
                    <select
                      value={draft.name}
                      onChange={(event) =>
                        setDraft((value) => ({
                          ...value,
                          name: event.target.value,
                        }))
                      }
                      className="field-input"
                    >
                      {data.categories.map((category) => (
                        <option key={category}>{category}</option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <label className="field-label">
                    {kind === "debt" ? "Credor" : "Nome"}
                    <input
                      value={draft.name}
                      onChange={(event) =>
                        setDraft((value) => ({
                          ...value,
                          name: event.target.value,
                        }))
                      }
                      className="field-input"
                    />
                  </label>
                )}
                {kind === "account" && (
                  <label className="field-label">
                    Tipo
                    <select
                      value={draft.secondary}
                      onChange={(event) =>
                        setDraft((value) => ({
                          ...value,
                          secondary: event.target.value,
                        }))
                      }
                      className="field-input"
                    >
                      <option>Conta corrente</option>
                      <option>Poupança</option>
                      <option>Dinheiro</option>
                      <option>Investimentos</option>
                      <option>Outros</option>
                    </select>
                  </label>
                )}
                {kind === "installment" && (
                  <label className="field-label">
                    Cartão
                    <select
                      value={draft.secondary}
                      onChange={(event) =>
                        setDraft((value) => ({
                          ...value,
                          secondary: event.target.value,
                        }))
                      }
                      className="field-input"
                    >
                      {data.finances.cards.map((item) => (
                        <option key={item.id}>{item.name}</option>
                      ))}
                    </select>
                  </label>
                )}
                {kind === "card" && (
                  <label className="field-label">
                    Dia de fechamento
                    <input
                      min="1"
                      max="31"
                      type="number"
                      value={draft.day}
                      onChange={(event) =>
                        setDraft((value) => ({
                          ...value,
                          day: event.target.value,
                        }))
                      }
                      className="field-input"
                    />
                  </label>
                )}
                {(kind === "installment" || kind === "debt") && (
                  <label className="field-label">
                    Parcelas
                    <input
                      min="1"
                      max="240"
                      type="number"
                      value={draft.count}
                      onChange={(event) =>
                        setDraft((value) => ({
                          ...value,
                          count: event.target.value,
                        }))
                      }
                      className="field-input"
                    />
                  </label>
                )}
                <label className="field-label">
                  Valor
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={draft.amount}
                    onChange={(event) =>
                      setDraft((value) => ({
                        ...value,
                        amount: event.target.value,
                      }))
                    }
                    className="field-input"
                  />
                </label>
                {(kind === "transfer" || kind === "debt") && (
                  <label className="field-label">
                    Data
                    <input
                      type="date"
                      value={draft.date}
                      onChange={(event) =>
                        setDraft((value) => ({
                          ...value,
                          date: event.target.value,
                        }))
                      }
                      className="field-input"
                    />
                  </label>
                )}
                {feedback && (
                  <p role="alert" className="text-xs text-red-600">
                    {feedback}
                  </p>
                )}
                <button
                  onClick={() => void save()}
                  className="w-full py-2 bg-[var(--primary)] text-white rounded-lg text-sm"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
