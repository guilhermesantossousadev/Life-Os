import { CheckSquare, Calendar, TrendingDown, TrendingUp, FileText, Target, FolderKanban, X } from "lucide-react";
import { useEffect } from "react";

interface QuickAddModalProps {
  onClose: () => void;
  onSuccess: (type: string) => void;
}

const options = [
  { id: "task", label: "Tarefa", icon: CheckSquare, color: "#2563EB" },
  { id: "event", label: "Evento", icon: Calendar, color: "#059669" },
  { id: "expense", label: "Despesa", icon: TrendingDown, color: "#EF4444" },
  { id: "income", label: "Receita", icon: TrendingUp, color: "#059669" },
  { id: "note", label: "Nota", icon: FileText, color: "#D97706" },
  { id: "goal", label: "Meta", icon: Target, color: "#7C3AED" },
  { id: "project", label: "Projeto", icon: FolderKanban, color: "#6366F1" },
];

export default function QuickAddModal({ onClose, onSuccess }: QuickAddModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/20" />
      <div
        className="relative w-full max-w-sm bg-white rounded-xl shadow-2xl border border-[var(--border)] overflow-hidden"
        onClick={e => e.stopPropagation()}
        style={{ fontFamily: "var(--font-ui)" }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
          <h2 className="font-semibold text-[15px] text-[var(--foreground)]">Adicionar</h2>
          <button onClick={onClose} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            <X size={16} />
          </button>
        </div>
        <div className="p-4 grid grid-cols-2 gap-2">
          {options.map(opt => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.id}
                onClick={() => { onSuccess(opt.label); onClose(); }}
                className="flex items-center gap-3 px-4 py-3 rounded-lg border border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--accent)] text-left transition-all"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: opt.color + "15" }}>
                  <Icon size={16} style={{ color: opt.color }} />
                </div>
                <span className="text-[13.5px] font-medium text-[var(--foreground)]">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
