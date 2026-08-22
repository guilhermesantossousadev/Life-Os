import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Search, Star, FileText, Plus, Trash2 } from "lucide-react";
import { openQuickAdd } from "../components/QuickAddModal";
import { today, useData } from "../context/DataContext";
import ReactMarkdown from "react-markdown";
import { api } from "../services/api";

const catColors: Record<string, string> = {
  Estudos: "#7C3AED", Projetos: "#2563EB", Trabalho: "#059669",
  Pessoal: "#D97706", Geral: "#6B7280",
};

export default function Notes() {
  const location = useLocation();
  const { data, setData, saveStatus, reload } = useData();
  const notes = data.notes;
  const [selected, setSelected] = useState(data.notes[0]?.id ?? 0);
  const [search, setSearch] = useState("");
  const [filterFav, setFilterFav] = useState(false);
  const [preview, setPreview] = useState(false);
  const [newTag, setNewTag] = useState("");
  useEffect(() => { const id = location.pathname.split("/")[2]; const note = notes.find(item => item.serverId === id); if (note) setSelected(note.id); }, [location.pathname, notes]);

  const filtered = notes.filter(n => {
    const matchSearch = n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase());
    const matchFav = filterFav ? n.favorite : true;
    return matchSearch && matchFav;
  });

  const selectedNote = notes.find(n => n.id === selected);

  return (
    <div className="flex h-full" style={{ fontFamily: "var(--font-ui)" }}>
      {/* Sidebar */}
      <div className="w-72 flex-shrink-0 border-r border-[var(--border)] bg-white flex flex-col">
        <div className="p-4 border-b border-[var(--border)]">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-[15px] font-semibold text-[var(--foreground)]">Notas</h1>
            <button onClick={() => openQuickAdd("note")} className="w-7 h-7 flex items-center justify-center rounded-lg bg-[var(--primary)] text-white hover:bg-blue-700 transition-colors">
              <Plus size={13} />
            </button>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--secondary)]">
            <Search size={13} className="text-[var(--muted-foreground)]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Pesquisar..."
              className="flex-1 text-[13px] bg-transparent text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]"
            />
          </div>
          <button
            onClick={() => setFilterFav(f => !f)}
            className={`mt-2 flex items-center gap-1.5 text-[12px] px-2 py-1 rounded-lg transition-colors ${filterFav ? "text-amber-600 bg-amber-50" : "text-[var(--muted-foreground)] hover:bg-[var(--secondary)]"}`}
          >
            <Star size={11} fill={filterFav ? "currentColor" : "none"} /> Favoritas
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {filtered.map(note => (
            <button
              key={note.id}
              onClick={() => setSelected(note.id)}
              className={`w-full text-left px-4 py-3 hover:bg-[var(--secondary)] transition-colors border-b border-[var(--border)]/50 ${selected === note.id ? "bg-[var(--accent)]" : ""}`}
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[13px] font-medium text-[var(--foreground)] truncate">{note.title}</span>
                {note.favorite && <Star size={10} className="text-amber-400 flex-shrink-0 ml-1" fill="currentColor" />}
              </div>
              <p className="text-[11px] text-[var(--muted-foreground)] truncate">{note.content.slice(0, 60)}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: (catColors[note.category] || "#6B7280") + "18", color: catColors[note.category] || "#6B7280" }}>
                  {note.category}
                </span>
                <span className="text-[10px] text-[var(--muted-foreground)]">{note.updated}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Editor area */}
      <div className="flex-1 overflow-y-auto bg-white">
        {selectedNote ? (
          <div className="max-w-2xl mx-auto p-8">
            <div className="flex items-start justify-between mb-2">
              <input aria-label="Título da nota" value={selectedNote.title} onChange={event => setData(current => ({ ...current, notes: current.notes.map(note => note.id === selectedNote.id ? { ...note, title: event.target.value, updated: today() } : note) }))} className="text-[22px] font-bold text-[var(--foreground)] leading-tight bg-transparent flex-1" />
              <button aria-label="Favoritar nota" onClick={() => setData(current => ({ ...current, notes: current.notes.map(note => note.id === selectedNote.id ? { ...note, favorite: !note.favorite } : note) }))}><Star size={16} className={selectedNote.favorite ? "text-amber-400" : "text-[var(--muted-foreground)]"} fill={selectedNote.favorite ? "currentColor" : "none"} /></button>
              <button aria-label="Excluir nota" onClick={() => { setData(current => ({ ...current, notes: current.notes.filter(note => note.id !== selectedNote.id) })); setSelected(0); }} className="ml-2 text-[var(--muted-foreground)] hover:text-red-500"><Trash2 size={15} /></button>
            </div>
            <div className="flex items-center gap-2 mb-6">
              <span className="text-[11.5px] px-2 py-0.5 rounded-full font-medium" style={{ background: (catColors[selectedNote.category] || "#6B7280") + "18", color: catColors[selectedNote.category] || "#6B7280" }}>
                {selectedNote.category}
              </span>
              {selectedNote.tags.map(tag => (
                <span key={tag} className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--secondary)] text-[var(--muted-foreground)]">#{tag} {selectedNote.serverId && selectedNote.tagIds?.[tag] && <button aria-label={`Remover tag ${tag}`} onClick={async () => { await api.delete(`/api/v1/notes/${selectedNote.serverId}/tags/${selectedNote.tagIds?.[tag]}`); await reload(); }}>×</button>}</span>
              ))}
              {selectedNote.serverId && <form onSubmit={async event => { event.preventDefault(); if (!newTag.trim()) return; const tag = await api.post<{ id: string }>("/api/v1/tags/ensure", { name: newTag }); await api.post(`/api/v1/notes/${selectedNote.serverId}/tags/${tag.id}`); setNewTag(""); await reload(); }} className="flex items-center gap-1"><input aria-label="Nova tag" value={newTag} onChange={event => setNewTag(event.target.value)} placeholder="tag" className="w-16 bg-transparent text-[11px] border-b" /><button className="text-[11px] text-[var(--primary)]">+</button></form>}
              <span className={`text-[11px] ml-auto ${saveStatus === "error" ? "text-red-600" : "text-[var(--muted-foreground)]"}`}>{saveStatus === "saving" ? "Salvando..." : saveStatus === "error" ? "Erro ao salvar" : saveStatus === "saved" ? "Salvo" : `Editada em ${selectedNote.updated}`}</span>
              <button onClick={() => setPreview(value => !value)} className="text-[11px] text-[var(--primary)]">{preview ? "Editar" : "Visualizar Markdown"}</button>
            </div>
            {preview ? <article className="prose prose-sm max-w-none min-h-[420px]"><ReactMarkdown>{selectedNote.content}</ReactMarkdown></article> : <textarea aria-label="Conteúdo da nota" value={selectedNote.content} onChange={event => setData(current => ({ ...current, notes: current.notes.map(note => note.id === selectedNote.id ? { ...note, content: event.target.value, updated: today() } : note) }))} className="w-full min-h-[420px] resize-none bg-transparent text-[13.5px] leading-relaxed" />}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-[var(--muted-foreground)]">
            <FileText size={32} className="mb-3 opacity-30" />
            <p className="text-[14px]">Selecione uma nota para visualizar</p>
          </div>
        )}
      </div>
    </div>
  );
}
