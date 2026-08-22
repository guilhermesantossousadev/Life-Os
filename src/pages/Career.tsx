import { Briefcase, Award, ChevronRight, CheckCircle, Clock, Circle } from "lucide-react";
import { useData } from "../context/DataContext";

const levelColors: Record<string, { bg: string; text: string }> = {
  "Aprendendo": { bg: "#FEF3C7", text: "#92400E" },
  "Básico": { bg: "#EFF6FF", text: "#1D4ED8" },
  "Intermediário": { bg: "#F0FDF4", text: "#065F46" },
  "Avançado": { bg: "#F5F3FF", text: "#5B21B6" },
};

const statusIcon = (s: string) => {
  if (s === "atual") return <div className="w-3 h-3 rounded-full bg-[var(--primary)] ring-4 ring-[var(--accent)]" />;
  if (s === "próximo") return <div className="w-3 h-3 rounded-full bg-amber-400 ring-4 ring-amber-50" />;
  return <div className="w-3 h-3 rounded-full bg-[var(--border)] ring-4 ring-[var(--secondary)]" />;
};

export default function Career() {
  const { data } = useData();
  const career = data.career;
  return (
    <div className="p-6" style={{ fontFamily: "var(--font-ui)" }}>
      <h1 className="text-[22px] font-semibold text-[var(--foreground)] mb-6">Carreira</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl">
        {/* Current position */}
        <div className="bg-white rounded-xl border border-[var(--border)] p-5">
          <div className="flex items-center gap-2 mb-4">
            <Briefcase size={14} className="text-[var(--primary)]" />
            <h2 className="text-[13px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Posição atual</h2>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-[18px] font-bold text-[var(--foreground)]">{career.current.role}</p>
              <p className="text-[13px] text-[var(--muted-foreground)] mt-0.5">{career.current.company}</p>
            </div>
            <div className="pt-3 border-t border-[var(--border)] space-y-2">
              {[
                { label: "Desde", value: new Date(career.current.start).toLocaleDateString("pt-BR", { month: "long", year: "numeric" }) },
                { label: "Local", value: career.current.location },
                { label: "Salário", value: career.current.salary.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-[12px] text-[var(--muted-foreground)]">{item.label}</span>
                  <span className="text-[12px] font-medium text-[var(--foreground)]">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-[var(--border)]">
            <p className="text-[10.5px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-2">Objetivo profissional</p>
            <p className="text-[13px] text-[var(--foreground)]">{career.objective}</p>
          </div>
        </div>

        {/* Career path */}
        <div className="bg-white rounded-xl border border-[var(--border)] p-5">
          <h2 className="text-[13px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-5">Trajetória</h2>
          <div className="space-y-4">
            {career.path.map((step, i) => (
              <div key={i} className="flex items-center gap-4 relative">
                {i < career.path.length - 1 && (
                  <div className="absolute left-[5px] top-3 w-0.5 h-full bg-[var(--border)] -z-0" />
                )}
                <div className="flex-shrink-0 z-10">{statusIcon(step.status)}</div>
                <div className={`flex-1 flex items-center justify-between rounded-lg px-3 py-2 ${step.status === "atual" ? "bg-[var(--accent)]" : "bg-[var(--secondary)]"}`}>
                  <span className={`text-[13px] font-medium ${step.status === "atual" ? "text-[var(--accent-foreground)]" : "text-[var(--foreground)]"}`}>
                    {step.level}
                  </span>
                  {step.status === "atual" && <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--primary)]">Atual</span>}
                  {step.status === "próximo" && <ChevronRight size={12} className="text-amber-400" />}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Skills */}
        <div className="bg-white rounded-xl border border-[var(--border)] p-5">
          <h2 className="text-[13px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-4">Competências</h2>
          <div className="space-y-2 mb-6">
            {career.skills.map(skill => {
              const colors = levelColors[skill.level] || { bg: "#F4F4F5", text: "#71717A" };
              return (
                <div key={skill.name} className="flex items-center justify-between px-3 py-2 rounded-lg bg-[var(--secondary)]">
                  <span className="text-[13px] font-medium text-[var(--foreground)]">{skill.name}</span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: colors.bg, color: colors.text }}>
                    {skill.level}
                  </span>
                </div>
              );
            })}
          </div>

          <h2 className="text-[13px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-3">Certificações</h2>
          <div className="space-y-2">
            {career.certifications.map(cert => (
              <div key={cert.name} className="flex items-start gap-3 p-3 rounded-lg bg-[var(--secondary)]">
                <div className="mt-0.5">
                  {cert.status === "Obtido" ? <CheckCircle size={13} className="text-emerald-500" /> : cert.status === "Em preparação" ? <Clock size={13} className="text-amber-500" /> : <Circle size={13} className="text-[var(--muted-foreground)]" />}
                </div>
                <div>
                  <p className="text-[12.5px] font-medium text-[var(--foreground)]">{cert.name}</p>
                  <p className="text-[11px] text-[var(--muted-foreground)]">{cert.issuer} · {cert.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* History */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-[var(--border)] p-5">
          <h2 className="text-[13px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-4">Histórico profissional</h2>
          <div className="space-y-3">
            {[career.current, ...career.history.map(h => ({ ...h, current: false }))].map((job, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-[var(--secondary)]">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${i === 0 ? "bg-[var(--primary)]" : "bg-[var(--border)]"}`}>
                  <Briefcase size={15} className={i === 0 ? "text-white" : "text-[var(--muted-foreground)]"} />
                </div>
                <div className="flex-1">
                  <p className="text-[13.5px] font-semibold text-[var(--foreground)]">{(job as any).role}</p>
                  <p className="text-[12px] text-[var(--muted-foreground)]">{(job as any).company}</p>
                </div>
                <div className="text-right text-[12px] text-[var(--muted-foreground)]">
                  <p>{new Date((job as any).start).toLocaleDateString("pt-BR", { month: "short", year: "numeric" })}</p>
                  <p>{(job as any).end ? new Date((job as any).end).toLocaleDateString("pt-BR", { month: "short", year: "numeric" }) : "Atual"}</p>
                </div>
                {i === 0 && <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--primary)] bg-[var(--accent)] px-2 py-0.5 rounded-full self-start flex-shrink-0">Atual</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
