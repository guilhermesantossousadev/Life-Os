import { useEffect, useRef, useState } from "react";
import { Search, CheckSquare, Calendar, FileText, FolderKanban, Target, Archive, X } from "lucide-react";
import { mockTasks, mockEvents, mockNotes, mockProjects, mockGoals, mockDocuments } from "../data/mock";

interface SearchModalProps {
  onClose: () => void;
}

const allResults = [
  ...mockTasks.map(t => ({ type: "Tarefa", label: t.title, sub: t.category, icon: CheckSquare, color: "#2563EB" })),
  ...mockEvents.map(e => ({ type: "Evento", label: e.title, sub: e.date, icon: Calendar, color: "#059669" })),
  ...mockNotes.map(n => ({ type: "Nota", label: n.title, sub: n.category, icon: FileText, color: "#D97706" })),
  ...mockProjects.map(p => ({ type: "Projeto", label: p.name, sub: p.status, icon: FolderKanban, color: "#7C3AED" })),
  ...mockGoals.map(g => ({ type: "Meta", label: g.title, sub: g.category, icon: Target, color: "#EF4444" })),
  ...mockDocuments.map(d => ({ type: "Documento", label: d.name, sub: d.category, icon: Archive, color: "#6B7280" })),
];

export default function SearchModal({ onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const filtered = query.length < 2
    ? allResults.slice(0, 6)
    : allResults.filter(r => r.label.toLowerCase().includes(query.toLowerCase()) || r.type.toLowerCase().includes(query.toLowerCase())).slice(0, 8);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4" onClick={onClose}>
      <div
        className="w-full max-w-xl bg-white rounded-xl shadow-2xl border border-[var(--border)] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border)]">
          <Search size={16} className="text-[var(--muted-foreground)] flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Pesquisar tarefas, notas, projetos..."
            className="flex-1 text-[14px] bg-transparent text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]"
            style={{ fontFamily: "var(--font-ui)" }}
          />
          <button onClick={onClose} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            <X size={14} />
          </button>
        </div>

        <div className="py-2 max-h-80 overflow-y-auto">
          {query.length < 2 && (
            <p className="px-4 py-2 text-[11px] font-semibold text-[var(--muted-foreground)] uppercase tracking-widest">
              Recentes
            </p>
          )}
          {filtered.map((r, i) => {
            const Icon = r.icon;
            return (
              <button
                key={i}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--secondary)] text-left transition-colors"
                onClick={onClose}
              >
                <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: r.color + "18" }}>
                  <Icon size={13} style={{ color: r.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13.5px] text-[var(--foreground)] truncate" style={{ fontFamily: "var(--font-ui)" }}>{r.label}</p>
                  <p className="text-[11px] text-[var(--muted-foreground)]">{r.type} · {r.sub}</p>
                </div>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <p className="text-center text-[13px] text-[var(--muted-foreground)] py-8">Nenhum resultado encontrado</p>
          )}
        </div>

        <div className="border-t border-[var(--border)] px-4 py-2 flex items-center gap-4 text-[11px] text-[var(--muted-foreground)]">
          <span>↑↓ navegar</span>
          <span>↵ abrir</span>
          <span>Esc fechar</span>
        </div>
      </div>
    </div>
  );
}
