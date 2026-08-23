import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Plus, Flag, Pencil, Trash2 } from "lucide-react";
import { nextId, today, useData } from "@/application/state/DataContext";

type View = "hoje" | "proximas" | "todas" | "concluidas";

const priorityColor: Record<string, string> = {
  alta: "#EF4444",
  normal: "#F59E0B",
  baixa: "#6B7280",
};

export default function Tasks() {
  const location = useLocation();
  const [view, setView] = useState<View>("hoje");
  const { data, setData } = useData();
  const tasks = data.tasks;
  const [quickAdd, setQuickAdd] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [subtaskTitle, setSubtaskTitle] = useState("");
  useEffect(() => {
    const id = location.pathname.split("/")[2];
    if (!id) return;
    const task = tasks.find(item => item.serverId === id);
    if (task) { setView(task.done ? "concluidas" : "todas"); setEditing(task.id); }
  }, [location.pathname, tasks]);

  const todayStr = today();

  const filtered = (() => {
    switch (view) {
      case "hoje": return tasks.filter(t => t.date === todayStr && !t.done);
      case "proximas": return tasks.filter(t => t.date > todayStr && !t.done);
      case "todas": return tasks.filter(t => !t.done);
      case "concluidas": return tasks.filter(t => t.done);
    }
  })();

  const toggle = (id: number) => setData(current => ({ ...current, tasks: current.tasks.map(task => task.id === id ? { ...task, done: !task.done } : task) }));
  const remove = (id: number) => setData(current => ({ ...current, tasks: current.tasks.filter(task => task.id !== id) }));

  const addTask = () => {
    if (!quickAdd.trim()) return;
    setData(current => ({ ...current, tasks: [...current.tasks, {
      id: nextId(current.tasks), title: quickAdd.trim(), done: false,
      priority: "normal", category: "Pessoal", date: todayStr, project: null,
    }] }));
    setQuickAdd("");
    setShowAdd(false);
  };

  const views: { id: View; label: string; count: number }[] = [
    { id: "hoje", label: "Hoje", count: tasks.filter(t => t.date === todayStr && !t.done).length },
    { id: "proximas", label: "Próximas", count: tasks.filter(t => t.date > todayStr && !t.done).length },
    { id: "todas", label: "Todas", count: tasks.filter(t => !t.done).length },
    { id: "concluidas", label: "Concluídas", count: tasks.filter(t => t.done).length },
  ];

  return (
    <div className="p-6 max-w-2xl mx-auto" style={{ fontFamily: "var(--font-ui)" }}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[22px] font-semibold text-[var(--foreground)]">Tarefas</h1>
        <button
          onClick={() => setShowAdd(s => !s)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium rounded-lg bg-[var(--primary)] text-white hover:bg-blue-700 transition-colors"
        >
          <Plus size={14} /> Nova tarefa
        </button>
      </div>

      {/* Quick add */}
      {showAdd && (
        <div className="bg-white rounded-xl border border-[var(--primary)]/30 p-4 mb-4 shadow-sm">
          <input
            autoFocus
            value={quickAdd}
            onChange={e => setQuickAdd(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") addTask(); if (e.key === "Escape") setShowAdd(false); }}
            placeholder="Título da tarefa..."
            className="w-full text-[14px] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] bg-transparent mb-3"
          />
          <div className="flex items-center gap-2">
            <button onClick={addTask} className="px-3 py-1.5 bg-[var(--primary)] text-white text-[12px] rounded-lg hover:bg-blue-700">Adicionar</button>
            <button onClick={() => setShowAdd(false)} className="px-3 py-1.5 text-[12px] text-[var(--muted-foreground)] hover:bg-[var(--secondary)] rounded-lg">Cancelar</button>
          </div>
        </div>
      )}

      {/* View tabs */}
      <div className="flex gap-1 mb-6 bg-[var(--secondary)] p-1 rounded-xl w-fit">
        {views.map(v => (
          <button
            key={v.id}
            onClick={() => setView(v.id)}
            className={`px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
              view === v.id ? "bg-white text-[var(--foreground)] shadow-sm" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            {v.label}
            {v.count > 0 && (
              <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full ${view === v.id ? "bg-[var(--primary)] text-white" : "bg-[var(--border)] text-[var(--muted-foreground)]"}`}>
                {v.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Task list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-12 h-12 rounded-2xl bg-[var(--secondary)] flex items-center justify-center mx-auto mb-3">
            <Plus size={20} className="text-[var(--muted-foreground)]" />
          </div>
          <p className="text-[14px] font-medium text-[var(--foreground)]">Nenhuma tarefa aqui</p>
          <p className="text-[13px] text-[var(--muted-foreground)] mt-1">Aproveite ou adicione uma nova.</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {filtered.map(task => (
            <div
              key={task.id}
              className="bg-white rounded-xl border border-[var(--border)] hover:border-[var(--primary)]/30 transition-all group"
            >
              <div className="flex items-start gap-3 px-4 py-3.5">
                <input
                  type="checkbox"
                  aria-label={`Concluir tarefa ${task.title}`}
                  checked={task.done}
                  onChange={() => toggle(task.id)}
                  className="mt-0.5 w-3.5 h-3.5 rounded accent-[var(--primary)]"
                />
                <div className="flex-1 min-w-0">
                  <p className={`text-[13.5px] ${task.done ? "line-through text-[var(--muted-foreground)]" : "text-[var(--foreground)]"}`}>
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {task.date && <span className="text-[11px] text-[var(--muted-foreground)]">{task.date}</span>}
                    <span className="text-[11px] text-[var(--muted-foreground)]">·</span>
                    <span className="text-[11px] text-[var(--muted-foreground)]">{task.category}</span>
                    {task.project && (
                      <>
                        <span className="text-[11px] text-[var(--muted-foreground)]">·</span>
                        <span className="text-[11px] text-[var(--primary)]">{task.project}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Flag size={12} style={{ color: priorityColor[task.priority] }} />
                  <button aria-label="Editar tarefa" onClick={() => setEditing(editing === task.id ? null : task.id)} className="opacity-0 group-hover:opacity-100 p-1 text-[var(--muted-foreground)] hover:text-[var(--primary)] focus:opacity-100"><Pencil size={12} /></button>
                  <button aria-label="Excluir tarefa" onClick={() => remove(task.id)} className="opacity-0 group-hover:opacity-100 p-1 text-[var(--muted-foreground)] hover:text-red-500 focus:opacity-100"><Trash2 size={12} /></button>
                </div>
              </div>
              {editing === task.id && <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 px-4 pb-4 border-t border-[var(--border)] pt-3"><label className="sm:col-span-4 field-label">Título<input value={task.title} onChange={event => setData(current => ({ ...current, tasks: current.tasks.map(item => item.id === task.id ? { ...item, title: event.target.value } : item) }))} className="field-input" /></label><label className="field-label">Data<input type="date" value={task.date} onChange={event => setData(current => ({ ...current, tasks: current.tasks.map(item => item.id === task.id ? { ...item, date: event.target.value } : item) }))} className="field-input" /></label><label className="field-label">Prioridade<select value={task.priority} onChange={event => setData(current => ({ ...current, tasks: current.tasks.map(item => item.id === task.id ? { ...item, priority: event.target.value } : item) }))} className="field-input"><option value="baixa">Baixa</option><option value="normal">Normal</option><option value="alta">Alta</option></select></label><label className="field-label">Categoria<select value={task.category} onChange={event => setData(current => ({ ...current, tasks: current.tasks.map(item => item.id === task.id ? { ...item, category: event.target.value } : item) }))} className="field-input">{data.categories.map(category => <option key={category}>{category}</option>)}</select></label><label className="field-label">Projeto<select value={task.project ?? ""} onChange={event => setData(current => ({ ...current, tasks: current.tasks.map(item => item.id === task.id ? { ...item, project: event.target.value || null } : item) }))} className="field-input"><option value="">Nenhum</option>{data.projects.map(project => <option key={project.id}>{project.name}</option>)}</select></label><div className="sm:col-span-4"><p className="field-label mb-2">Subtarefas</p>{(task.subtasks ?? []).map(subtask => <div key={subtask.id} className="flex items-center gap-2 py-1"><input type="checkbox" checked={subtask.done} onChange={() => setData(current => ({ ...current, tasks: current.tasks.map(item => item.id === task.id ? { ...item, subtasks: (item.subtasks ?? []).map(child => child.id === subtask.id ? { ...child, done: !child.done } : child) } : item) }))} /><input aria-label="Título da subtarefa" value={subtask.title} onChange={event => setData(current => ({ ...current, tasks: current.tasks.map(item => item.id === task.id ? { ...item, subtasks: (item.subtasks ?? []).map(child => child.id === subtask.id ? { ...child, title: event.target.value } : child) } : item) }))} className="flex-1 bg-transparent text-sm" /><button aria-label="Excluir subtarefa" onClick={() => setData(current => ({ ...current, tasks: current.tasks.map(item => item.id === task.id ? { ...item, subtasks: (item.subtasks ?? []).filter(child => child.id !== subtask.id) } : item) }))} className="text-red-500"><Trash2 size={12} /></button></div>)}<div className="flex gap-2 mt-2"><input value={subtaskTitle} onChange={event => setSubtaskTitle(event.target.value)} placeholder="Nova subtarefa" className="field-input" /><button onClick={() => { if (!subtaskTitle.trim()) return; setData(current => ({ ...current, tasks: current.tasks.map(item => item.id === task.id ? { ...item, subtasks: [...(item.subtasks ?? []), { id: nextId(item.subtasks ?? []), title: subtaskTitle.trim(), done: false }] } : item) })); setSubtaskTitle(""); }} className="px-3 bg-[var(--primary)] text-white rounded-lg text-xs">Adicionar</button></div></div><div className="sm:col-span-4 flex justify-end"><button onClick={() => setEditing(null)} className="px-3 py-1.5 bg-[var(--primary)] text-white rounded-lg text-xs">Concluir edição</button></div></div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
