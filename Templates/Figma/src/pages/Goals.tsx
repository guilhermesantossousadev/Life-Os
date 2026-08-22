import { useState } from "react";
import { Plus, Target, ChevronRight, Calendar } from "lucide-react";
import { mockGoals } from "../data/mock";

const catColors: Record<string, string> = {
  Financeira: "#059669",
  Profissional: "#2563EB",
  Estudos: "#7C3AED",
  Pessoal: "#D97706",
  Compras: "#EF4444",
  Projetos: "#6366F1",
};

function fmt(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function Goals() {
  const [goals] = useState(mockGoals);
  const [selected, setSelected] = useState<number | null>(null);

  const selectedGoal = goals.find(g => g.id === selected);

  const getPct = (g: typeof goals[0]) =>
    g.unit === "BRL" ? Math.round((g.current / g.target) * 100)
    : g.unit === "%" ? g.current
    : Math.round((g.current / g.target) * 100);

  return (
    <div className="p-6" style={{ fontFamily: "var(--font-ui)" }}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[22px] font-semibold text-[var(--foreground)]">Metas</h1>
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium rounded-lg bg-[var(--primary)] text-white hover:bg-blue-700">
          <Plus size={14} /> Nova meta
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl">
        {goals.map(goal => {
          const pct = getPct(goal);
          const color = catColors[goal.category] || "#6B7280";
          return (
            <div
              key={goal.id}
              onClick={() => setSelected(selected === goal.id ? null : goal.id)}
              className="bg-white rounded-xl border border-[var(--border)] p-5 cursor-pointer hover:border-[var(--primary)]/40 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-[10.5px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: color + "18", color }}>
                    {goal.category}
                  </span>
                  <h3 className="mt-2 text-[14px] font-semibold text-[var(--foreground)]">{goal.title}</h3>
                </div>
                <ChevronRight size={14} className="text-[var(--muted-foreground)] flex-shrink-0 mt-1" />
              </div>

              <p className="text-[12px] text-[var(--muted-foreground)] mb-4 line-clamp-2">{goal.description}</p>

              {/* Progress */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[12px] text-[var(--muted-foreground)]">Progresso</span>
                  <span className="text-[13px] font-bold" style={{ color, fontFamily: "var(--font-mono-family)" }}>{pct}%</span>
                </div>
                <div className="h-2 bg-[var(--secondary)] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
                </div>
              </div>

              {goal.unit === "BRL" && (
                <div className="flex justify-between text-[11.5px]" style={{ fontFamily: "var(--font-mono-family)" }}>
                  <span className="text-[var(--foreground)] font-medium">{fmt(goal.current)}</span>
                  <span className="text-[var(--muted-foreground)]">de {fmt(goal.target)}</span>
                </div>
              )}

              {goal.deadline && (
                <div className="mt-3 flex items-center gap-1 text-[11px] text-[var(--muted-foreground)]">
                  <Calendar size={10} />
                  <span>Prazo: {new Date(goal.deadline).toLocaleDateString("pt-BR")}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Detail drawer */}
      {selectedGoal && (
        <div className="fixed inset-y-0 right-0 w-96 bg-white border-l border-[var(--border)] shadow-xl z-40 overflow-y-auto p-6" style={{ fontFamily: "var(--font-ui)" }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[16px] font-semibold text-[var(--foreground)]">{selectedGoal.title}</h2>
            <button onClick={() => setSelected(null)} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">✕</button>
          </div>

          <span className="text-[10.5px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block mb-4" style={{ background: (catColors[selectedGoal.category] || "#6B7280") + "18", color: catColors[selectedGoal.category] || "#6B7280" }}>
            {selectedGoal.category}
          </span>

          <p className="text-[13px] text-[var(--muted-foreground)] mb-6">{selectedGoal.description}</p>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[13px] font-medium text-[var(--foreground)]">Progresso</span>
              <span className="text-[14px] font-bold" style={{ fontFamily: "var(--font-mono-family)", color: catColors[selectedGoal.category] }}>{getPct(selectedGoal)}%</span>
            </div>
            <div className="h-2.5 bg-[var(--secondary)] rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${getPct(selectedGoal)}%`, background: catColors[selectedGoal.category] || "#2563EB" }} />
            </div>
            {selectedGoal.unit === "BRL" && (
              <div className="flex justify-between mt-2 text-[12px]" style={{ fontFamily: "var(--font-mono-family)" }}>
                <span className="text-[var(--foreground)]">{fmt(selectedGoal.current)}</span>
                <span className="text-[var(--muted-foreground)]">{fmt(selectedGoal.target)}</span>
              </div>
            )}
          </div>

          {selectedGoal.deadline && (
            <div className="p-4 rounded-xl bg-[var(--secondary)] mb-6">
              <p className="text-[11px] text-[var(--muted-foreground)] uppercase tracking-wider mb-1">Prazo</p>
              <p className="text-[14px] font-medium text-[var(--foreground)]">{new Date(selectedGoal.deadline).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })}</p>
            </div>
          )}

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-3">Próximas ações</p>
            <div className="space-y-2">
              {selectedGoal.actions.map((a, i) => (
                <div key={i} className="flex items-center gap-2.5 p-3 rounded-lg bg-[var(--secondary)]">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] flex-shrink-0" />
                  <span className="text-[13px] text-[var(--foreground)]">{a}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
