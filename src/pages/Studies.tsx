import { useState } from "react";
import { BookOpen, AlertCircle, CheckCircle, Pencil, Plus, Trash2 } from "lucide-react";
import { nextId, today, useData } from "../context/DataContext";
import { addCivilDays, todayInSaoPaulo } from "../lib/dates";

type Tab = "faculdade" | "cursos" | "aprendizado";

const platformColors: Record<string, string> = {
  Udemy: "#A435F0", Alura: "#047857", Rocketseat: "#8B5CF6",
};

export default function Studies() {
  const { data, setData } = useData();
  const studies = data.studies;
  const [tab, setTab] = useState<Tab>("faculdade");
  const [editor, setEditor] = useState<{ type: "subject" | "assignment" | "course" | "topic"; id?: number } | null>(null);
  const [draft, setDraft] = useState({ title: "", secondary: "", extra: "", date: today(), value: "0" });
  const openEditor = (type: typeof editor extends infer _ ? "subject" | "assignment" | "course" | "topic" : never, item?: any) => { setEditor({ type, id: item?.id }); setDraft(type === "subject" ? { title: item?.name ?? "", secondary: item?.professor ?? "", extra: item?.schedule ?? "", date: today(), value: String(item?.grade ?? 0) } : type === "assignment" ? { title: item?.title ?? "", secondary: item?.subject ?? data.studies.subjects[0]?.name ?? "", extra: "", date: item?.due ?? today(), value: "0" } : type === "course" ? { title: item?.name ?? "", secondary: item?.platform ?? "", extra: "", date: today(), value: String(item?.progress ?? 0) } : { title: item?.subject ?? "", secondary: item?.description ?? "", extra: "", date: today(), value: "0" }); };
  const saveEditor = () => {
    if (!editor || !draft.title.trim()) return;
    setData(current => {
      const studies = structuredClone(current.studies);
      if (editor.type === "subject") { const value = { id: editor.id ?? nextId(studies.subjects), name: draft.title.trim(), professor: draft.secondary, schedule: draft.extra, grade: Number(draft.value) || 0, status: "Em andamento" } as typeof studies.subjects[number]; studies.subjects = editor.id ? studies.subjects.map(item => item.id === editor.id ? { ...item, ...value, serverId: item.serverId } : item) : [...studies.subjects, value]; }
      if (editor.type === "assignment") { const value = { id: editor.id ?? nextId(studies.assignments), title: draft.title.trim(), subject: draft.secondary, due: draft.date, status: "pendente" } as typeof studies.assignments[number]; studies.assignments = editor.id ? studies.assignments.map(item => item.id === editor.id ? { ...item, ...value, serverId: item.serverId } : item) : [...studies.assignments, value]; }
      if (editor.type === "course") { const progress = Math.min(100, Math.max(0, Number(draft.value) || 0)); const value = { id: editor.id ?? nextId(studies.courses), name: draft.title.trim(), platform: draft.secondary, progress, total_hours: 0, done_hours: 0, certificate: progress === 100 } as typeof studies.courses[number]; studies.courses = editor.id ? studies.courses.map(item => item.id === editor.id ? { ...item, ...value, serverId: item.serverId } : item) : [...studies.courses, value]; }
      if (editor.type === "topic") { const value = { id: editor.id ?? nextId(studies.topics), subject: draft.title.trim(), description: draft.secondary } as typeof studies.topics[number]; studies.topics = editor.id ? studies.topics.map(item => item.id === editor.id ? { ...item, ...value, serverId: item.serverId } : item) : [...studies.topics, value]; }
      return { ...current, studies };
    });
    setEditor(null);
  };
  const remove = (type: NonNullable<typeof editor>["type"], id: number) => setData(current => ({ ...current, studies: { ...current.studies, subjects: type === "subject" ? current.studies.subjects.filter(item => item.id !== id) : current.studies.subjects, assignments: type === "assignment" ? current.studies.assignments.filter(item => item.id !== id) : current.studies.assignments, courses: type === "course" ? current.studies.courses.filter(item => item.id !== id) : current.studies.courses, topics: type === "topic" ? current.studies.topics.filter(item => item.id !== id) : current.studies.topics } }));

  return (
    <div className="p-6" style={{ fontFamily: "var(--font-ui)" }}>
      <div className="flex items-center justify-between mb-6"><h1 className="text-[22px] font-semibold text-[var(--foreground)]">Estudos</h1><div className="flex gap-2">{tab === "faculdade" && <><button onClick={() => openEditor("subject")} className="px-3 py-1.5 border rounded-lg text-xs"><Plus size={12} className="inline mr-1" />Disciplina</button><button onClick={() => openEditor("assignment")} className="px-3 py-1.5 bg-[var(--primary)] text-white rounded-lg text-xs"><Plus size={12} className="inline mr-1" />Atividade</button></>}{tab === "cursos" && <button onClick={() => openEditor("course")} className="px-3 py-1.5 bg-[var(--primary)] text-white rounded-lg text-xs"><Plus size={12} className="inline mr-1" />Curso</button>}{tab === "aprendizado" && <button onClick={() => openEditor("topic")} className="px-3 py-1.5 bg-[var(--primary)] text-white rounded-lg text-xs"><Plus size={12} className="inline mr-1" />Tópico</button>}</div></div>

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
                    <button aria-label="Editar disciplina" onClick={() => openEditor("subject", s)}><Pencil size={12} /></button><button aria-label="Excluir disciplina" onClick={() => remove("subject", s.id)} className="text-red-500"><Trash2 size={12} /></button>
                  </div>
                ))}
              </div>
            </div>

            {/* Atividades */}
            <div className="bg-white rounded-xl border border-[var(--border)] p-5">
              <h2 className="text-[14px] font-semibold text-[var(--foreground)] mb-4">Atividades e Provas</h2>
              <div className="space-y-2.5">
                {studies.assignments.map(a => {
                  const urgent = a.due <= addCivilDays(todayInSaoPaulo(), 5);
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
                        {new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", timeZone: "UTC" }).format(new Date(`${a.due}T12:00:00Z`))}
                      </span>
                      <button aria-label="Editar atividade" onClick={() => openEditor("assignment", a)}><Pencil size={12} /></button><button aria-label="Excluir atividade" onClick={() => remove("assignment", a.id)} className="text-red-500"><Trash2 size={12} /></button>
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
                <button aria-label="Editar curso" onClick={() => openEditor("course", c)}><Pencil size={13} /></button><button aria-label="Excluir curso" onClick={() => remove("course", c.id)} className="text-red-500"><Trash2 size={13} /></button>
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
                  <button aria-label="Editar tópico" onClick={() => openEditor("topic", t)} className="ml-auto"><Pencil size={12} /></button><button aria-label="Excluir tópico" onClick={() => remove("topic", t.id)} className="text-red-500"><Trash2 size={12} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {editor && <div className="fixed inset-0 z-50 bg-black/30 grid place-items-center p-4"><div role="dialog" aria-modal="true" aria-label="Editar estudos" className="w-full max-w-md bg-white rounded-2xl p-6"><h2 className="text-lg font-semibold mb-4">{editor.id ? "Editar" : "Adicionar"} {editor.type === "subject" ? "disciplina" : editor.type === "assignment" ? "atividade" : editor.type === "course" ? "curso" : "tópico"}</h2><div className="space-y-3"><label className="field-label">{editor.type === "subject" ? "Nome" : "Título"}<input autoFocus value={draft.title} onChange={event => setDraft(value => ({ ...value, title: event.target.value }))} className="field-input" /></label>{editor.type === "assignment" ? <label className="field-label">Disciplina<select value={draft.secondary} onChange={event => setDraft(value => ({ ...value, secondary: event.target.value }))} className="field-input">{data.studies.subjects.map(item => <option key={item.id}>{item.name}</option>)}</select></label> : <label className="field-label">{editor.type === "subject" ? "Professor" : editor.type === "course" ? "Plataforma" : "Descrição"}<input value={draft.secondary} onChange={event => setDraft(value => ({ ...value, secondary: event.target.value }))} className="field-input" /></label>}{editor.type === "subject" && <label className="field-label">Horário<input value={draft.extra} onChange={event => setDraft(value => ({ ...value, extra: event.target.value }))} className="field-input" /></label>}{editor.type === "assignment" && <label className="field-label">Prazo<input type="date" value={draft.date} onChange={event => setDraft(value => ({ ...value, date: event.target.value }))} className="field-input" /></label>}{(editor.type === "subject" || editor.type === "course") && <label className="field-label">{editor.type === "course" ? "Progresso (%)" : "Nota"}<input type="number" min="0" max={editor.type === "course" ? 100 : undefined} value={draft.value} onChange={event => setDraft(value => ({ ...value, value: event.target.value }))} className="field-input" /></label>}</div><div className="flex justify-end gap-2 mt-5"><button onClick={() => setEditor(null)} className="px-4 py-2 border rounded-lg text-sm">Cancelar</button><button onClick={saveEditor} className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm">Salvar</button></div></div></div>}
    </div>
  );
}
