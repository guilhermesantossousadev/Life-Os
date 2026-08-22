import { useState } from "react";
import { User, Palette, Bell, Link, Tag } from "lucide-react";

type Tab = "perfil" | "preferencias" | "categorias" | "notificacoes" | "integracoes";

const defaultCategories = ["Trabalho", "Pessoal", "Faculdade", "Saúde", "Finanças", "Lazer", "Estudos", "Carreira"];

export default function Settings() {
  const [tab, setTab] = useState<Tab>("perfil");
  const [theme, setTheme] = useState<"claro" | "escuro" | "automatico">("claro");
  const [name, setName] = useState("Guilherme");
  const [email, setEmail] = useState("guilherme@email.com");
  const [saved, setSaved] = useState(false);

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const tabs: { id: Tab; label: string; icon: typeof User }[] = [
    { id: "perfil", label: "Perfil", icon: User },
    { id: "preferencias", label: "Preferências", icon: Palette },
    { id: "categorias", label: "Categorias", icon: Tag },
    { id: "notificacoes", label: "Notificações", icon: Bell },
    { id: "integracoes", label: "Integrações", icon: Link },
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
                <div className="w-16 h-16 rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-[20px] font-bold">GS</div>
                <div>
                  <button className="text-[13px] text-[var(--primary)] hover:underline">Alterar foto</button>
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
                <button onClick={save} className="px-4 py-2 rounded-lg bg-[var(--primary)] text-white text-[13px] font-medium hover:bg-blue-700 transition-colors">
                  Salvar alterações
                </button>
                {saved && <span className="text-[12px] text-emerald-600">✓ Salvo com sucesso</span>}
              </div>
            </div>
          )}

          {/* Preferências */}
          {tab === "preferencias" && (
            <div>
              <h2 className="text-[15px] font-semibold text-[var(--foreground)] mb-5">Aparência</h2>
              <div className="space-y-3 mb-8">
                {(["claro", "escuro", "automatico"] as const).map(t => (
                  <label key={t} className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${theme === t ? "border-[var(--primary)] bg-[var(--accent)]" : "border-[var(--border)] hover:border-[var(--primary)]/40"}`}>
                    <input type="radio" checked={theme === t} onChange={() => setTheme(t)} className="accent-[var(--primary)]" />
                    <div>
                      <p className="text-[13.5px] font-medium text-[var(--foreground)] capitalize">{t === "automatico" ? "Automático" : t.charAt(0).toUpperCase() + t.slice(1)}</p>
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
                    <input type="checkbox" defaultChecked={pref.defaultChecked} className="w-4 h-4 accent-[var(--primary)]" />
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
                {defaultCategories.map(cat => (
                  <div key={cat} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-[var(--secondary)]">
                    <span className="text-[13.5px] text-[var(--foreground)]">{cat}</span>
                    <button className="text-[11px] text-[var(--muted-foreground)] hover:text-red-500 transition-colors">Remover</button>
                  </div>
                ))}
              </div>
              <button className="flex items-center gap-2 text-[13px] text-[var(--primary)] hover:underline">
                + Adicionar categoria
              </button>
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
                    <input type="checkbox" defaultChecked className="w-4 h-4 accent-[var(--primary)]" />
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
                  { name: "Google Calendar", desc: "Sincronize eventos bidirecionalmente", status: "Disponível em breve" },
                  { name: "Google Drive", desc: "Armazene documentos na nuvem", status: "Disponível em breve" },
                  { name: "Gmail", desc: "Crie tarefas a partir de emails", status: "Planejado" },
                  { name: "Bancos (Open Finance)", desc: "Importe transações automaticamente", status: "Planejado" },
                  { name: "Notion", desc: "Importe notas e projetos", status: "Planejado" },
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
        </div>
      </div>
    </div>
  );
}
