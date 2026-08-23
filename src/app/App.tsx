import { lazy, Suspense, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "@/presentation/components/Sidebar";
import TopBar from "@/presentation/components/TopBar";
import SearchModal from "@/presentation/components/SearchModal";
import QuickAddModal, { type AddType } from "@/presentation/components/QuickAddModal";
import type { Page } from "@/domain/navigation";
import { api } from "@/infrastructure/http/apiClient";
import { useData } from "@/application/state/DataContext";

const Dashboard = lazy(() => import("@/presentation/pages/Dashboard"));
const Inbox = lazy(() => import("@/presentation/pages/Inbox"));
const Tasks = lazy(() => import("@/presentation/pages/Tasks"));
const Agenda = lazy(() => import("@/presentation/pages/Agenda"));
const Goals = lazy(() => import("@/presentation/pages/Goals"));
const Finances = lazy(() => import("@/presentation/pages/Finances"));
const Studies = lazy(() => import("@/presentation/pages/Studies"));
const Career = lazy(() => import("@/presentation/pages/Career"));
const Projects = lazy(() => import("@/presentation/pages/Projects"));
const Notes = lazy(() => import("@/presentation/pages/Notes"));
const Assets = lazy(() => import("@/presentation/pages/Assets"));
const Documents = lazy(() => import("@/presentation/pages/Documents"));
const Assistant = lazy(() => import("@/presentation/pages/Assistant"));
const Settings = lazy(() => import("@/presentation/pages/Settings"));

const pageTitles: Record<Page, string> = {
  dashboard: "Início",
  inbox: "Inbox",
  agenda: "Agenda",
  tasks: "Tarefas",
  goals: "Metas",
  projects: "Projetos",
  notes: "Notas",
  finances: "Finanças",
  studies: "Estudos",
  career: "Carreira",
  assets: "Patrimônio",
  documents: "Documentos",
  assistant: "Assistente",
  settings: "Configurações",
};

export default function App() {
  const routerNavigate = useNavigate();
  const location = useLocation();
  const { data: appData, loading, error, reload, importData, saveStatus } = useData();
  const segment = location.pathname.split("/").filter(Boolean)[0];
  const page = (({ calendar: "agenda", dashboard: "dashboard" } as Record<string, Page>)[segment] ?? segment ?? "dashboard") as Page;
  const currentPage: Page = pageTitles[page] ? page : "dashboard";
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickAddType, setQuickAddType] = useState<AddType | null>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<{ title: string; route: string }[]>([]);
  const [legacyData, setLegacyData] = useState<string | null>(null);

  useEffect(() => {
    if (!segment || !pageTitles[page]) routerNavigate("/dashboard", { replace: true });
  }, [page, routerNavigate, segment]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(s => !s);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const open = (event: Event) => {
      setQuickAddType((event as CustomEvent<AddType>).detail);
      setQuickAddOpen(true);
    };
    window.addEventListener("lifeos:add", open);
    return () => window.removeEventListener("lifeos:add", open);
  }, []);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const handleQuickAddSuccess = (type: string) => {
    setToast(`${type} adicionado com sucesso!`);
  };

  const navigate = (p: string) => {
    const route = p === "agenda" ? "/calendar" : `/${p}`;
    routerNavigate(route);
    setNotificationsOpen(false);
  };

  useEffect(() => {
    const handler = (event: Event) => setLegacyData((event as CustomEvent<string>).detail);
    window.addEventListener("lifeos:legacy-data", handler);
    return () => window.removeEventListener("lifeos:legacy-data", handler);
  }, []);

  useEffect(() => {
    if (!notificationsOpen) return;
    api.get<{ title: string; route: string }[]>("/api/v1/notifications").then(setNotifications).catch(() => setNotifications([]));
  }, [notificationsOpen]);

  if (loading) return <div className="min-h-screen grid place-items-center text-sm text-[var(--muted-foreground)]">Carregando seus dados...</div>;
  if (error && !appData.user.email) return <div className="min-h-screen grid place-items-center p-6"><div className="text-center"><p className="text-red-600 mb-3">{error}</p><button onClick={() => void reload()} className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg">Tentar novamente</button></div></div>;

  const isNotes = currentPage === "notes";
  const isAssistant = currentPage === "assistant";

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--background)]" style={{ fontFamily: "var(--font-ui)" }}>
      <Sidebar
        current={currentPage}
        onNavigate={navigate}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(c => !c)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar
          onSearch={() => setSearchOpen(true)}
          onQuickAdd={() => { setQuickAddType(null); setQuickAddOpen(true); }}
          onNotifications={() => setNotificationsOpen(value => !value)}
          onProfile={() => navigate("settings")}
          pageTitle={pageTitles[currentPage]}
        />

        {notificationsOpen && (
          <div className="absolute z-40 top-12 right-24 w-80 bg-white border border-[var(--border)] rounded-xl shadow-xl p-2">
            <p className="px-3 py-2 text-[12px] font-semibold">Notificações</p>
            {notifications.map(item => <button key={`${item.route}-${item.title}`} onClick={() => { routerNavigate(item.route); setNotificationsOpen(false); }} className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-[var(--secondary)] text-[12.5px]"><span className="inline-block w-1.5 h-1.5 bg-[var(--primary)] rounded-full mr-2" />{item.title}</button>)}
            {notifications.length === 0 && <p className="px-3 py-5 text-center text-[12px] text-[var(--muted-foreground)]">Nenhum alerta no momento.</p>}
          </div>
        )}

        <main className={`flex-1 ${isNotes || isAssistant ? "overflow-hidden flex flex-col" : "overflow-y-auto"}`}>
          <Suspense fallback={<div className="h-full grid place-items-center text-sm text-[var(--muted-foreground)]">Carregando módulo...</div>}>
          {currentPage === "dashboard" && <Dashboard onNavigate={navigate} />}
          {currentPage === "inbox" && <Inbox />}
          {currentPage === "tasks" && <Tasks />}
          {currentPage === "agenda" && <Agenda />}
          {currentPage === "goals" && <Goals />}
          {currentPage === "finances" && <Finances />}
          {currentPage === "studies" && <Studies />}
          {currentPage === "career" && <Career />}
          {currentPage === "projects" && <Projects />}
          {currentPage === "notes" && <Notes />}
          {currentPage === "assets" && <Assets />}
          {currentPage === "documents" && <Documents />}
          {currentPage === "assistant" && <Assistant />}
          {currentPage === "settings" && <Settings />}
          </Suspense>
        </main>
      </div>

      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} onNavigate={navigate} />}
      {quickAddOpen && <QuickAddModal initialType={quickAddType} onClose={() => setQuickAddOpen(false)} onSuccess={handleQuickAddSuccess} />}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-[var(--foreground)] text-white px-4 py-3 rounded-xl text-[13px] font-medium shadow-lg flex items-center gap-2 animate-in slide-in-from-bottom-2">
          <span className="text-emerald-400">✓</span>
          {toast}
        </div>
      )}
      {saveStatus === "error" && <div role="alert" className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 bg-red-700 text-white px-4 py-2 rounded-lg text-sm">Erro ao salvar. Verifique sua conexão.</div>}
      {legacyData && <div className="fixed inset-0 z-[60] bg-black/40 grid place-items-center p-4"><div role="dialog" aria-modal="true" aria-labelledby="legacy-title" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"><h2 id="legacy-title" className="text-lg font-semibold">Dados locais encontrados</h2><p className="text-sm text-[var(--muted-foreground)] mt-2">Encontramos dados salvos nesta versão do Life OS. Deseja importá-los para sua conta?</p><div className="mt-5 flex justify-end gap-2"><button onClick={() => setLegacyData(null)} className="px-4 py-2 rounded-lg border border-[var(--border)] text-sm">Agora não</button><button onClick={async () => { try { await importData(new File([legacyData], "legacy.json", { type: "application/json" })); setLegacyData(null); setToast("Dados locais enviados para sua conta. Você pode remover o backup em Configurações."); } catch { setToast("O backup local não pôde ser validado."); } }} className="px-4 py-2 rounded-lg bg-[var(--primary)] text-white text-sm">Importar</button></div></div></div>}
    </div>
  );
}
