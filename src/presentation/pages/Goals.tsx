import { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"
import { Plus, ChevronRight, Calendar } from "lucide-react"
import { openQuickAdd } from "@/presentation/components/QuickAddModal"
import { nextId, useData } from "@/application/state/DataContext"
import { formatCivilDate } from "@/shared/datetime/dates"

const catColors: Record<string, string> = {
  Financeira: "#059669",
  Profissional: "#2563EB",
  Estudos: "#7C3AED",
  Pessoal: "#D97706",
  Compras: "#EF4444",
  Projetos: "#6366F1",
}

function fmt(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

export default function Goals() {
  const location = useLocation()
  const { data, setData } = useData()
  const goals = data.goals
  const [selected, setSelected] = useState<number | null>(null)
  const [newAction, setNewAction] = useState("")
  useEffect(() => {
    const id = location.pathname.split("/")[2]
    const goal = goals.find((item) => item.serverId === id)
    if (goal) setSelected(goal.id)
  }, [goals, location.pathname])

  const selectedGoal = goals.find((g) => g.id === selected)

  const getPct = (g: typeof goals[0]) =>
    Math.min(
      100,
      Math.max(0, g.target > 0 ? Math.round((g.current / g.target) * 100) : 0),
    )

  return (
    <div className="p-6" style={{ fontFamily: "var(--font-ui)" }}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[22px] font-semibold text-[var(--foreground)]">
          Metas
        </h1>
        <button
          onClick={() => openQuickAdd("goal")}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium rounded-lg bg-[var(--primary)] text-white hover:bg-blue-700"
        >
          <Plus size={14} /> Nova meta
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl">
        {goals.map((goal) => {
          const pct = getPct(goal)
          const color = catColors[goal.category] || "#6B7280"
          return (
            <div
              key={goal.id}
              onClick={() => setSelected(selected === goal.id ? null : goal.id)}
              className="bg-white rounded-xl border border-[var(--border)] p-5 cursor-pointer hover:border-[var(--primary)]/40 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span
                    className="text-[10.5px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                    style={{ background: color + "18", color }}
                  >
                    {goal.category}
                  </span>
                  <h3 className="mt-2 text-[14px] font-semibold text-[var(--foreground)]">
                    {goal.title}
                  </h3>
                </div>
                <ChevronRight
                  size={14}
                  className="text-[var(--muted-foreground)] flex-shrink-0 mt-1"
                />
              </div>

              <p className="text-[12px] text-[var(--muted-foreground)] mb-4 line-clamp-2">
                {goal.description}
              </p>

              {/* Progress */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[12px] text-[var(--muted-foreground)]">
                    Progresso
                  </span>
                  <span
                    className="text-[13px] font-bold"
                    style={{ color, fontFamily: "var(--font-mono-family)" }}
                  >
                    {pct}%
                  </span>
                </div>
                <div className="h-2 bg-[var(--secondary)] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, background: color }}
                  />
                </div>
              </div>

              {goal.unit === "BRL" && (
                <div
                  className="flex justify-between text-[11.5px]"
                  style={{ fontFamily: "var(--font-mono-family)" }}
                >
                  <span className="text-[var(--foreground)] font-medium">
                    {fmt(goal.current)}
                  </span>
                  <span className="text-[var(--muted-foreground)]">
                    de {fmt(goal.target)}
                  </span>
                </div>
              )}

              {goal.deadline && (
                <div className="mt-3 flex items-center gap-1 text-[11px] text-[var(--muted-foreground)]">
                  <Calendar size={10} />
                  <span>Prazo: {formatCivilDate(goal.deadline)}</span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Detail drawer */}
      {selectedGoal && (
        <div
          className="fixed inset-y-0 right-0 w-96 bg-white border-l border-[var(--border)] shadow-xl z-40 overflow-y-auto p-6"
          style={{ fontFamily: "var(--font-ui)" }}
        >
          <div className="flex items-center justify-between mb-6">
            <input
              aria-label="Título da meta"
              value={selectedGoal.title}
              onChange={(event) =>
                setData((current) => ({
                  ...current,
                  goals: current.goals.map((goal) =>
                    goal.id === selectedGoal.id
                      ? { ...goal, title: event.target.value }
                      : goal,
                  ),
                }))
              }
              className="text-[16px] font-semibold bg-transparent flex-1"
            />
            <button
              onClick={() => setSelected(null)}
              className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            >
              ✕
            </button>
          </div>

          <span
            className="text-[10.5px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block mb-4"
            style={{
              background:
                (catColors[selectedGoal.category] || "#6B7280") + "18",
              color: catColors[selectedGoal.category] || "#6B7280",
            }}
          >
            {selectedGoal.category}
          </span>

          <label className="field-label mb-5">
            Descrição
            <textarea
              value={selectedGoal.description}
              onChange={(event) =>
                setData((current) => ({
                  ...current,
                  goals: current.goals.map((goal) =>
                    goal.id === selectedGoal.id
                      ? { ...goal, description: event.target.value }
                      : goal,
                  ),
                }))
              }
              className="field-input min-h-20"
            />
          </label>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[13px] font-medium text-[var(--foreground)]">
                Progresso
              </span>
              <span
                className="text-[14px] font-bold"
                style={{
                  fontFamily: "var(--font-mono-family)",
                  color: catColors[selectedGoal.category],
                }}
              >
                {getPct(selectedGoal)}%
              </span>
            </div>
            <div className="h-2.5 bg-[var(--secondary)] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${getPct(selectedGoal)}%`,
                  background: catColors[selectedGoal.category] || "#2563EB",
                }}
              />
            </div>
            {selectedGoal.unit === "BRL" && (
              <div
                className="flex justify-between mt-2 text-[12px]"
                style={{ fontFamily: "var(--font-mono-family)" }}
              >
                <span className="text-[var(--foreground)]">
                  {fmt(selectedGoal.current)}
                </span>
                <span className="text-[var(--muted-foreground)]">
                  {fmt(selectedGoal.target)}
                </span>
              </div>
            )}
          </div>

          <label className="field-label mb-5">
            Atualizar progresso
            <input
              type="number"
              min="0"
              value={selectedGoal.current}
              onChange={(event) =>
                setData((current) => ({
                  ...current,
                  goals: current.goals.map((goal) =>
                    goal.id === selectedGoal.id
                      ? {
                          ...goal,
                          current: Math.max(0, Number(event.target.value)),
                        }
                      : goal,
                  ),
                }))
              }
              className="field-input"
            />
          </label>
          <div className="grid grid-cols-2 gap-3 mb-5">
            <label className="field-label">
              Alvo
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={selectedGoal.target}
                onChange={(event) =>
                  setData((current) => ({
                    ...current,
                    goals: current.goals.map((goal) =>
                      goal.id === selectedGoal.id
                        ? {
                            ...goal,
                            target: Math.max(0.01, Number(event.target.value)),
                          }
                        : goal,
                    ),
                  }))
                }
                className="field-input"
              />
            </label>
            <label className="field-label">
              Prazo
              <input
                type="date"
                value={selectedGoal.deadline}
                onChange={(event) =>
                  setData((current) => ({
                    ...current,
                    goals: current.goals.map((goal) =>
                      goal.id === selectedGoal.id
                        ? { ...goal, deadline: event.target.value }
                        : goal,
                    ),
                  }))
                }
                className="field-input"
              />
            </label>
          </div>
          {selectedGoal.current > selectedGoal.target && (
            <p className="text-xs text-emerald-700 mb-4">
              Meta superada em {selectedGoal.current - selectedGoal.target}{" "}
              {selectedGoal.unit}. O progresso visual permanece normalizado em
              100%.
            </p>
          )}

          {selectedGoal.deadline && (
            <div className="p-4 rounded-xl bg-[var(--secondary)] mb-6">
              <p className="text-[11px] text-[var(--muted-foreground)] uppercase tracking-wider mb-1">
                Prazo
              </p>
              <p className="text-[14px] font-medium text-[var(--foreground)]">
                {formatCivilDate(selectedGoal.deadline, {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          )}

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-3">
              Próximas ações
            </p>
            <div className="space-y-2">
              {(selectedGoal.actionRecords ?? []).map((action) => (
                <div
                  key={action.id}
                  className="flex items-center gap-2.5 p-3 rounded-lg bg-[var(--secondary)]"
                >
                  <input
                    type="checkbox"
                    checked={action.done}
                    onChange={() =>
                      setData((current) => ({
                        ...current,
                        goals: current.goals.map((goal) =>
                          goal.id === selectedGoal.id
                            ? {
                                ...goal,
                                actionRecords: (goal.actionRecords ?? []).map(
                                  (item) =>
                                    item.id === action.id
                                      ? { ...item, done: !item.done }
                                      : item,
                                ),
                              }
                            : goal,
                        ),
                      }))
                    }
                  />
                  <input
                    aria-label="Ação da meta"
                    value={action.title}
                    onChange={(event) =>
                      setData((current) => ({
                        ...current,
                        goals: current.goals.map((goal) =>
                          goal.id === selectedGoal.id
                            ? {
                                ...goal,
                                actionRecords: (goal.actionRecords ?? []).map(
                                  (item) =>
                                    item.id === action.id
                                      ? { ...item, title: event.target.value }
                                      : item,
                                ),
                              }
                            : goal,
                        ),
                      }))
                    }
                    className="flex-1 bg-transparent text-[13px]"
                  />
                  <button
                    aria-label="Excluir ação"
                    onClick={() =>
                      setData((current) => ({
                        ...current,
                        goals: current.goals.map((goal) =>
                          goal.id === selectedGoal.id
                            ? {
                                ...goal,
                                actionRecords: (
                                  goal.actionRecords ?? []
                                ).filter((item) => item.id !== action.id),
                              }
                            : goal,
                        ),
                      }))
                    }
                    className="text-red-500"
                  >
                    ×
                  </button>
                </div>
              ))}
              <div className="flex gap-2">
                <input
                  value={newAction}
                  onChange={(event) => setNewAction(event.target.value)}
                  placeholder="Nova ação"
                  className="field-input"
                />
                <button
                  onClick={() => {
                    if (!newAction.trim()) return
                    setData((current) => ({
                      ...current,
                      goals: current.goals.map((goal) =>
                        goal.id === selectedGoal.id
                          ? {
                              ...goal,
                              actionRecords: [
                                ...(goal.actionRecords ?? []),
                                {
                                  id: nextId(goal.actionRecords ?? []),
                                  title: newAction.trim(),
                                  done: false,
                                },
                              ],
                            }
                          : goal,
                      ),
                    }))
                    setNewAction("")
                  }}
                  className="px-3 bg-[var(--primary)] text-white rounded-lg text-xs"
                >
                  Adicionar
                </button>
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              setData((current) => ({
                ...current,
                goals: current.goals.filter(
                  (goal) => goal.id !== selectedGoal.id,
                ),
              }))
              setSelected(null)
            }}
            className="mt-6 text-[12px] text-red-500 hover:underline"
          >
            Excluir meta
          </button>
        </div>
      )}
    </div>
  )
}
