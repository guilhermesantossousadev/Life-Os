import { useRef, useState } from "react";
import { User, Palette, Bell, Link, Tag, Database } from "lucide-react";
import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { supabase } from "../services/supabase";

type Tab = "perfil" | "preferencias" | "categorias" | "notificacoes" | "integracoes" | "dados";

export default function Settings() {
  const [tab, setTab] = useState<Tab>("perfil");
  const { data, setData, exportData, importData, resetData } = useData();
  const { signOut } = useAuth();
  const [name, setName] = useState(data.user.name);
  const [email, setEmail] = useState(data.user.email);
  const [category, setCategory] = useState("");
  const [saved, setSaved] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const avatarRef = useRef<HTMLInputElement>(null);
  const backupRef = useRef<HTMLInputElement>(null);

  const save = async () => {
    setFeedback(null);
    if (email !== data.user.email) {
      const { error } = await supabase.auth.updateUser({ email });
      if (error) { setFeedback(error.message); return; }
    }
    setData(current => ({ ...current, user: { ...current.user, name, email, avatar: /^(data:|https?:)/.test(current.user.avatar) ? current.user.avatar : name.split(/\s+/).map(part => part[0]).join("").slice(0, 2).toUpperCase() } }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const tabs: { id: Tab; label: string; icon: typeof User }[] = [
    { id: "perfil", label: "Perfil", icon: User },
    { id: "preferencias", label: "Preferências", icon: Palette },
    { id: "categorias", label: "Categorias", icon: Tag },
    { id: "notificacoes", label: "Notificações", icon: Bell },
    { id: "integracoes", label: "Integrações", icon: Link },
    { id: "dados", label: "Dados", icon: Database },
  ];

  return (
    <div className="p-6" style={{ fontFamily: "var(--font-ui)" }}>
      <h1 className="text-[22px] font-semibold text-[var(--foreground)] mb-6">Configurações</h1>

      <div className="flex gap-6 max-w-4xl">
        {/* Sidebar */}
        <div className="w-48 flex-shrink-0">
          <nav className="space-y-0.5">
            {tabs.map(t => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${tab === t.id ? "bg-[var(--accent)] text-[var(--accent-foreground)]" : "text-[var(--muted-foreground)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)]"}`}
                >
                  <Icon size={14} />
                  {t.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 bg-white rounded-xl border border-[var(--border)] p-6">
          {/* Perfil */}
          {tab === "perfil" && (
            <div>
              <h2 className="text-[15px] font-semibold text-[var(--foreground)] mb-5">Informações pessoais</h2>
              <div className="flex items-center gap-5 mb-6 pb-6 border-b border-[var(--border)]">
                <div className="w-16 h-16 rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-[20px] font-bold overflow-hidden">{/^(data:|https?:)/.test(data.user.avatar) ? <img src={data.user.avatar} alt="Avatar" className="w-full h-full object-cover" /> : data.user.avatar}</div>
                <div>
                  <input ref={avatarRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={async event => { const file = event.target.files?.[0]; if (!file) return; const body = new FormData(); body.append("file", file); try { const result = await api.post<{ url: string }>("/api/v1/profile/avatar", body); setData(current => ({ ...current, user: { ...current.user, avatar: result.url } })); setFeedback("Avatar atualizado."); } catch (reason) { setFeedback(reason instanceof Error ? reason.message : "Falha no upload."); } }} />
                  <button onClick={() => avatarRef.current?.click()} className="text-[13px] text-[var(--primary)] hover:underline">Alterar foto</button>
                  <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">JPG, PNG até 2MB</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[12px] font-medium text-[var(--foreground)] mb-1.5 block">Nome</label>
                  <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] text-[13.5px] text-[var(--foreground)] bg-white focus:border-[var(--primary)] transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[12px] font-medium text-[var(--foreground)] mb-1.5 block">Email</label>
                  <input
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    type="email"
                    className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] text-[13.5px] text-[var(--foreground)] bg-white focus:border-[var(--primary)] transition-colors"
                  />
                </div>
              </div>
              <div className="mt-6 flex items-center gap-3">
                <button onClick={() => void save()} className="px-4 py-2 rounded-lg bg-[var(--primary)] text-white text-[13px] font-medium hover:bg-blue-700 transition-colors">
                  Salvar alterações
                </button>
                {saved && <span className="text-[12px] text-emerald-600">✓ Salvo com sucesso</span>}
                <button onClick={() => void signOut()} className="ml-auto px-4 py-2 rounded-lg border border-red-200 text-red-600 text-[13px]">Sair</button>
              </div>
              {feedback && <p role="status" className="mt-3 text-[12px] text-[var(--muted-foreground)]">{feedback}</p>}
            </div>
          )}

          {/* Preferências */}
          {tab === "preferencias" && (
            <div>
              <h2 className="text-[15px] font-semibold text-[var(--foreground)] mb-5">Aparência</h2>
              <div className="space-y-3 mb-8">
                {(["claro", "escuro", "sistema"] as const).map(t => (
                  <label key={t} className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${data.theme === t ? "border-[var(--primary)] bg-[var(--accent)]" : "border-[var(--border)] hover:border-[var(--primary)]/40"}`}>
                    <input type="radio" checked={data.theme === t} onChange={() => setData(current => ({ ...current, theme: t }))} className="accent-[var(--primary)]" />
                    <div>
                      <p className="text-[13.5px] font-medium text-[var(--foreground)] capitalize">{t === "sistema" ? "Automático" : t.charAt(0).toUpperCase() + t.slice(1)}</p>
                      <p className="text-[11.5px] text-[var(--muted-foreground)]">
                        {t === "claro" ? "Fundo branco, texto escuro" : t === "escuro" ? "Fundo escuro, texto claro" : "Segue o sistema operacional"}
                      </p>
                    </div>
                  </label>
                ))}
              </div>

              <h2 className="text-[15px] font-semibold text-[var(--foreground)] mb-4">Geral</h2>
              <div className="space-y-3">
                {[
                  { label: "Semana começa no domingo", defaultChecked: true },
                  { label: "Mostrar contagem de tarefas na sidebar", defaultChecked: true },
                  { label: "Confirmar antes de excluir", defaultChecked: true },
                  { label: "Modo foco (ocultar sidebar automaticamente)", defaultChecked: false },
                ].map(pref => (
                  <div key={pref.label} className="flex items-center justify-between py-3 border-b border-[var(--border)] last:border-0">
                    <span className="text-[13.5px] text-[var(--foreground)]">{pref.label}</span>
                    <input type="checkbox" checked={data.preferences[pref.label] ?? pref.defaultChecked} onChange={event => setData(current => ({ ...current, preferences: { ...current.preferences, [pref.label]: event.target.checked } }))} className="w-4 h-4 accent-[var(--primary)]" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Categorias */}
          {tab === "categorias" && (
            <div>
              <h2 className="text-[15px] font-semibold text-[var(--foreground)] mb-5">Categorias do sistema</h2>
              <div className="space-y-2 mb-4">
                {data.categories.map(cat => (
                  <div key={cat} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-[var(--secondary)]">
                    <span className="text-[13.5px] text-[var(--foreground)]">{cat}</span>
                    <button onClick={() => setData(current => ({ ...current, categories: current.categories.filter(item => item !== cat) }))} className="text-[11px] text-[var(--muted-foreground)] hover:text-red-500 transition-colors">Remover</button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2"><input value={category} onChange={event => setCategory(event.target.value)} onKeyDown={event => { if (event.key === "Enter" && category.trim()) { setData(current => ({ ...current, categories: [...new Set([...current.categories, category.trim()])] })); setCategory(""); } }} placeholder="Nova categoria" className="field-input" /><button onClick={() => { if (!category.trim()) return; setData(current => ({ ...current, categories: [...new Set([...current.categories, category.trim()])] })); setCategory(""); }} className="px-3 py-2 bg-[var(--primary)] text-white rounded-lg text-[12px]">Adicionar</button></div>
            </div>
          )}

          {/* Notificações */}
          {tab === "notificacoes" && (
            <div>
              <h2 className="text-[15px] font-semibold text-[var(--foreground)] mb-5">Lembretes</h2>
              <div className="space-y-3">
                {[
                  { label: "Tarefas com prazo hoje", sub: "Notificar às 8h" },
                  { label: "Contas próximas do vencimento", sub: "3 dias antes" },
                  { label: "Atividades da faculdade", sub: "5 dias antes" },
                  { label: "Próximas manutenções do veículo", sub: "7 dias antes" },
                  { label: "Resumo semanal", sub: "Toda segunda às 9h" },
                ].map(n => (
                  <div key={n.label} className="flex items-center justify-between py-3 border-b border-[var(--border)] last:border-0">
                    <div>
                      <p className="text-[13.5px] text-[var(--foreground)]">{n.label}</p>
                      <p className="text-[11.5px] text-[var(--muted-foreground)]">{n.sub}</p>
                    </div>
                    <input type="checkbox" checked={data.preferences[n.label] ?? true} onChange={event => setData(current => ({ ...current, preferences: { ...current.preferences, [n.label]: event.target.checked } }))} className="w-4 h-4 accent-[var(--primary)]" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Integrações */}
          {tab === "integracoes" && (
            <div>
              <h2 className="text-[15px] font-semibold text-[var(--foreground)] mb-2">Integrações</h2>
              <p className="text-[13px] text-[var(--muted-foreground)] mb-5">Conecte o Life OS com seus serviços favoritos.</p>
              <div className="space-y-3">
                {[
                  { name: "Google Calendar", desc: "Sincronize eventos bidirecionalmente", status: "Em breve" },
                  { name: "Google Drive", desc: "Armazene documentos na nuvem", status: "Em breve" },
                  { name: "Gmail", desc: "Crie tarefas a partir de emails", status: "Em breve" },
                  { name: "Bancos (Open Finance)", desc: "Importe transações automaticamente", status: "Em breve" },
                  { name: "Notion", desc: "Importe notas e projetos", status: "Em breve" },
                ].map(int => (
                  <div key={int.name} className="flex items-center justify-between p-4 rounded-xl border border-[var(--border)]">
                    <div>
                      <p className="text-[13.5px] font-medium text-[var(--foreground)]">{int.name}</p>
                      <p className="text-[11.5px] text-[var(--muted-foreground)]">{int.desc}</p>
                    </div>
                    <span className="text-[11px] font-medium text-[var(--muted-foreground)] bg-[var(--secondary)] px-2.5 py-1 rounded-full">{int.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "dados" && (
            <div>
              <h2 className="text-[15px] font-semibold mb-2">Backup dos dados</h2>
              <p className="text-[13px] text-[var(--muted-foreground)] mb-5">Exporte tudo para JSON ou restaure um backup anterior.</p>
              <input ref={backupRef} type="file" accept="application/json" className="hidden" onChange={async event => { const file = event.target.files?.[0]; if (!file) return; try { await importData(file); setSaved(true); setFeedback("Backup importado e enviado para a conta."); } catch (error) { setFeedback(error instanceof Error ? error.message : "Falha ao importar"); } }} />
              <div className="flex flex-wrap gap-2"><button onClick={exportData} className="px-4 py-2 rounded-lg bg-[var(--primary)] text-white text-[13px]">Exportar backup</button><button onClick={() => backupRef.current?.click()} className="px-4 py-2 rounded-lg border border-[var(--border)] text-[13px]">Importar backup</button><button onClick={() => setConfirmReset(true)} className="px-4 py-2 rounded-lg border border-red-200 text-red-600 text-[13px]">Apagar meus dados</button></div>
              {feedback && <p role="status" className="mt-3 text-sm text-[var(--muted-foreground)]">{feedback}</p>}
            </div>
          )}
        </div>
      </div>
      {confirmReset && <div className="fixed inset-0 z-50 bg-black/40 grid place-items-center p-4"><div role="alertdialog" aria-modal="true" aria-labelledby="reset-title" className="w-full max-w-md bg-white rounded-2xl p-6"><h2 id="reset-title" className="text-lg font-semibold">Apagar dados da conta?</h2><p className="text-sm text-[var(--muted-foreground)] mt-2">Esta ação exclui os registros organizacionais da API. Documentos devem ser excluídos individualmente para garantir a remoção do arquivo.</p><div className="mt-5 flex justify-end gap-2"><button onClick={() => setConfirmReset(false)} className="px-4 py-2 border rounded-lg text-sm">Cancelar</button><button onClick={() => { resetData(); setConfirmReset(false); }} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm">Apagar</button></div></div></div>}
    </div>
  );
}
