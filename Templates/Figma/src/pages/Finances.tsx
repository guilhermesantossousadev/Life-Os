import { useState } from "react";
import { TrendingUp, TrendingDown, CreditCard, Wallet, Plus } from "lucide-react";
import { mockFinances } from "../data/mock";

type Tab = "visao" | "transacoes" | "contas" | "cartoes" | "parcelas" | "dividas" | "orcamento";

function fmt(v: number) {
  return Math.abs(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const catEmoji: Record<string, string> = {
  Alimentação: "🍔", Transporte: "🚗", Lazer: "🎮", Educação: "📚",
  Saúde: "💊", Moradia: "🏠", Receita: "💰",
};

export default function Finances() {
  const [tab, setTab] = useState<Tab>("visao");

  const totalBalance = mockFinances.accounts.reduce((s, a) => s + a.balance, 0);
  const monthIncome = mockFinances.transactions.filter(t => t.type === "receita").reduce((s, t) => s + t.value, 0);
  const monthExpense = Math.abs(mockFinances.transactions.filter(t => t.type === "despesa").reduce((s, t) => s + t.value, 0));

  const tabs: { id: Tab; label: string }[] = [
    { id: "visao", label: "Visão geral" },
    { id: "transacoes", label: "Transações" },
    { id: "contas", label: "Contas" },
    { id: "cartoes", label: "Cartões" },
    { id: "parcelas", label: "Parcelas" },
    { id: "dividas", label: "Dívidas" },
    { id: "orcamento", label: "Orçamento" },
  ];

  return (
    <div className="p-6" style={{ fontFamily: "var(--font-ui)" }}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[22px] font-semibold text-[var(--foreground)]">Finanças</h1>
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium rounded-lg bg-[var(--primary)] text-white hover:bg-blue-700">
          <Plus size={14} /> Registrar
        </button>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-0.5 mb-6 border-b border-[var(--border)] overflow-x-auto pb-px">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-[13px] font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
              tab === t.id ? "border-[var(--primary)] text-[var(--primary)]" : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Visão geral */}
      {tab === "visao" && (
        <div className="max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[
              { label: "Saldo total", value: fmt(totalBalance), icon: Wallet, color: "#2563EB", positive: true },
              { label: "Receitas este mês", value: fmt(monthIncome), icon: TrendingUp, color: "#059669", positive: true },
              { label: "Despesas este mês", value: fmt(monthExpense), icon: TrendingDown, color: "#EF4444", positive: false },
            ].map(c => {
              const Icon = c.icon;
              return (
                <div key={c.label} className="bg-white rounded-xl border border-[var(--border)] p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">{c.label}</span>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: c.color + "18" }}>
                      <Icon size={15} style={{ color: c.color }} />
                    </div>
                  </div>
                  <p className="text-[22px] font-bold" style={{ color: c.color, fontFamily: "var(--font-mono-family)" }}>{c.value}</p>
                </div>
              );
            })}
          </div>

          {/* Budget overview */}
          <div className="bg-white rounded-xl border border-[var(--border)] p-5 mb-4">
            <h2 className="text-[14px] font-semibold text-[var(--foreground)] mb-4">Orçamento do mês</h2>
            <div className="space-y-3">
              {mockFinances.budgets.map(b => {
                const pct = Math.round((b.spent / b.limit) * 100);
                const over = pct > 100;
                return (
                  <div key={b.category}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[13px] text-[var(--foreground)]">
                        <span className="mr-1.5">{catEmoji[b.category] || "📂"}</span>
                        {b.category}
                      </span>
                      <div className="flex items-center gap-2 text-[12px]" style={{ fontFamily: "var(--font-mono-family)" }}>
                        <span className={over ? "text-red-500 font-semibold" : "text-[var(--foreground)]"}>{fmt(b.spent)}</span>
                        <span className="text-[var(--muted-foreground)]">/ {fmt(b.limit)}</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-[var(--secondary)] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${Math.min(pct, 100)}%`, background: over ? "#EF4444" : pct > 80 ? "#F59E0B" : "#2563EB" }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent transactions */}
          <div className="bg-white rounded-xl border border-[var(--border)] p-5">
            <h2 className="text-[14px] font-semibold text-[var(--foreground)] mb-4">Últimas transações</h2>
            <div className="space-y-1">
              {mockFinances.transactions.slice(0, 5).map(t => (
                <div key={t.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[var(--secondary)] transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-[var(--secondary)] flex items-center justify-center text-base">
                    {catEmoji[t.category] || "📂"}
                  </div>
                  <div className="flex-1">
                    <p className="text-[13.5px] text-[var(--foreground)]">{t.desc}</p>
                    <p className="text-[11px] text-[var(--muted-foreground)]">{t.category} · {t.date}</p>
                  </div>
                  <span
                    className="text-[13.5px] font-semibold"
                    style={{ color: t.type === "receita" ? "#059669" : "#EF4444", fontFamily: "var(--font-mono-family)" }}
                  >
                    {t.type === "receita" ? "+" : "-"}{fmt(t.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Transações */}
      {tab === "transacoes" && (
        <div className="max-w-3xl bg-white rounded-xl border border-[var(--border)] overflow-hidden">
          <div className="p-4 border-b border-[var(--border)] flex items-center gap-3">
            <span className="text-[13px] text-[var(--muted-foreground)]">Agosto 2026</span>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {mockFinances.transactions.map(t => (
              <div key={t.id} className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--secondary)] transition-colors">
                <div className="w-8 h-8 rounded-lg bg-[var(--secondary)] flex items-center justify-center">
                  {catEmoji[t.category] || "📂"}
                </div>
                <div className="flex-1">
                  <p className="text-[13.5px] text-[var(--foreground)]">{t.desc}</p>
                  <p className="text-[11px] text-[var(--muted-foreground)]">{t.category} · {t.account}</p>
                </div>
                <span className="text-[12px] text-[var(--muted-foreground)]">{t.date}</span>
                <span
                  className="text-[14px] font-semibold w-28 text-right"
                  style={{ color: t.type === "receita" ? "#059669" : "#EF4444", fontFamily: "var(--font-mono-family)" }}
                >
                  {t.type === "receita" ? "+" : "-"}{fmt(t.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contas */}
      {tab === "contas" && (
        <div className="max-w-2xl grid grid-cols-2 gap-4">
          {mockFinances.accounts.map(acc => (
            <div key={acc.id} className="bg-white rounded-xl border border-[var(--border)] p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: acc.color + "20" }}>
                  <Wallet size={16} style={{ color: acc.color }} />
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-[var(--foreground)]">{acc.name}</p>
                  <p className="text-[11px] text-[var(--muted-foreground)]">{acc.type}</p>
                </div>
              </div>
              <p className="text-[24px] font-bold" style={{ color: acc.color, fontFamily: "var(--font-mono-family)" }}>{fmt(acc.balance)}</p>
            </div>
          ))}
        </div>
      )}

      {/* Cartões */}
      {tab === "cartoes" && (
        <div className="max-w-2xl space-y-4">
          {mockFinances.cards.map(card => {
            const usedPct = Math.round((card.used / card.limit) * 100);
            return (
              <div key={card.id} className="bg-white rounded-xl border border-[var(--border)] p-5">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: card.color + "20" }}>
                    <CreditCard size={16} style={{ color: card.color }} />
                  </div>
                  <p className="text-[15px] font-semibold text-[var(--foreground)]">{card.name}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-[11px] text-[var(--muted-foreground)] mb-0.5">Fatura atual</p>
                    <p className="text-[16px] font-bold" style={{ fontFamily: "var(--font-mono-family)", color: card.color }}>{fmt(card.used)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-[var(--muted-foreground)] mb-0.5">Disponível</p>
                    <p className="text-[16px] font-bold text-[var(--foreground)]" style={{ fontFamily: "var(--font-mono-family)" }}>{fmt(card.limit - card.used)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-[var(--muted-foreground)] mb-0.5">Fechamento</p>
                    <p className="text-[13px] font-medium text-[var(--foreground)]">{card.closing}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-[var(--muted-foreground)] mb-0.5">Vencimento</p>
                    <p className="text-[13px] font-medium text-[var(--foreground)]">{card.due}</p>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1 text-[11px] text-[var(--muted-foreground)]">
                    <span>Usado: {usedPct}%</span>
                    <span>Limite: {fmt(card.limit)}</span>
                  </div>
                  <div className="h-1.5 bg-[var(--secondary)] rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${usedPct}%`, background: card.color }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Parcelas */}
      {tab === "parcelas" && (
        <div className="max-w-2xl space-y-3">
          {mockFinances.installments.map(inst => {
            const remaining = inst.total_installments - inst.current;
            const pct = Math.round((inst.current / inst.total_installments) * 100);
            return (
              <div key={inst.id} className="bg-white rounded-xl border border-[var(--border)] p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-[14px] font-semibold text-[var(--foreground)]">{inst.desc}</p>
                    <p className="text-[12px] text-[var(--muted-foreground)]">{inst.account}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[16px] font-bold text-[var(--foreground)]" style={{ fontFamily: "var(--font-mono-family)" }}>{fmt(inst.installment)}</p>
                    <p className="text-[11px] text-[var(--muted-foreground)]">por mês</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="h-1.5 bg-[var(--secondary)] rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-[var(--primary)]" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <span className="text-[12px] text-[var(--muted-foreground)] flex-shrink-0">
                    {inst.current}/{inst.total_installments} · Faltam {fmt(remaining * inst.installment)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Dívidas */}
      {tab === "dividas" && (
        <div className="max-w-2xl space-y-3">
          {mockFinances.debts.map(d => {
            const paidPct = Math.round(((d.initial - d.remaining) / d.initial) * 100);
            return (
              <div key={d.id} className="bg-white rounded-xl border border-[var(--border)] p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-[14px] font-semibold text-[var(--foreground)]">{d.creditor}</p>
                    <p className="text-[12px] text-[var(--muted-foreground)]">Término previsto: {d.end_date}</p>
                  </div>
                  <span className="text-[20px] font-bold text-red-500" style={{ fontFamily: "var(--font-mono-family)" }}>{fmt(d.remaining)}</span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center mb-4">
                  {[
                    { label: "Valor inicial", value: fmt(d.initial) },
                    { label: "Parcela", value: fmt(d.installment) },
                    { label: "Restam", value: `${d.installments_left}x` },
                  ].map(item => (
                    <div key={item.label} className="p-3 rounded-lg bg-[var(--secondary)]">
                      <p className="text-[10px] text-[var(--muted-foreground)] mb-0.5">{item.label}</p>
                      <p className="text-[13px] font-semibold text-[var(--foreground)]" style={{ fontFamily: "var(--font-mono-family)" }}>{item.value}</p>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex justify-between mb-1 text-[11px] text-[var(--muted-foreground)]">
                    <span>Quitado: {paidPct}%</span>
                    <span>{fmt(d.initial - d.remaining)} de {fmt(d.initial)}</span>
                  </div>
                  <div className="h-2 bg-[var(--secondary)] rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${paidPct}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Orçamento */}
      {tab === "orcamento" && (
        <div className="max-w-2xl bg-white rounded-xl border border-[var(--border)] overflow-hidden">
          <div className="p-5 border-b border-[var(--border)]">
            <h2 className="text-[14px] font-semibold text-[var(--foreground)]">Orçamento — Agosto 2026</h2>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {mockFinances.budgets.map(b => {
              const pct = Math.round((b.spent / b.limit) * 100);
              const over = pct > 100;
              return (
                <div key={b.category} className="px-5 py-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[13.5px] font-medium text-[var(--foreground)]">
                      <span className="mr-2">{catEmoji[b.category] || "📂"}</span>
                      {b.category}
                    </span>
                    <div className="flex items-center gap-3 text-[13px]" style={{ fontFamily: "var(--font-mono-family)" }}>
                      <span className={over ? "text-red-500 font-semibold" : "text-[var(--foreground)]"}>{fmt(b.spent)}</span>
                      <span className="text-[var(--muted-foreground)]">/</span>
                      <span className="text-[var(--muted-foreground)]">{fmt(b.limit)}</span>
                    </div>
                  </div>
                  <div className="h-2 bg-[var(--secondary)] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${Math.min(pct, 100)}%`, background: over ? "#EF4444" : pct > 80 ? "#F59E0B" : "#2563EB" }}
                    />
                  </div>
                  {over && (
                    <p className="text-[11px] text-red-500 mt-1">Acima do limite em {fmt(b.spent - b.limit)}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
