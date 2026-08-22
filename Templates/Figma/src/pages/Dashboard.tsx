import { useState } from "react";
import { CheckSquare, Calendar, Wallet, Target, BookOpen, AlertCircle, Clock, ArrowRight } from "lucide-react";
import { mockTasks, mockEvents, mockGoals, mockStudies, mockFinances } from "../data/mock";

const hour = new Date().getHours();
const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

const todayStr = "2026-08-22";

function fmt(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function Dashboard({ onNavigate }: { onNavigate: (p: string) => void }) {
  const [tasks, setTasks] = useState(mockTasks.filter(t => t.date === todayStr));

  const todayEvents = mockEvents.filter(e => e.date === todayStr);
  const topGoals = mockGoals.slice(0, 3);

  const monthIncome = mockFinances.transactions.filter(t => t.type === "receita").reduce((s, t) => s + t.value, 0);
  const monthExpense = Math.abs(mockFinances.transactions.filter(t => t.type === "despesa").reduce((s, t) => s + t.value, 0));
  const totalBalance = mockFinances.accounts.reduce((s, a) => s + a.balance, 0);

  const nextAssignment = mockStudies.assignments[0];

  const pending = tasks.filter(t => !t.done).length;
  const highPri = tasks.filter(t => !t.done && t.priority === "alta").length;

  const toggle = (id: number) => setTasks(ts => ts.map(t => t.id === id ? { ...t, done: !t.done } : t));

  return (
    <div className="p-6 max-w-5xl mx-auto" style={{ fontFamily: "var(--font-ui)" }}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[28px] font-semibold text-[var(--foreground)]">{greeting}, Guilherme</h1>
        <p className="text-[var(--muted-foreground)] text-[14px] mt-0.5">Sábado, 22 de agosto de 2026</p>
      </div>

      {/* Alert strip */}
      {highPri > 0 && (
        <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[13.5px]">
          <AlertCircle size={15} className="flex-shrink-0 text-amber-600" />
          <span>Você tem <strong>{highPri} tarefa{highPri > 1 ? "s" : ""} de alta prioridade</strong> para hoje.</span>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Tarefas hoje", value: `${pending} pendentes`, icon: CheckSquare, color: "#2563EB", sub: `${tasks.filter(t=>t.done).length} concluídas` },
          { label: "Compromissos", value: `${todayEvents.length} hoje`, icon: Calendar, color: "#059669", sub: todayEvents[0]?.time + " " + (todayEvents[0]?.title ?? "—") },
          { label: "Saldo total", value: fmt(totalBalance), icon: Wallet, color: "#7C3AED", sub: `Gasto: ${fmt(monthExpense)} este mês` },
          { label: "Faculdade", value: nextAssignment?.title.slice(0,22)+"…", icon: BookOpen, color: "#D97706", sub: "Entrega: " + nextAssignment?.due },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-xl border border-[var(--border)] p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">{card.label}</span>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: card.color + "15" }}>
                  <Icon size={13} style={{ color: card.color }} />
                </div>
              </div>
              <p className="text-[14px] font-semibold text-[var(--foreground)] leading-tight">{card.value}</p>
              <p className="text-[11.5px] text-[var(--muted-foreground)] mt-1">{card.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Main 2-col grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tasks today */}
        <div className="md:col-span-2 bg-white rounded-xl border border-[var(--border)] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[14px] text-[var(--foreground)]">Tarefas de hoje</h2>
            <button onClick={() => onNavigate("tasks")} className="text-[12px] text-[var(--primary)] hover:underline flex items-center gap-1">
              Ver todas <ArrowRight size={11} />
            </button>
          </div>
          <div className="space-y-1.5">
            {tasks.length === 0 && (
              <p className="text-[13px] text-[var(--muted-foreground)] py-4 text-center">Nenhuma tarefa para hoje 🎉</p>
            )}
            {tasks.map(task => (
              <label
                key={task.id}
                className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-[var(--secondary)] cursor-pointer transition-colors group"
              >
                <input
                  type="checkbox"
                  checked={task.done}
                  onChange={() => toggle(task.id)}
                  className="mt-0.5 w-3.5 h-3.5 rounded accent-[var(--primary)] cursor-pointer"
                />
                <div className="flex-1 min-w-0">
                  <p className={`text-[13.5px] ${task.done ? "line-through text-[var(--muted-foreground)]" : "text-[var(--foreground)]"}`}>{task.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-[var(--muted-foreground)]">{task.category}</span>
                    {task.priority === "alta" && !task.done && (
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-red-600 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded">Alta</span>
                    )}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Agenda */}
        <div className="bg-white rounded-xl border border-[var(--border)] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[14px] text-[var(--foreground)]">Agenda de hoje</h2>
            <button onClick={() => onNavigate("agenda")} className="text-[12px] text-[var(--primary)] hover:underline">
              <ArrowRight size={11} />
            </button>
          </div>
          {todayEvents.length === 0 ? (
            <p className="text-[13px] text-[var(--muted-foreground)] py-4 text-center">Dia livre hoje</p>
          ) : (
            <div className="space-y-3">
              {todayEvents.map(ev => (
                <div key={ev.id} className="flex gap-3">
                  <div className="text-right flex-shrink-0 w-10">
                    <p className="text-[11px] font-semibold text-[var(--foreground)]">{ev.time}</p>
                  </div>
                  <div className="flex-1 border-l-2 border-[var(--primary)] pl-3">
                    <p className="text-[13px] font-medium text-[var(--foreground)] leading-tight">{ev.title}</p>
                    <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5 flex items-center gap-1">
                      <Clock size={9} /> {ev.endTime} · {ev.local}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Finances mini */}
        <div className="bg-white rounded-xl border border-[var(--border)] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[14px] text-[var(--foreground)]">Finanças</h2>
            <button onClick={() => onNavigate("finances")} className="text-[12px] text-[var(--primary)] hover:underline flex items-center gap-1">Ver <ArrowRight size={11} /></button>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[12px] text-[var(--muted-foreground)]">Receitas</span>
              <span className="text-[13px] font-semibold text-emerald-600" style={{ fontFamily: "var(--font-mono-family)" }}>{fmt(monthIncome)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[12px] text-[var(--muted-foreground)]">Despesas</span>
              <span className="text-[13px] font-semibold text-red-500" style={{ fontFamily: "var(--font-mono-family)" }}>{fmt(monthExpense)}</span>
            </div>
            <div className="border-t border-[var(--border)] pt-3 flex justify-between items-center">
              <span className="text-[12px] font-medium text-[var(--foreground)]">Saldo</span>
              <span className="text-[14px] font-bold text-[var(--foreground)]" style={{ fontFamily: "var(--font-mono-family)" }}>{fmt(totalBalance)}</span>
            </div>
            {mockFinances.installments.slice(0, 2).map(inst => (
              <div key={inst.id} className="flex justify-between items-center bg-[var(--secondary)] rounded-lg px-3 py-2">
                <div>
                  <p className="text-[12px] text-[var(--foreground)]">{inst.desc.slice(0,20)}</p>
                  <p className="text-[10px] text-[var(--muted-foreground)]">{inst.current}/{inst.total_installments} parcelas</p>
                </div>
                <span className="text-[12px] font-semibold" style={{ fontFamily: "var(--font-mono-family)" }}>{fmt(inst.installment)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Goals */}
        <div className="md:col-span-2 bg-white rounded-xl border border-[var(--border)] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[14px] text-[var(--foreground)]">Metas</h2>
            <button onClick={() => onNavigate("goals")} className="text-[12px] text-[var(--primary)] hover:underline flex items-center gap-1">Ver todas <ArrowRight size={11} /></button>
          </div>
          <div className="space-y-4">
            {topGoals.map(goal => {
              const pct = goal.unit === "BRL"
                ? Math.round((goal.current / goal.target) * 100)
                : goal.unit === "%"
                ? goal.current
                : Math.round((goal.current / goal.target) * 100);
              return (
                <div key={goal.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div>
                      <span className="text-[13.5px] font-medium text-[var(--foreground)]">{goal.title}</span>
                      <span className="ml-2 text-[11px] text-[var(--muted-foreground)]">{goal.category}</span>
                    </div>
                    <span className="text-[12px] font-semibold text-[var(--muted-foreground)]" style={{ fontFamily: "var(--font-mono-family)" }}>
                      {pct}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-[var(--secondary)] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[var(--primary)] transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  {goal.unit === "BRL" && (
                    <div className="flex justify-between mt-1">
                      <span className="text-[10.5px] text-[var(--muted-foreground)]" style={{ fontFamily: "var(--font-mono-family)" }}>{fmt(goal.current)}</span>
                      <span className="text-[10.5px] text-[var(--muted-foreground)]" style={{ fontFamily: "var(--font-mono-family)" }}>{fmt(goal.target)}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
