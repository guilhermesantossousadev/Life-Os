import { useState } from "react";
import { Plus, CheckSquare, ChevronRight, Tag } from "lucide-react";
import { mockProjects } from "../data/mock";

const statusColor: Record<string, { bg: string; text: string; dot: string }> = {
  "Em andamento": { bg: "#EFF6FF", text: "#1D4ED8", dot: "#2563EB" },
  "Planejado": { bg: "#F0FDF4", text: "#065F46", dot: "#059669" },
  "Pausado": { bg: "#FEF3C7", text: "#92400E", dot: "#D97706" },
  "Concluído": { bg: "#F5F3FF", text: "#5B21B6", dot: "#7C3AED" },
};

export default function Projects() {
  const [projects, setProjects] = useState(mockProjects);
  const [selected, setSelected] = useState<number | null>(null);

  const selectedProject = projects.find(p => p.id === selected);

  const toggleTask = (projectId: number, taskId: number) => {
    setProjects(ps => ps.map(p => p.id === projectId
      ? { ...p, tasks: p.tasks.map(t => t.id === taskId ? { ...t, done: !t.done } : t) }
      : p
    ));
  };

  return (
    <div className="p-6" style={{ fontFamily: "var(--font-ui)" }}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[22px] font-semibold text-[var(--foreground)]">Projetos</h1>
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium rounded-lg bg-[var(--primary)] text-white hover:bg-blue-700">
          <Plus size={14} /> Novo projeto
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-w-5xl">
        {projects.map(p => {
          const colors = statusColor[p.status] || statusColor["Planejado"];
          const doneTasks = p.tasks.filter(t => t.done).length;
          return (
            <div
              key={p.id}
              onClick={() => setSelected(selected === p.id ? null : p.id)}
              className="bg-white rounded-xl border border-[var(--border)] p-5 cursor-pointer hover:border-[var(--primary)]/40 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <span
                  className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: colors.bg, color: colors.text }}
                >
                  <span className="inline-block w-1.5 h-1.5 rounded-full mr-1.5" style={{ background: colors.dot }} />
                  {p.status}
                </span>
                <ChevronRight size={14} className="text-[var(--muted-foreground)]" />
              </div>

              <h3 className="text-[14px] font-semibold text-[var(--foreground)] mb-1">{p.name}</h3>
              <p className="text-[12px] text-[var(--muted-foreground)] mb-4 line-clamp-2">{p.description}</p>

              {/* Progress */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] text-[var(--muted-foreground)]">{doneTasks}/{p.tasks.length} tarefas</span>
                  <span className="text-[12px] font-semibold" style={{ fontFamily: "var(--font-mono-family)" }}>{p.progress}%</span>
                </div>
                <div className="h-1.5 bg-[var(--secondary)] rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-[var(--primary)] transition-all" style={{ width: `${p.progress}%` }} />
                </div>
              </div>

              <div className="flex gap-1.5 flex-wrap">
                {p.tags.map(tag => (
                  <span key={tag} className="flex items-center gap-1 text-[10.5px] px-2 py-0.5 rounded-full bg-[var(--secondary)] text-[var(--muted-foreground)]">
                    <Tag size={9} />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail panel */}
      {selectedProject && (
        <div className="fixed inset-y-0 right-0 w-96 bg-white border-l border-[var(--border)] shadow-xl z-40 overflow-y-auto" style={{ fontFamily: "var(--font-ui)" }}>
          <div className="p-5 border-b border-[var(--border)] flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-[var(--foreground)]">{selectedProject.name}</h2>
            <button onClick={() => setSelected(null)} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">✕</button>
          </div>

          <div className="p-5">
            <p className="text-[13px] text-[var(--muted-foreground)] mb-5">{selectedProject.description}</p>

            <div className="grid grid-cols-2 gap-3 mb-5">
              {[
                { label: "Status", value: selectedProject.status },
                { label: "Prazo", value: new Date(selectedProject.deadline).toLocaleDateString("pt-BR") },
                { label: "Progresso", value: `${selectedProject.progress}%` },
                { label: "Tarefas", value: `${selectedProject.tasks.filter(t=>t.done).length}/${selectedProject.tasks.length}` },
              ].map(item => (
                <div key={item.label} className="p-3 rounded-xl bg-[var(--secondary)]">
                  <p className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-wider mb-0.5">{item.label}</p>
                  <p className="text-[13px] font-semibold text-[var(--foreground)]">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="mb-5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-3">Tarefas</p>
              <div className="space-y-1.5">
                {selectedProject.tasks.map(task => (
                  <label key={task.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[var(--secondary)] cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={() => toggleTask(selectedProject.id, task.id)}
                      className="w-3.5 h-3.5 rounded accent-[var(--primary)]"
                    />
                    <span className={`text-[13px] ${task.done ? "line-through text-[var(--muted-foreground)]" : "text-[var(--foreground)]"}`}>
                      {task.title}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-2">Tags</p>
              <div className="flex gap-1.5 flex-wrap">
                {selectedProject.tags.map(tag => (
                  <span key={tag} className="text-[11px] px-2.5 py-1 rounded-full bg-[var(--accent)] text-[var(--accent-foreground)] font-medium">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
