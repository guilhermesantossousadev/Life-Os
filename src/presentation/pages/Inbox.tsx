import { useState } from "react"
import {
  Plus,
  ArrowRight,
  Archive,
  Trash2,
  CheckSquare,
  Calendar,
  FileText,
  Target,
  FolderKanban,
  Inbox as InboxIcon,
} from "lucide-react"
import { nextId, today, useData } from "@/application/state/DataContext"
import { api } from "@/infrastructure/http/apiClient"
import { resources } from "@/infrastructure/http/resourceGateway"
import { APP_TIME_ZONE } from "@/shared/datetime/dates"

export default function Inbox() {
  const { data, setData, reload } = useData()
  const [showArchived, setShowArchived] = useState(false)
  const items = data.inbox.filter(
    (item) => Boolean(item.archived) === showArchived,
  )
  const [text, setText] = useState("")
  const [active, setActive] = useState<number | null>(null)

  const add = () => {
    if (!text.trim()) return
    setData((current) => ({
      ...current,
      inbox: [
        {
          id: nextId(current.inbox),
          text: text.trim(),
          created: new Date().toISOString(),
        },
        ...current.inbox,
      ],
    }))
    setText("")
  }

  const remove = async (id: number) => {
    const item = data.inbox.find((candidate) => candidate.id === id)
    if (item?.serverId) {
      await resources.remove("inbox", item.serverId)
      await reload()
    }
  }
  const archive = async (id: number, restore = false) => {
    const item = data.inbox.find((candidate) => candidate.id === id)
    if (item?.serverId) {
      await api.post(
        `/api/v1/inbox/${item.serverId}/${restore ? "restore" : "archive"}`,
      )
      await reload()
    }
  }
  const convert = async (id: number, label: string) => {
    const source = items.find((item) => item.id === id)
    if (!source?.serverId) return
    const type = ({
      Tarefa: "task",
      Evento: "event",
      Nota: "note",
      Meta: "goal",
      Projeto: "project",
    } as Record<string, string>)[label]
    await api.post(`/api/v1/inbox/${source.serverId}/convert`, {
      type,
      date: today(),
      startAt: new Date().toISOString(),
      targetValue: 100,
    })
    await reload()
    setActive(null)
  }

  const convertOptions = [
    { label: "Tarefa", icon: CheckSquare },
    { label: "Evento", icon: Calendar },
    { label: "Nota", icon: FileText },
    { label: "Meta", icon: Target },
    { label: "Projeto", icon: FolderKanban },
  ]

  return (
    <div
      className="p-6 max-w-2xl mx-auto"
      style={{ fontFamily: "var(--font-ui)" }}
    >
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold text-[var(--foreground)]">
          Inbox
        </h1>
        <p className="text-[13px] text-[var(--muted-foreground)] mt-1">
          Capture qualquer pensamento rapidamente. Organize depois.
        </p>
      </div>
      <button
        onClick={() => setShowArchived((value) => !value)}
        className="mb-4 text-[12px] text-[var(--primary)]"
      >
        {showArchived ? "Ver pendentes" : "Ver arquivados"}
      </button>

      {/* Quick capture */}
      <div className="bg-white rounded-xl border border-[var(--border)] p-4 mb-6">
        <div className="flex gap-3">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="O que está na sua cabeça?"
            className="flex-1 text-[14px] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] bg-transparent"
          />
          <button
            onClick={add}
            disabled={!text.trim()}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[var(--primary)] text-white text-[13px] font-medium disabled:opacity-40 transition-opacity hover:bg-blue-700"
          >
            <Plus size={14} />
            Capturar
          </button>
        </div>
      </div>

      {/* Items */}
      {items.length === 0 && (
        <div className="text-center py-16 text-[var(--muted-foreground)]">
          <InboxIcon size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-[14px]">Inbox vazia. Ótimo trabalho!</p>
        </div>
      )}

      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl border border-[var(--border)] hover:border-[var(--primary)]/30 transition-colors"
          >
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] flex-shrink-0" />
              <p className="flex-1 text-[13.5px] text-[var(--foreground)]">
                {item.text}
              </p>
              <span className="text-[11px] text-[var(--muted-foreground)]">
                {new Intl.DateTimeFormat("pt-BR", {
                  timeZone: APP_TIME_ZONE,
                  day: "2-digit",
                  month: "short",
                }).format(new Date(item.created))}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActive(active === item.id ? null : item.id)}
                  className="p-1.5 rounded-md text-[var(--muted-foreground)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)] transition-colors"
                  title="Converter"
                >
                  <ArrowRight size={13} />
                </button>
                <button
                  onClick={() => void archive(item.id, showArchived)}
                  className="p-1.5 rounded-md text-[var(--muted-foreground)] hover:bg-[var(--secondary)] hover:text-red-500 transition-colors"
                  title="Arquivar"
                >
                  <Archive size={13} />
                </button>
                <button
                  onClick={() => void remove(item.id)}
                  className="p-1.5 rounded-md text-[var(--muted-foreground)] hover:bg-red-50 hover:text-red-500 transition-colors"
                  title="Excluir"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            {/* Convert panel */}
            {active === item.id && (
              <div className="border-t border-[var(--border)] px-4 py-3 bg-[var(--secondary)] rounded-b-xl">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-2">
                  Converter em
                </p>
                <div className="flex gap-2 flex-wrap">
                  {convertOptions.map((opt) => {
                    const Icon = opt.icon
                    return (
                      <button
                        key={opt.label}
                        onClick={() => void convert(item.id, opt.label)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[var(--border)] text-[12px] text-[var(--foreground)] hover:border-[var(--primary)] transition-colors"
                      >
                        <Icon size={12} className="text-[var(--primary)]" />
                        {opt.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
