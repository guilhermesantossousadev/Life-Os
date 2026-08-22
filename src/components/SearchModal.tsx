import { useEffect, useMemo, useRef, useState } from "react";
import { Archive, Calendar, CheckSquare, FileText, FolderKanban, Search, Target, X } from "lucide-react";
import { useData } from "../context/DataContext";
import type { Page } from "../data/mock";

export default function SearchModal({ onClose, onNavigate }: { onClose: () => void; onNavigate: (page: Page) => void }) {
  const { data } = useData();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const results = useMemo(() => [
    ...data.tasks.map(item => ({ type: "Tarefa", label: item.title, sub: item.category, page: "tasks" as Page, icon: CheckSquare, color: "#2563EB" })),
    ...data.events.map(item => ({ type: "Evento", label: item.title, sub: item.date, page: "agenda" as Page, icon: Calendar, color: "#059669" })),
    ...data.notes.map(item => ({ type: "Nota", label: item.title, sub: item.category, page: "notes" as Page, icon: FileText, color: "#D97706" })),
    ...data.projects.map(item => ({ type: "Projeto", label: item.name, sub: item.status, page: "projects" as Page, icon: FolderKanban, color: "#7C3AED" })),
    ...data.goals.map(item => ({ type: "Meta", label: item.title, sub: item.category, page: "goals" as Page, icon: Target, color: "#EF4444" })),
    ...data.documents.map(item => ({ type: "Documento", label: item.name, sub: item.category, page: "documents" as Page, icon: Archive, color: "#6B7280" })),
  ], [data]);
  const filtered = (query.length < 2 ? results : results.filter(result => `${result.label} ${result.type} ${result.sub}`.toLowerCase().includes(query.toLowerCase()))).slice(0, 8);

  const open = (index: number) => {
    const result = filtered[index];
    if (result) onNavigate(result.page);
    onClose();
  };

  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => setActive(0), [query]);
  useEffect(() => {
    const handle = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowDown") { event.preventDefault(); setActive(value => Math.min(value + 1, filtered.length - 1)); }
      if (event.key === "ArrowUp") { event.preventDefault(); setActive(value => Math.max(value - 1, 0)); }
      if (event.key === "Enter") open(active);
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  });

  return <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/20" onMouseDown={event => event.target === event.currentTarget && onClose()}>
    <div className="w-full max-w-xl bg-white rounded-xl shadow-2xl border border-[var(--border)] overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border)]"><Search size={16} className="text-[var(--muted-foreground)]" /><input ref={inputRef} value={query} onChange={event => setQuery(event.target.value)} placeholder="Pesquisar tarefas, notas, projetos..." className="flex-1 text-[14px] bg-transparent" /><button aria-label="Fechar" onClick={onClose}><X size={14} /></button></div>
      <div className="py-2 max-h-80 overflow-y-auto">{filtered.map((result, index) => { const Icon = result.icon; return <button key={`${result.type}-${result.label}`} onMouseEnter={() => setActive(index)} onClick={() => open(index)} className={`w-full flex items-center gap-3 px-4 py-2.5 text-left ${active === index ? "bg-[var(--secondary)]" : ""}`}><div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: `${result.color}18` }}><Icon size={13} style={{ color: result.color }} /></div><div className="min-w-0"><p className="text-[13.5px] truncate">{result.label}</p><p className="text-[11px] text-[var(--muted-foreground)]">{result.type} · {result.sub}</p></div></button>; })}{filtered.length === 0 && <p className="text-center text-[13px] text-[var(--muted-foreground)] py-8">Nenhum resultado encontrado</p>}</div>
      <div className="border-t border-[var(--border)] px-4 py-2 text-[11px] text-[var(--muted-foreground)]">↑↓ navegar &nbsp; ↵ abrir &nbsp; Esc fechar</div>
    </div>
  </div>;
}
