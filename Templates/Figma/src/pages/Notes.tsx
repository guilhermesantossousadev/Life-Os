import { useState } from "react";
import { Search, Star, FileText, Plus } from "lucide-react";
import { mockNotes } from "../data/mock";

const catColors: Record<string, string> = {
  Estudos: "#7C3AED", Projetos: "#2563EB", Trabalho: "#059669",
  Pessoal: "#D97706", Geral: "#6B7280",
};

export default function Notes() {
  const [notes] = useState(mockNotes);
  const [selected, setSelected] = useState(mockNotes[0].id);
  const [search, setSearch] = useState("");
  const [filterFav, setFilterFav] = useState(false);

  const filtered = notes.filter(n => {
    const matchSearch = n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase());
    const matchFav = filterFav ? n.favorite : true;
    return matchSearch && matchFav;
  });

  const selectedNote = notes.find(n => n.id === selected);

  const renderContent = (content: string) => {
    return content.split("\n").map((line, i) => {
      if (line.startsWith("## ")) return <h2 key={i} className="text-[16px] font-semibold text-[var(--foreground)] mt-4 mb-2">{line.slice(3)}</h2>;
      if (line.startsWith("# ")) return <h1 key={i} className="text-[18px] font-bold text-[var(--foreground)] mt-4 mb-2">{line.slice(2)}</h1>;
      if (line.startsWith("- ")) return <li key={i} className="text-[13.5px] text-[var(--foreground)] ml-4 list-disc">{line.slice(2)}</li>;
      if (line.startsWith("```")) return <div key={i} className="bg-[var(--secondary)] rounded-lg p-3 mt-2 mb-2 font-mono text-[12px] text-[var(--foreground)]">{""}</div>;
      if (line.match(/^\d+\. /)) return <li key={i} className="text-[13.5px] text-[var(--foreground)] ml-4 list-decimal">{line.replace(/^\d+\. /, "")}</li>;
      if (line === "") return <br key={i} />;
      return <p key={i} className="text-[13.5px] text-[var(--foreground)] leading-relaxed">{line}</p>;
    });
  };

  return (
    <div className="flex h-full" style={{ fontFamily: "var(--font-ui)" }}>
      {/* Sidebar */}
      <div className="w-72 flex-shrink-0 border-r border-[var(--border)] bg-white flex flex-col">
        <div className="p-4 border-b border-[var(--border)]">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-[15px] font-semibold text-[var(--foreground)]">Notas</h1>
            <button className="w-7 h-7 flex items-center justify-center rounded-lg bg-[var(--primary)] text-white hover:bg-blue-700 transition-colors">
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
              <h1 className="text-[22px] font-bold text-[var(--foreground)] leading-tight">{selectedNote.title}</h1>
              {selectedNote.favorite && <Star size={16} className="text-amber-400 flex-shrink-0 mt-1" fill="currentColor" />}
            </div>
            <div className="flex items-center gap-2 mb-6">
              <span className="text-[11.5px] px-2 py-0.5 rounded-full font-medium" style={{ background: (catColors[selectedNote.category] || "#6B7280") + "18", color: catColors[selectedNote.category] || "#6B7280" }}>
                {selectedNote.category}
              </span>
              {selectedNote.tags.map(tag => (
                <span key={tag} className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--secondary)] text-[var(--muted-foreground)]">#{tag}</span>
              ))}
              <span className="text-[11px] text-[var(--muted-foreground)] ml-auto">Editada em {selectedNote.updated}</span>
            </div>
            <div className="prose prose-sm max-w-none">
              {renderContent(selectedNote.content)}
            </div>
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
