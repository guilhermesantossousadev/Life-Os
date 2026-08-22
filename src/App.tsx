import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import SearchModal from "./components/SearchModal";
import QuickAddModal, { type AddType } from "./components/QuickAddModal";
import Dashboard from "./pages/Dashboard";
import Inbox from "./pages/Inbox";
import Tasks from "./pages/Tasks";
import Agenda from "./pages/Agenda";
import Goals from "./pages/Goals";
import Finances from "./pages/Finances";
import Studies from "./pages/Studies";
import Career from "./pages/Career";
import Projects from "./pages/Projects";
import Notes from "./pages/Notes";
import Assets from "./pages/Assets";
import Documents from "./pages/Documents";
import Assistant from "./pages/Assistant";
import Settings from "./pages/Settings";
import type { Page } from "./data/mock";

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
  const pageFromHash = window.location.hash.replace("#/", "") as Page;
  const [page, setPage] = useState<Page>(pageTitles[pageFromHash] ? pageFromHash : "dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickAddType, setQuickAddType] = useState<AddType | null>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

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
    window.location.hash = `/${page}`;
  }, [page]);

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
    setPage(p as Page);
    setNotificationsOpen(false);
  };

  const isNotes = page === "notes";
  const isAssistant = page === "assistant";

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--background)]" style={{ fontFamily: "var(--font-ui)" }}>
      <Sidebar
        current={page}
        onNavigate={setPage}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(c => !c)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar
          onSearch={() => setSearchOpen(true)}
          onQuickAdd={() => { setQuickAddType(null); setQuickAddOpen(true); }}
          onNotifications={() => setNotificationsOpen(value => !value)}
          onProfile={() => navigate("settings")}
          pageTitle={pageTitles[page]}
        />

        {notificationsOpen && (
          <div className="absolute z-40 top-12 right-24 w-80 bg-white border border-[var(--border)] rounded-xl shadow-xl p-2">
            <p className="px-3 py-2 text-[12px] font-semibold">Notificações</p>
            {[
              ["3 tarefas vencem hoje", "tasks"], ["Prova de Banco de Dados em breve", "studies"], ["Fatura fecha em 15 dias", "finances"],
            ].map(([label, destination]) => <button key={label} onClick={() => navigate(destination)} className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-[var(--secondary)] text-[12.5px]"><span className="inline-block w-1.5 h-1.5 bg-[var(--primary)] rounded-full mr-2" />{label}</button>)}
          </div>
        )}

        <main className={`flex-1 ${isNotes || isAssistant ? "overflow-hidden flex flex-col" : "overflow-y-auto"}`}>
          {page === "dashboard" && <Dashboard onNavigate={navigate} />}
          {page === "inbox" && <Inbox />}
          {page === "tasks" && <Tasks />}
          {page === "agenda" && <Agenda />}
          {page === "goals" && <Goals />}
          {page === "finances" && <Finances />}
          {page === "studies" && <Studies />}
          {page === "career" && <Career />}
          {page === "projects" && <Projects />}
          {page === "notes" && <Notes />}
          {page === "assets" && <Assets />}
          {page === "documents" && <Documents />}
          {page === "assistant" && <Assistant />}
          {page === "settings" && <Settings />}
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
    </div>
  );
}
