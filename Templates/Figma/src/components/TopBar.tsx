import { Search, Plus, Bell } from "lucide-react";
import { mockUser } from "../data/mock";

interface TopBarProps {
  onSearch: () => void;
  onQuickAdd: () => void;
  pageTitle: string;
}

export default function TopBar({ onSearch, onQuickAdd, pageTitle }: TopBarProps) {
  return (
    <header
      className="h-14 bg-white border-b border-[var(--border)] flex items-center px-5 gap-4 flex-shrink-0"
      style={{ fontFamily: "var(--font-ui)" }}
    >
      <span className="font-semibold text-[15px] text-[var(--foreground)] mr-auto">{pageTitle}</span>

      {/* Search trigger */}
      <button
        onClick={onSearch}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--secondary)] text-[var(--muted-foreground)] text-[13px] hover:bg-[var(--border)] transition-colors"
        style={{ minWidth: 180 }}
      >
        <Search size={13} />
        <span>Pesquisar...</span>
        <span className="ml-auto text-[11px] text-[var(--muted-foreground)] border border-[var(--border)] rounded px-1 py-0.5">⌘K</span>
      </button>

      {/* Notifications */}
      <button className="relative w-8 h-8 flex items-center justify-center rounded-lg text-[var(--muted-foreground)] hover:bg-[var(--secondary)] transition-colors">
        <Bell size={15} />
        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500" />
      </button>

      {/* Quick add */}
      <button
        onClick={onQuickAdd}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--primary)] text-white text-[13px] font-medium hover:bg-blue-700 transition-colors"
      >
        <Plus size={14} />
        <span>Adicionar</span>
      </button>

      {/* Avatar */}
      <button className="w-8 h-8 rounded-full bg-[var(--primary)] text-white text-xs font-semibold flex items-center justify-center flex-shrink-0">
        {mockUser.avatar}
      </button>
    </header>
  );
}
