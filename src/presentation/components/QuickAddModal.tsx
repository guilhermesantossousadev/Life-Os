import { useRef, useState, type FormEvent } from "react"
import {
  Calendar,
  CheckSquare,
  FileText,
  FolderKanban,
  Target,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react"
import { nextId, today, useData } from "@/application/state/DataContext"
import { useFocusTrap } from "@/presentation/hooks/useFocusTrap"

export type AddType = "task" | "event" | "expense" | "income" | "note" | "goal" | "project"
export const openQuickAdd = (type: AddType) =>
  window.dispatchEvent(new CustomEvent<AddType>("lifeos:add", { detail: type }))

interface Props {
  onClose: () => void
  onSuccess: (type: string) => void
  initialType?: AddType | null
}

const options = [
  { id: "task" as const, label: "Tarefa", icon: CheckSquare, color: "#2563EB" },
  { id: "event" as const, label: "Evento", icon: Calendar, color: "#059669" },
  {
    id: "expense" as const,
    label: "Despesa",
    icon: TrendingDown,
    color: "#EF4444",
  },
  {
    id: "income" as const,
    label: "Receita",
    icon: TrendingUp,
    color: "#059669",
  },
  { id: "note" as const, label: "Nota", icon: FileText, color: "#D97706" },
  { id: "goal" as const, label: "Meta", icon: Target, color: "#7C3AED" },
  {
    id: "project" as const,
    label: "Projeto",
    icon: FolderKanban,
    color: "#6366F1",
  },
]

const labels: Record<AddType, string> = Object.fromEntries(
  options.map((option) => [option.id, option.label]),
) as Record<AddType, string>

export default function QuickAddModal({
  onClose,
  onSuccess,
  initialType = null,
}: Props) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const { data, setData } = useData()
  const [type, setType] = useState<AddType | null>(initialType)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState(today())
  const [time, setTime] = useState("09:00")
  const [endTime, setEndTime] = useState("10:00")
  const [category, setCategory] = useState("Pessoal")
  const [amount, setAmount] = useState("")
  const [target, setTarget] = useState("")
  const [account, setAccount] = useState(data.finances.accounts[0]?.name ?? "")

  useFocusTrap(dialogRef, onClose)

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!type || !title.trim()) return
    setData((current) => {
      if (type === "task")
        return {
          ...current,
          tasks: [
            ...current.tasks,
            {
              id: nextId(current.tasks),
              title: title.trim(),
              done: false,
              priority: "normal",
              category,
              date,
              project: null,
            },
          ],
        }
      if (type === "event")
        return {
          ...current,
          events: [
            ...current.events,
            {
              id: nextId(current.events),
              title: title.trim(),
              date,
              time,
              endTime,
              category,
              local: description.trim() || "Não informado",
            },
          ],
        }
      if (type === "note")
        return {
          ...current,
          notes: [
            {
              id: nextId(current.notes),
              title: title.trim(),
              content: description,
              category,
              tags: [],
              favorite: false,
              updated: today(),
            },
            ...current.notes,
          ],
        }
      if (type === "goal")
        return {
          ...current,
          goals: [
            ...current.goals,
            {
              id: nextId(current.goals),
              title: title.trim(),
              category,
              target: Number(target) || 100,
              current: 0,
              unit: category === "Financeira" ? "BRL" : "%",
              deadline: date,
              description,
              actions: [],
            },
          ],
        }
      if (type === "project")
        return {
          ...current,
          projects: [
            ...current.projects,
            {
              id: nextId(current.projects),
              name: title.trim(),
              description,
              status: "Planejado",
              progress: 0,
              deadline: date,
              tasks: [],
              tags: [],
            },
          ],
        }
      const value = Math.abs(Number(amount.replace(",", "."))) || 0
      const transaction = {
        id: nextId(current.finances.transactions),
        desc: title.trim(),
        category: type === "income" ? "Receita" : category,
        date,
        value: type === "income" ? value : -value,
        type: type === "income" ? "receita" : "despesa",
        account,
      }
      return {
        ...current,
        finances: {
          ...current.finances,
          transactions: [transaction, ...current.finances.transactions],
        },
      }
    })
    onSuccess(labels[type])
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="absolute inset-0 bg-black/25 backdrop-blur-[1px]" />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-add-title"
        tabIndex={-1}
        className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-[var(--border)] overflow-hidden"
        style={{ fontFamily: "var(--font-ui)" }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
          <div>
            <h2
              id="quick-add-title"
              className="font-semibold text-[15px] text-[var(--foreground)]"
            >
              {type ? `Nova ${labels[type].toLowerCase()}` : "Adicionar"}
            </h2>
            {type && (
              <button
                type="button"
                onClick={() => setType(null)}
                className="text-[11px] text-[var(--primary)] mt-0.5"
              >
                Trocar tipo
              </button>
            )}
          </div>
          <button
            aria-label="Fechar"
            onClick={onClose}
            className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          >
            <X size={16} />
          </button>
        </div>

        {!type ? (
          <div className="p-4 grid grid-cols-2 gap-2">
            {options.map((option) => {
              const Icon = option.icon
              return (
                <button
                  key={option.id}
                  onClick={() => setType(option.id)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg border border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--accent)] text-left transition-all"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: `${option.color}15` }}
                  >
                    <Icon size={16} style={{ color: option.color }} />
                  </div>
                  <span className="text-[13.5px] font-medium">
                    {option.label}
                  </span>
                </button>
              )
            })}
          </div>
        ) : (
          <form onSubmit={submit} className="p-5 space-y-3">
            <label className="field-label">
              Título
              <input
                autoFocus
                required
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="field-input"
                placeholder={`Nome da ${labels[type].toLowerCase()}`}
              />
            </label>
            {(type === "note" || type === "goal" || type === "project") && (
              <label className="field-label">
                Descrição
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className="field-input min-h-24 resize-y"
                  placeholder="Detalhes..."
                />
              </label>
            )}
            {type === "event" && (
              <label className="field-label">
                Local
                <input
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className="field-input"
                  placeholder="Local ou link"
                />
              </label>
            )}
            {type !== "note" && (
              <div className="grid grid-cols-2 gap-3">
                <label className="field-label">
                  Data
                  <input
                    type="date"
                    value={date}
                    onChange={(event) => setDate(event.target.value)}
                    className="field-input"
                  />
                </label>
                <label className="field-label">
                  Categoria
                  <select
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    className="field-input"
                  >
                    {data.categories.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </label>
              </div>
            )}
            {type === "event" && (
              <div className="grid grid-cols-2 gap-3">
                <label className="field-label">
                  Início
                  <input
                    type="time"
                    value={time}
                    onChange={(event) => setTime(event.target.value)}
                    className="field-input"
                  />
                </label>
                <label className="field-label">
                  Fim
                  <input
                    type="time"
                    value={endTime}
                    onChange={(event) => setEndTime(event.target.value)}
                    className="field-input"
                  />
                </label>
              </div>
            )}
            {(type === "expense" || type === "income") && (
              <label className="field-label">
                Valor (R$)
                <input
                  required
                  inputMode="decimal"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  className="field-input"
                  placeholder="0,00"
                />
              </label>
            )}
            {(type === "expense" || type === "income") && (
              <label className="field-label">
                Conta
                <select
                  required
                  value={account}
                  onChange={(event) => setAccount(event.target.value)}
                  className="field-input"
                >
                  <option value="" disabled>
                    Selecione
                  </option>
                  {data.finances.accounts.map((item) => (
                    <option key={item.id}>{item.name}</option>
                  ))}
                </select>
                {data.finances.accounts.length === 0 && (
                  <span className="text-[11px] text-amber-700 mt-1">
                    Cadastre uma conta em Finanças antes de lançar movimentos.
                  </span>
                )}
              </label>
            )}
            {type === "goal" && (
              <label className="field-label">
                Valor-alvo
                <input
                  required
                  inputMode="decimal"
                  value={target}
                  onChange={(event) => setTarget(event.target.value)}
                  className="field-input"
                  placeholder="100"
                />
              </label>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 text-[13px] text-[var(--muted-foreground)] rounded-lg hover:bg-[var(--secondary)]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-[13px] font-medium bg-[var(--primary)] text-white rounded-lg hover:bg-blue-700"
              >
                Salvar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
