import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Plus, CheckSquare, ChevronRight, Tag } from "lucide-react";
import { openQuickAdd } from "@/presentation/components/QuickAddModal";
import { useData } from "@/application/state/DataContext";
import { nextId } from "@/application/state/DataContext";
import { formatCivilDate } from "@/shared/datetime/dates";
import { api } from "@/infrastructure/http/apiClient";

const statusColor: Record<string, { bg: string; text: string; dot: string }> = {
  "Em andamento": { bg: "#EFF6FF", text: "#1D4ED8", dot: "#2563EB" },
  "Planejado": { bg: "#F0FDF4", text: "#065F46", dot: "#059669" },
  "Pausado": { bg: "#FEF3C7", text: "#92400E", dot: "#D97706" },
  "Concluído": { bg: "#F5F3FF", text: "#5B21B6", dot: "#7C3AED" },
};

export default function Projects() {
  const location = useLocation();
  const { data, setData, reload } = useData();
  const projects = data.projects;
  const [selected, setSelected] = useState<number | null>(null);
  const [newTask, setNewTask] = useState("");
  const [newTag, setNewTag] = useState("");
  useEffect(() => { const id = location.pathname.split("/")[2]; const project = projects.find(item => item.serverId === id); if (project) setSelected(project.id); }, [location.pathname, projects]);

  const selectedProject = projects.find(p => p.id === selected);

  const toggleTask = (projectId: number, taskId: number) => {
    setData(current => ({ ...current, projects: current.projects.map(project => {
      if (project.id !== projectId) return project;
      const tasks = project.tasks.map(task => task.id === taskId ? { ...task, done: !task.done } : task);
      const progress = tasks.length ? Math.round(tasks.filter(task => task.done).length / tasks.length * 100) : 0;
      return { ...project, tasks, progress, status: progress === 100 ? "Concluído" : project.status === "Concluído" ? "Em andamento" : project.status };
    }) }));
  };

  const addProjectTask = () => {
    if (!selectedProject || !newTask.trim()) return;
    setData(current => ({ ...current, projects: current.projects.map(project => project.id === selectedProject.id ? { ...project, tasks: [...project.tasks, { id: nextId(project.tasks), title: newTask.trim(), done: false }], progress: Math.round(project.tasks.filter(task => task.done).length / (project.tasks.length + 1) * 100) } : project) }));
    setNewTask("");
  };

  return (
    <div className="p-6" style={{ fontFamily: "var(--font-ui)" }}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[22px] font-semibold text-[var(--foreground)]">Projetos</h1>
        <button onClick={() => openQuickAdd("project")} className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium rounded-lg bg-[var(--primary)] text-white hover:bg-blue-700">
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
            <input aria-label="Nome do projeto" value={selectedProject.name} onChange={event => setData(current => ({ ...current, projects: current.projects.map(project => project.id === selectedProject.id ? { ...project, name: event.target.value } : project) }))} className="text-[15px] font-semibold bg-transparent flex-1" />
            <button onClick={() => setSelected(null)} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">✕</button>
          </div>

          <div className="p-5">
            <label className="field-label mb-4">Descrição<textarea value={selectedProject.description} onChange={event => setData(current => ({ ...current, projects: current.projects.map(project => project.id === selectedProject.id ? { ...project, description: event.target.value } : project) }))} className="field-input min-h-20" /></label>
            <div className="grid grid-cols-2 gap-3 mb-5"><label className="field-label">Status<select value={selectedProject.status} onChange={event => setData(current => ({ ...current, projects: current.projects.map(project => project.id === selectedProject.id ? { ...project, status: event.target.value } : project) }))} className="field-input"><option>Planejado</option><option>Em andamento</option><option>Pausado</option><option>Concluído</option></select></label><label className="field-label">Prazo<input type="date" value={selectedProject.deadline} onChange={event => setData(current => ({ ...current, projects: current.projects.map(project => project.id === selectedProject.id ? { ...project, deadline: event.target.value } : project) }))} className="field-input" /></label></div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              {[
                { label: "Status", value: selectedProject.status },
                { label: "Prazo", value: formatCivilDate(selectedProject.deadline) },
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
              <div className="flex gap-2 mt-3"><input value={newTask} onChange={event => setNewTask(event.target.value)} onKeyDown={event => event.key === "Enter" && addProjectTask()} placeholder="Nova tarefa" className="field-input mt-0" /><button onClick={addProjectTask} className="px-3 bg-[var(--primary)] text-white rounded-lg text-[12px]">Adicionar</button></div>
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-2">Tags</p>
              <div className="flex gap-1.5 flex-wrap">
                {selectedProject.tags.map(tag => (
                  <span key={tag} className="text-[11px] px-2.5 py-1 rounded-full bg-[var(--accent)] text-[var(--accent-foreground)] font-medium">{tag} {selectedProject.serverId && selectedProject.tagIds?.[tag] && <button aria-label={`Remover tag ${tag}`} onClick={async () => { await api.delete(`/api/v1/projects/${selectedProject.serverId}/tags/${selectedProject.tagIds?.[tag]}`); await reload(); }}>×</button>}</span>
                ))}
                {selectedProject.serverId && <form onSubmit={async event => { event.preventDefault(); if (!newTag.trim()) return; const tag = await api.post<{ id: string }>("/api/v1/tags/ensure", { name: newTag }); await api.post(`/api/v1/projects/${selectedProject.serverId}/tags/${tag.id}`); setNewTag(""); await reload(); }} className="flex gap-1"><input aria-label="Nova tag" value={newTag} onChange={event => setNewTag(event.target.value)} className="w-20 text-xs border-b bg-transparent" /><button className="text-xs text-[var(--primary)]">+</button></form>}
              </div>
            </div>
            <button onClick={() => { setData(current => ({ ...current, projects: current.projects.filter(project => project.id !== selectedProject.id) })); setSelected(null); }} className="mt-6 text-[12px] text-red-500 hover:underline">Excluir projeto</button>
          </div>
        </div>
      )}
    </div>
  );
}
