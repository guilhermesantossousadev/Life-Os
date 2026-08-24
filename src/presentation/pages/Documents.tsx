import { useEffect, useRef, useState } from "react"
import { useLocation } from "react-router-dom"
import {
  Download,
  FileText,
  Filter,
  Search,
  Tag,
  Trash2,
  Upload,
} from "lucide-react"
import { useData } from "@/application/state/DataContext"
import { documentsApi } from "@/infrastructure/http/resourceGateway"

const categories = [
  "Todos",
  "Pessoal",
  "Faculdade",
  "Trabalho",
  "Financeiro",
  "Veículos",
  "Certificados",
  "Contratos",
  "Outros",
]
const catColors: Record<string, string> = {
  Pessoal: "#2563EB",
  Faculdade: "#7C3AED",
  Trabalho: "#059669",
  Financeiro: "#D97706",
  Veículos: "#EF4444",
  Certificados: "#6366F1",
  Contratos: "#0891B2",
  Outros: "#6B7280",
}

export default function Documents() {
  const location = useLocation()
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState("Todos")
  const [newestFirst, setNewestFirst] = useState(true)
  const [status, setStatus] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [editing, setEditing] = useState<number | null>(null)
  const [editName, setEditName] = useState("")
  const [editCategory, setEditCategory] = useState("Outros")
  const [editTags, setEditTags] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const { data, reload } = useData()
  useEffect(() => {
    const id = new URLSearchParams(location.search).get("document")
    const document = data.documents.find((item) => item.serverId === id)
    if (document) {
      setEditing(document.id)
      setEditName(document.name)
      setEditCategory(document.category)
      setEditTags(document.tags.join(", "))
    }
  }, [data.documents, location.search])

  const filtered = data.documents
    .filter(
      (document) =>
        (activeCategory === "Todos" || document.category === activeCategory) &&
        (document.name.toLowerCase().includes(search.toLowerCase()) ||
          document.tags.some((tag) => tag.includes(search.toLowerCase()))),
    )
    .sort((a, b) =>
      newestFirst
        ? b.updated.localeCompare(a.updated)
        : a.name.localeCompare(b.name),
    )

  const upload = async (files: FileList | null) => {
    if (!files) return
    setBusy(true)
    setStatus(null)
    try {
      for (const file of Array.from(files))
        await documentsApi.upload(
          file,
          file.name.replace(/\.[^.]+$/, ""),
          activeCategory === "Todos" ? "Outros" : activeCategory,
        )
      await reload()
      setStatus("Upload concluído.")
    } catch (reason) {
      setStatus(reason instanceof Error ? reason.message : "Falha no upload.")
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  const download = async (serverId?: string) => {
    if (!serverId) return
    setStatus(null)
    try {
      const { url } = await documentsApi.signedUrl(serverId)
      window.open(url, "_blank", "noopener,noreferrer")
    } catch (reason) {
      setStatus(reason instanceof Error ? reason.message : "Falha no download.")
    }
  }

  const remove = async (serverId?: string) => {
    if (!serverId) return
    setBusy(true)
    try {
      await documentsApi.remove(serverId)
      await reload()
      setStatus("Documento excluído.")
    } catch (reason) {
      setStatus(reason instanceof Error ? reason.message : "Falha ao excluir.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="p-6" style={{ fontFamily: "var(--font-ui)" }}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[22px] font-semibold">Documentos</h1>
        <input
          ref={inputRef}
          aria-label="Selecionar documentos"
          type="file"
          multiple
          accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.xls,.xlsx,.txt,.csv"
          className="hidden"
          onChange={(event) => void upload(event.target.files)}
        />
        <button
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium rounded-lg bg-[var(--primary)] text-white disabled:opacity-60"
        >
          <Upload size={14} /> {busy ? "Enviando..." : "Upload"}
        </button>
      </div>
      {status && (
        <p
          role="status"
          className="mb-4 text-sm rounded-lg bg-[var(--secondary)] px-3 py-2"
        >
          {status}
        </p>
      )}
      <div className="flex items-center gap-3 mb-5 max-w-2xl">
        <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-[var(--border)]">
          <Search size={13} />
          <input
            aria-label="Pesquisar documentos"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Pesquisar documentos..."
            className="flex-1 text-[13px] bg-transparent"
          />
        </div>
        <button
          onClick={() => setNewestFirst((value) => !value)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--border)] bg-white text-[13px]"
        >
          <Filter size={13} /> {newestFirst ? "Recentes" : "A–Z"}
        </button>
      </div>
      <div className="flex gap-1.5 mb-6 flex-wrap">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-3 py-1.5 rounded-full text-[12.5px] font-medium ${
              activeCategory === category
                ? "bg-[var(--primary)] text-white"
                : "bg-white border border-[var(--border)]"
            }`}
          >
            {category}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-[var(--muted-foreground)]">
          <FileText size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-[14px]">Nenhum documento encontrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-w-5xl">
          {filtered.map((document) => {
            const color = catColors[document.category] || "#6B7280"
            return (
              <article
                key={document.id}
                className="bg-white rounded-xl border border-[var(--border)] p-4 hover:shadow-sm"
              >
                <div
                  className="w-10 h-12 rounded-lg mb-3 flex items-center justify-center"
                  style={{ background: color + "15" }}
                >
                  <FileText size={20} style={{ color }} />
                </div>
                <p className="text-[12.5px] font-medium leading-tight mb-1 line-clamp-2">
                  {document.name}
                </p>
                <p
                  className="text-[10.5px] px-1.5 py-0.5 rounded-full inline-block mb-2"
                  style={{ background: color + "15", color }}
                >
                  {document.category}
                </p>
                <div className="text-[10px] text-[var(--muted-foreground)]">
                  {document.size} · {document.updated}
                </div>
                <div className="flex gap-1 mt-2">
                  {document.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-0.5 text-[10px]"
                    >
                      <Tag size={8} />
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex gap-2 mt-3 flex-wrap">
                  <button
                    aria-label={`Baixar ${document.name}`}
                    onClick={() => void download(document.serverId)}
                    className="text-[11px] text-[var(--primary)] flex items-center gap-1"
                  >
                    <Download size={11} />
                    Baixar
                  </button>
                  <button
                    onClick={() => {
                      setEditing(document.id)
                      setEditName(document.name)
                      setEditCategory(document.category)
                      setEditTags(document.tags.join(", "))
                    }}
                    className="text-[11px]"
                  >
                    Editar
                  </button>
                  <button
                    aria-label={`Excluir ${document.name}`}
                    disabled={busy}
                    onClick={() => void remove(document.serverId)}
                    className="text-[11px] text-red-600 flex items-center gap-1"
                  >
                    <Trash2 size={11} />
                    Excluir
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      )}
      {editing !== null &&
        (() => {
          const document = data.documents.find((item) => item.id === editing)
          return document ? (
            <div className="fixed inset-0 z-50 bg-black/30 grid place-items-center p-4">
              <div
                role="dialog"
                aria-modal="true"
                aria-label="Editar documento"
                className="w-full max-w-md bg-white rounded-2xl p-6"
              >
                <h2 className="text-lg font-semibold mb-4">Editar documento</h2>
                <div className="space-y-3">
                  <label className="field-label">
                    Nome
                    <input
                      value={editName}
                      onChange={(event) => setEditName(event.target.value)}
                      className="field-input"
                    />
                  </label>
                  <label className="field-label">
                    Categoria
                    <select
                      value={editCategory}
                      onChange={(event) => setEditCategory(event.target.value)}
                      className="field-input"
                    >
                      {categories
                        .filter((item) => item !== "Todos")
                        .map((item) => (
                          <option key={item}>{item}</option>
                        ))}
                    </select>
                  </label>
                  <label className="field-label">
                    Tags, separadas por vírgula
                    <input
                      value={editTags}
                      onChange={(event) => setEditTags(event.target.value)}
                      className="field-input"
                    />
                  </label>
                </div>
                <div className="flex justify-end gap-2 mt-5">
                  <button
                    onClick={() => setEditing(null)}
                    className="px-4 py-2 border rounded-lg text-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={async () => {
                      if (!document.serverId) return
                      await documentsApi.rename(
                        document.serverId,
                        editName,
                        editCategory,
                        editTags
                          .split(",")
                          .map((value) => value.trim())
                          .filter(Boolean),
                      )
                      setEditing(null)
                      await reload()
                    }}
                    className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm"
                  >
                    Salvar
                  </button>
                </div>
              </div>
            </div>
          ) : null
        })()}
    </div>
  )
}
