import {
  LayoutDashboard, Inbox, Calendar, CheckSquare,
  Target, FolderKanban, FileText,
  Wallet, BookOpen, Briefcase, Package, Archive,
  MessageSquare, Settings, ChevronLeft, ChevronRight,
} from "lucide-react";
import type { Page } from "../data/mock";

interface SidebarProps {
  current: Page;
  onNavigate: (page: Page) => void;
  collapsed: boolean;
  onToggle: () => void;
}

const groups = [
  {
    label: "Principal",
    items: [
      { id: "dashboard" as Page, label: "Início", icon: LayoutDashboard },
      { id: "inbox" as Page, label: "Inbox", icon: Inbox },
      { id: "agenda" as Page, label: "Agenda", icon: Calendar },
      { id: "tasks" as Page, label: "Tarefas", icon: CheckSquare },
    ],
  },
  {
    label: "Organização",
    items: [
      { id: "goals" as Page, label: "Metas", icon: Target },
      { id: "projects" as Page, label: "Projetos", icon: FolderKanban },
      { id: "notes" as Page, label: "Notas", icon: FileText },
    ],
  },
  {
    label: "Vida",
    items: [
      { id: "finances" as Page, label: "Finanças", icon: Wallet },
      { id: "studies" as Page, label: "Estudos", icon: BookOpen },
      { id: "career" as Page, label: "Carreira", icon: Briefcase },
      { id: "assets" as Page, label: "Patrimônio", icon: Package },
      { id: "documents" as Page, label: "Documentos", icon: Archive },
    ],
  },
  {
    label: "Sistema",
    items: [
      { id: "assistant" as Page, label: "Assistente", icon: MessageSquare },
      { id: "settings" as Page, label: "Configurações", icon: Settings },
    ],
  },
];

export default function Sidebar({ current, onNavigate, collapsed, onToggle }: SidebarProps) {
  return (
    <aside
      style={{
        width: collapsed ? "var(--sidebar-collapsed)" : "var(--sidebar-width)",
        transition: "width 0.2s ease",
        fontFamily: "var(--font-ui)",
      }}
      className="h-full bg-white border-r border-[var(--border)] flex flex-col flex-shrink-0 overflow-hidden"
    >
      {/* Logo area */}
      <div className={`flex items-center h-14 px-4 border-b border-[var(--border)] gap-3 flex-shrink-0 ${collapsed ? "justify-center px-0" : ""}`}>
        <div className="w-7 h-7 rounded-[6px] bg-[var(--primary)] flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs font-bold" style={{ fontFamily: "var(--font-ui)" }}>L</span>
        </div>
        {!collapsed && (
          <span className="font-semibold text-[15px] text-[var(--foreground)]" style={{ fontFamily: "var(--font-ui)" }}>Life OS</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {groups.map((group) => (
          <div key={group.label} className="mb-4">
            {!collapsed && (
              <p className="px-2 mb-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--muted-foreground)]">
                {group.label}
              </p>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = current === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  title={collapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-[13.5px] font-medium transition-colors mb-0.5 ${
                    active
                      ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
                      : "text-[var(--muted-foreground)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)]"
                  } ${collapsed ? "justify-center" : ""}`}
                >
                  <Icon size={15} className="flex-shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Toggle */}
      <div className="border-t border-[var(--border)] p-2">
        <button
          onClick={onToggle}
          className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[var(--muted-foreground)] hover:bg-[var(--secondary)] transition-colors text-[13px] ${collapsed ? "justify-center" : ""}`}
        >
          {collapsed ? <ChevronRight size={14} /> : <><ChevronLeft size={14} /><span className="text-xs">Recolher</span></>}
        </button>
      </div>
    </aside>
  );
}
