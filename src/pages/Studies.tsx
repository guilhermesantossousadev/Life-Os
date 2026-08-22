import { useState } from "react";
import { BookOpen, AlertCircle, CheckCircle } from "lucide-react";
import { useData } from "../context/DataContext";

type Tab = "faculdade" | "cursos" | "aprendizado";

const platformColors: Record<string, string> = {
  Udemy: "#A435F0", Alura: "#047857", Rocketseat: "#8B5CF6",
};

export default function Studies() {
  const { data } = useData();
  const studies = data.studies;
  const [tab, setTab] = useState<Tab>("faculdade");

  return (
    <div className="p-6" style={{ fontFamily: "var(--font-ui)" }}>
      <h1 className="text-[22px] font-semibold text-[var(--foreground)] mb-6">Estudos</h1>

      <div className="flex gap-1 bg-[var(--secondary)] p-1 rounded-xl w-fit mb-6">
        {(["faculdade", "cursos", "aprendizado"] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-[13px] font-medium capitalize transition-colors ${tab === t ? "bg-white text-[var(--foreground)] shadow-sm" : "text-[var(--muted-foreground)]"}`}
          >
            {t === "faculdade" ? "Faculdade" : t === "cursos" ? "Cursos" : "Aprendizado"}
          </button>
        ))}
      </div>

      {/* Faculdade */}
      {tab === "faculdade" && (
        <div className="max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Disciplinas */}
            <div className="bg-white rounded-xl border border-[var(--border)] p-5">
              <h2 className="text-[14px] font-semibold text-[var(--foreground)] mb-4">Disciplinas — 5º Semestre</h2>
              <div className="space-y-3">
                {studies.subjects.map(s => (
                  <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg bg-[var(--secondary)]">
                    <div>
                      <p className="text-[13.5px] font-medium text-[var(--foreground)]">{s.name}</p>
                      <p className="text-[11px] text-[var(--muted-foreground)]">{s.professor} · {s.schedule}</p>
                    </div>
                    <div className="ml-auto text-right flex-shrink-0">
                      <p className="text-[16px] font-bold" style={{ fontFamily: "var(--font-mono-family)", color: s.grade >= 7 ? "#059669" : "#EF4444" }}>{s.grade.toFixed(1)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Atividades */}
            <div className="bg-white rounded-xl border border-[var(--border)] p-5">
              <h2 className="text-[14px] font-semibold text-[var(--foreground)] mb-4">Atividades e Provas</h2>
              <div className="space-y-2.5">
                {studies.assignments.map(a => {
                  const urgent = new Date(a.due) <= new Date("2026-08-27");
                  return (
                    <div key={a.id} className={`flex items-start gap-3 p-3 rounded-lg border ${urgent ? "border-amber-200 bg-amber-50" : "border-[var(--border)] bg-[var(--secondary)]"}`}>
                      <div className="mt-0.5">
                        {urgent
                          ? <AlertCircle size={14} className="text-amber-500" />
                          : <BookOpen size={14} className="text-[var(--muted-foreground)]" />
                        }
                      </div>
                      <div className="flex-1">
                        <p className="text-[13px] font-medium text-[var(--foreground)]">{a.title}</p>
                        <p className="text-[11px] text-[var(--muted-foreground)]">{a.subject}</p>
                      </div>
                      <span className={`text-[11px] font-semibold flex-shrink-0 ${urgent ? "text-amber-700" : "text-[var(--muted-foreground)]"}`}>
                        {new Date(a.due).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cursos */}
      {tab === "cursos" && (
        <div className="max-w-3xl space-y-3">
          {studies.courses.map(c => (
            <div key={c.id} className="bg-white rounded-xl border border-[var(--border)] p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-[14px] font-semibold text-[var(--foreground)]">{c.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full text-white" style={{ background: platformColors[c.platform] || "#6B7280" }}>
                      {c.platform}
                    </span>
                    <span className="text-[11px] text-[var(--muted-foreground)]">{c.done_hours}h / {c.total_hours}h</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {c.certificate && <CheckCircle size={15} className="text-emerald-500" />}
                  <span className="text-[14px] font-bold" style={{ fontFamily: "var(--font-mono-family)", color: c.progress === 100 ? "#059669" : "#2563EB" }}>
                    {c.progress}%
                  </span>
                </div>
              </div>
              <div className="h-1.5 bg-[var(--secondary)] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${c.progress}%`, background: c.progress === 100 ? "#059669" : "#2563EB" }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Aprendizado */}
      {tab === "aprendizado" && (
        <div className="max-w-2xl">
          <div className="bg-white rounded-xl border border-[var(--border)] overflow-hidden">
            <div className="p-5 border-b border-[var(--border)] flex items-center justify-between">
              <h2 className="text-[14px] font-semibold text-[var(--foreground)]">Tópicos em estudo</h2>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {studies.topics.map(t => (
                <div key={t.id} className="flex items-center gap-4 px-5 py-4 hover:bg-[var(--secondary)] transition-colors">
                  <div className="w-8 h-8 rounded-xl bg-[var(--accent)] flex items-center justify-center flex-shrink-0">
                    <BookOpen size={14} className="text-[var(--accent-foreground)]" />
                  </div>
                  <div>
                    <p className="text-[13.5px] font-medium text-[var(--foreground)]">{t.subject}</p>
                    <p className="text-[11.5px] text-[var(--muted-foreground)]">{t.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
