import { useEffect, useRef, useState } from "react";
import { Archive, Briefcase, Calendar, CheckSquare, FileText, FolderKanban, Package, Search, Target, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import type { Page } from "../data/mock";
import { useFocusTrap } from "../hooks/useFocusTrap";

interface SearchResult { type: string; id: string; title: string; route: string }

const icons: Record<string, typeof Search> = {
  task: CheckSquare,
  event: Calendar,
  note: FileText,
  project: FolderKanban,
  goal: Target,
  document: Archive,
  study: FileText,
  career: Briefcase,
  asset: Package,
};
const labels: Record<string, string> = {
  task: "Tarefa",
  event: "Evento",
  note: "Nota",
  project: "Projeto",
  goal: "Meta",
  document: "Documento",
  study: "Estudos",
  career: "Carreira",
  asset: "Patrimônio",
};

export default function SearchModal({ onClose }: { onClose: () => void; onNavigate: (page: Page) => void }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useFocusTrap(dialogRef, onClose);
  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); return; }
    const timer = window.setTimeout(() => {
      setLoading(true);
      api.get<SearchResult[]>(`/api/v1/search?q=${encodeURIComponent(query.trim())}`)
        .then(setResults)
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 250);
    return () => window.clearTimeout(timer);
  }, [query]);
  useEffect(() => setActive(0), [query]);
  useEffect(() => {
    const handle = (event: KeyboardEvent) => {
      if (event.key === "ArrowDown") { event.preventDefault(); setActive(value => Math.min(value + 1, results.length - 1)); }
      if (event.key === "ArrowUp") { event.preventDefault(); setActive(value => Math.max(value - 1, 0)); }
      if (event.key === "Enter" && results[active]) { navigate(results[active].route); onClose(); }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [active, navigate, onClose, results]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/20" onMouseDown={event => event.target === event.currentTarget && onClose()}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="Busca global" tabIndex={-1} className="w-full max-w-xl bg-white rounded-xl shadow-2xl border border-[var(--border)] overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border)]">
          <Search size={16} />
          <input ref={inputRef} value={query} onChange={event => setQuery(event.target.value)} placeholder="Pesquisar em todos os módulos..." aria-label="Pesquisar em todos os módulos" className="flex-1 text-[14px] bg-transparent" />
          <button aria-label="Fechar busca" onClick={onClose}><X size={14} /></button>
        </div>
        <div className="py-2 max-h-80 overflow-y-auto" aria-live="polite">
          {results.map((result, index) => {
            const Icon = icons[result.type] ?? Search;
            return <button key={`${result.type}-${result.id}`} onMouseEnter={() => setActive(index)} onClick={() => { navigate(result.route); onClose(); }} className={`w-full flex items-center gap-3 px-4 py-2.5 text-left ${active === index ? "bg-[var(--secondary)]" : ""}`}>
              <div className="w-7 h-7 rounded-md bg-[var(--accent)] text-[var(--primary)] flex items-center justify-center"><Icon size={13} /></div>
              <div><p className="text-[13.5px]">{result.title}</p><p className="text-[11px] text-[var(--muted-foreground)]">{labels[result.type] ?? result.type}</p></div>
            </button>;
          })}
          {loading && <p className="text-center text-sm py-8">Pesquisando...</p>}
          {!loading && query.length >= 2 && results.length === 0 && <p className="text-center text-sm py-8 text-[var(--muted-foreground)]">Nenhum resultado encontrado</p>}
          {query.length < 2 && <p className="text-center text-sm py-8 text-[var(--muted-foreground)]">Digite ao menos 2 caracteres</p>}
        </div>
        <div className="border-t border-[var(--border)] px-4 py-2 text-[11px] text-[var(--muted-foreground)]">↑↓ navegar · ↵ abrir · Esc fechar</div>
      </div>
    </div>
  );
}
