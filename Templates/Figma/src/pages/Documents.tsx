import { useState } from "react";
import { FileText, Search, Upload, Download, Tag, Filter } from "lucide-react";
import { mockDocuments } from "../data/mock";

const categories = ["Todos", "Pessoal", "Faculdade", "Trabalho", "Financeiro", "Veículos", "Certificados", "Contratos", "Outros"];

const catColors: Record<string, string> = {
  Pessoal: "#2563EB", Faculdade: "#7C3AED", Trabalho: "#059669",
  Financeiro: "#D97706", Veículos: "#EF4444", Certificados: "#6366F1",
  Contratos: "#0891B2", Outros: "#6B7280",
};

export default function Documents() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todos");

  const filtered = mockDocuments.filter(d => {
    const matchCat = activeCategory === "Todos" || d.category === activeCategory;
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.tags.some(t => t.includes(search.toLowerCase()));
    return matchCat && matchSearch;
  });

  return (
    <div className="p-6" style={{ fontFamily: "var(--font-ui)" }}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[22px] font-semibold text-[var(--foreground)]">Documentos</h1>
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium rounded-lg bg-[var(--primary)] text-white hover:bg-blue-700">
          <Upload size={14} /> Upload
        </button>
      </div>

      {/* Search + filter */}
      <div className="flex items-center gap-3 mb-5 max-w-2xl">
        <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-[var(--border)]">
          <Search size={13} className="text-[var(--muted-foreground)]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Pesquisar documentos..."
            className="flex-1 text-[13px] bg-transparent text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]"
          />
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--border)] bg-white text-[13px] text-[var(--muted-foreground)] hover:bg-[var(--secondary)]">
          <Filter size={13} /> Filtrar
        </button>
      </div>

      {/* Category tabs */}
      <div className="flex gap-1.5 mb-6 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-[12.5px] font-medium transition-colors ${
              activeCategory === cat
                ? "bg-[var(--primary)] text-white"
                : "bg-white border border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]/40"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-[var(--muted-foreground)]">
          <FileText size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-[14px]">Nenhum documento encontrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-w-5xl">
          {filtered.map(doc => {
            const color = catColors[doc.category] || "#6B7280";
            return (
              <div
                key={doc.id}
                className="bg-white rounded-xl border border-[var(--border)] p-4 cursor-pointer hover:border-[var(--primary)]/40 hover:shadow-sm transition-all group"
              >
                {/* Icon */}
                <div className="w-10 h-12 rounded-lg mb-3 flex items-center justify-center" style={{ background: color + "15" }}>
                  <FileText size={20} style={{ color }} />
                </div>

                <p className="text-[12.5px] font-medium text-[var(--foreground)] leading-tight mb-1 line-clamp-2">{doc.name}</p>

                <p className="text-[10.5px] px-1.5 py-0.5 rounded-full inline-block mb-2" style={{ background: color + "15", color }}>
                  {doc.category}
                </p>

                <div className="flex items-center gap-1.5 text-[10px] text-[var(--muted-foreground)]">
                  <span>{doc.size}</span>
                  <span>·</span>
                  <span>{doc.updated}</span>
                </div>

                <div className="flex gap-1 mt-2 flex-wrap">
                  {doc.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="flex items-center gap-0.5 text-[10px] text-[var(--muted-foreground)]">
                      <Tag size={8} />
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Actions on hover */}
                <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="w-full flex items-center justify-center gap-1 py-1.5 rounded-lg bg-[var(--secondary)] text-[11px] text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-colors">
                    <Download size={10} /> Baixar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
