import { useEffect, useState } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Plus,
  Trash2,
} from "lucide-react"
import { openQuickAdd } from "@/presentation/components/QuickAddModal"
import { useData } from "@/application/state/DataContext"
import { todayInSaoPaulo } from "@/shared/datetime/dates"
import { useLocation } from "react-router-dom"

type View = "dia" | "semana" | "mes"

const DAYS_PT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
const MONTHS_PT = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
]

const catColor: Record<string, string> = {
  Trabalho: "#2563EB",
  Faculdade: "#7C3AED",
  Pessoal: "#059669",
  Carreira: "#D97706",
  Compromisso: "#EF4444",
}

export default function Agenda() {
  const location = useLocation()
  const { data, setData } = useData()
  const [view, setView] = useState<View>("semana")
  const todayStr = todayInSaoPaulo()
  const [baseDate, setBaseDate] = useState(
    () => new Date(`${todayStr}T12:00:00`),
  )
  const [selected, setSelected] = useState<number | null>(null)
  const selectedEvent = data.events.find((event) => event.id === selected)
  useEffect(() => {
    const id = new URLSearchParams(location.search).get("event")
    const event = data.events.find((item) => item.serverId === id)
    if (event) {
      setSelected(event.id)
      setBaseDate(new Date(`${event.date}T12:00:00`))
    }
  }, [data.events, location.search])

  const getWeekDays = (date: Date) => {
    const day = date.getDay()
    const start = new Date(date)
    start.setDate(date.getDate() - day)
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      return d
    })
  }

  const toStr = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`

  const weekDays = getWeekDays(baseDate)
  const eventsForDay = (dayStr: string) =>
    data.events.filter((e) => e.date === dayStr)

  const navigate = (dir: 1 | -1) => {
    const d = new Date(baseDate)
    if (view === "dia") d.setDate(d.getDate() + dir)
    else if (view === "semana") d.setDate(d.getDate() + dir * 7)
    else d.setMonth(d.getMonth() + dir)
    setBaseDate(d)
  }

  const monthStr = `${MONTHS_PT[baseDate.getMonth()]} ${baseDate.getFullYear()}`

  return (
    <div className="p-6" style={{ fontFamily: "var(--font-ui)" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-[22px] font-semibold text-[var(--foreground)]">
            Agenda
          </h1>
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigate(-1)}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[var(--secondary)] text-[var(--muted-foreground)]"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-[14px] font-medium text-[var(--foreground)] px-2 min-w-[140px] text-center">
              {monthStr}
            </span>
            <button
              onClick={() => navigate(1)}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[var(--secondary)] text-[var(--muted-foreground)]"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openQuickAdd("event")}
            className="flex items-center gap-1 px-3 py-1.5 bg-[var(--primary)] text-white rounded-lg text-[12px]"
          >
            <Plus size={13} /> Evento
          </button>
          <div className="flex gap-1 bg-[var(--secondary)] p-1 rounded-xl">
            {(["dia", "semana", "mes"] as View[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3.5 py-1.5 rounded-lg text-[13px] font-medium capitalize transition-colors ${
                  view === v
                    ? "bg-white text-[var(--foreground)] shadow-sm"
                    : "text-[var(--muted-foreground)]"
                }`}
              >
                {v === "mes" ? "Mês" : v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Week view */}
      {view === "semana" && (
        <div className="bg-white rounded-xl border border-[var(--border)] overflow-hidden">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-[var(--border)]">
            {weekDays.map((d) => {
              const dStr = toStr(d)
              const isToday = dStr === todayStr
              return (
                <div
                  key={dStr}
                  className={`flex flex-col items-center py-3 border-r last:border-0 border-[var(--border)] ${
                    isToday ? "bg-[var(--accent)]" : ""
                  }`}
                >
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                    {DAYS_PT[d.getDay()]}
                  </span>
                  <span
                    className={`mt-1 text-[15px] font-semibold rounded-full w-7 h-7 flex items-center justify-center ${
                      isToday
                        ? "bg-[var(--primary)] text-white"
                        : "text-[var(--foreground)]"
                    }`}
                  >
                    {d.getDate()}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Events grid */}
          <div className="grid grid-cols-7" style={{ minHeight: 300 }}>
            {weekDays.map((d) => {
              const dStr = toStr(d)
              const dayEvts = eventsForDay(dStr)
              const isToday = dStr === todayStr
              return (
                <div
                  key={dStr}
                  className={`border-r last:border-0 border-[var(--border)] p-2 space-y-1 ${
                    isToday ? "bg-[var(--accent)]/40" : ""
                  }`}
                >
                  {dayEvts.map((ev) => (
                    <div
                      key={ev.id}
                      onClick={() => setSelected(ev.id)}
                      className="rounded-lg px-2 py-1.5 text-[11.5px] cursor-pointer hover:opacity-80 transition-opacity"
                      style={{
                        background: (catColor[ev.category] || "#6B7280") + "18",
                        borderLeft: `3px solid ${catColor[ev.category] || "#6B7280"}`,
                      }}
                    >
                      <p
                        className="font-medium leading-tight"
                        style={{ color: catColor[ev.category] || "#6B7280" }}
                      >
                        {ev.title}
                      </p>
                      <p className="text-[var(--muted-foreground)] mt-0.5">
                        {ev.time}
                      </p>
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Day view */}
      {view === "dia" && (
        <div className="bg-white rounded-xl border border-[var(--border)] p-6 max-w-lg">
          <h2 className="text-[16px] font-semibold mb-5">
            {baseDate.toLocaleDateString("pt-BR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </h2>
          {eventsForDay(toStr(baseDate)).length === 0 ? (
            <p className="text-[13px] text-[var(--muted-foreground)] py-8 text-center">
              Nenhum evento neste dia
            </p>
          ) : (
            <div className="space-y-3">
              {eventsForDay(toStr(baseDate)).map((ev) => (
                <div
                  key={ev.id}
                  onClick={() => setSelected(ev.id)}
                  className="flex gap-4 p-4 rounded-xl border border-[var(--border)] hover:border-[var(--primary)]/30 transition-colors cursor-pointer"
                >
                  <div className="text-right w-12 flex-shrink-0">
                    <p className="text-[13px] font-semibold text-[var(--foreground)]">
                      {ev.time}
                    </p>
                    <p className="text-[11px] text-[var(--muted-foreground)]">
                      {ev.endTime}
                    </p>
                  </div>
                  <div
                    className="w-0.5 rounded-full self-stretch"
                    style={{ background: catColor[ev.category] || "#6B7280" }}
                  />
                  <div className="flex-1">
                    <p className="text-[14px] font-medium text-[var(--foreground)]">
                      {ev.title}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-[11.5px] text-[var(--muted-foreground)]">
                      <span className="flex items-center gap-1">
                        <Clock size={10} /> {ev.time} — {ev.endTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={10} /> {ev.local}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Month view */}
      {view === "mes" && (
        <div className="bg-white rounded-xl border border-[var(--border)] overflow-hidden">
          <div className="grid grid-cols-7 border-b border-[var(--border)]">
            {DAYS_PT.map((d) => (
              <div
                key={d}
                className="py-2 text-center text-[11px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)] border-r last:border-0 border-[var(--border)]"
              >
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {(() => {
              const year = baseDate.getFullYear()
              const month = baseDate.getMonth()
              const firstDay = new Date(year, month, 1).getDay()
              const daysInMonth = new Date(year, month + 1, 0).getDate()
              const cells: (number | null)[] = [
                ...Array(firstDay).fill(null),
                ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
              ]
              while (cells.length % 7 !== 0) cells.push(null)
              return cells.map((day, i) => {
                const dStr = day
                  ? `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                  : ""
                const dayEvts = day ? eventsForDay(dStr) : []
                const isToday = dStr === todayStr
                return (
                  <div
                    key={i}
                    className={`min-h-[80px] p-1.5 border-r last:border-0 border-b last:border-b-0 border-[var(--border)] ${
                      isToday ? "bg-[var(--accent)]/50" : ""
                    }`}
                  >
                    {day && (
                      <>
                        <span
                          className={`text-[12px] font-semibold inline-flex items-center justify-center w-6 h-6 rounded-full ${
                            isToday
                              ? "bg-[var(--primary)] text-white"
                              : "text-[var(--foreground)]"
                          }`}
                        >
                          {day}
                        </span>
                        <div className="mt-1 space-y-0.5">
                          {dayEvts.slice(0, 2).map((ev) => (
                            <div
                              key={ev.id}
                              onClick={() => setSelected(ev.id)}
                              className="text-[10px] rounded px-1 py-0.5 truncate cursor-pointer"
                              style={{
                                background:
                                  (catColor[ev.category] || "#6B7280") + "20",
                                color: catColor[ev.category] || "#6B7280",
                              }}
                            >
                              {ev.time} {ev.title}
                            </div>
                          ))}
                          {dayEvts.length > 2 && (
                            <div className="text-[10px] text-[var(--muted-foreground)] pl-1">
                              +{dayEvts.length - 2}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )
              })
            })()}
          </div>
        </div>
      )}
      {selectedEvent && (
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Editar evento"
          className="fixed inset-y-0 right-0 z-40 w-full max-w-sm bg-white border-l border-[var(--border)] shadow-xl p-6 overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold">Editar evento</h2>
            <button aria-label="Fechar" onClick={() => setSelected(null)}>
              ✕
            </button>
          </div>
          <div className="space-y-4">
            <label className="field-label">
              Título
              <input
                value={selectedEvent.title}
                onChange={(event) =>
                  setData((current) => ({
                    ...current,
                    events: current.events.map((item) =>
                      item.id === selectedEvent.id
                        ? { ...item, title: event.target.value }
                        : item,
                    ),
                  }))
                }
                className="field-input"
              />
            </label>
            <label className="field-label">
              Data
              <input
                type="date"
                value={selectedEvent.date}
                onChange={(event) =>
                  setData((current) => ({
                    ...current,
                    events: current.events.map((item) =>
                      item.id === selectedEvent.id
                        ? { ...item, date: event.target.value }
                        : item,
                    ),
                  }))
                }
                className="field-input"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="field-label">
                Início
                <input
                  type="time"
                  value={selectedEvent.time}
                  onChange={(event) =>
                    setData((current) => ({
                      ...current,
                      events: current.events.map((item) =>
                        item.id === selectedEvent.id
                          ? { ...item, time: event.target.value }
                          : item,
                      ),
                    }))
                  }
                  className="field-input"
                />
              </label>
              <label className="field-label">
                Fim
                <input
                  type="time"
                  value={selectedEvent.endTime}
                  onChange={(event) =>
                    setData((current) => ({
                      ...current,
                      events: current.events.map((item) =>
                        item.id === selectedEvent.id
                          ? { ...item, endTime: event.target.value }
                          : item,
                      ),
                    }))
                  }
                  className="field-input"
                />
              </label>
            </div>
            <label className="field-label">
              Local
              <input
                value={selectedEvent.local}
                onChange={(event) =>
                  setData((current) => ({
                    ...current,
                    events: current.events.map((item) =>
                      item.id === selectedEvent.id
                        ? { ...item, local: event.target.value }
                        : item,
                    ),
                  }))
                }
                className="field-input"
              />
            </label>
            <label className="field-label">
              Categoria
              <select
                value={selectedEvent.category}
                onChange={(event) =>
                  setData((current) => ({
                    ...current,
                    events: current.events.map((item) =>
                      item.id === selectedEvent.id
                        ? { ...item, category: event.target.value }
                        : item,
                    ),
                  }))
                }
                className="field-input"
              >
                {data.categories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </label>
          </div>
          <button
            onClick={() => {
              setData((current) => ({
                ...current,
                events: current.events.filter(
                  (item) => item.id !== selectedEvent.id,
                ),
              }))
              setSelected(null)
            }}
            className="mt-6 text-sm text-red-600 flex items-center gap-2"
          >
            <Trash2 size={14} />
            Excluir evento
          </button>
        </aside>
      )}
    </div>
  )
}
