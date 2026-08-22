import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  mockAssets, mockCareer, mockDocuments, mockEvents, mockFinances, mockGoals,
  mockInbox, mockNotes, mockProjects, mockStudies, mockTasks, mockUser,
} from "../data/mock";

export type Task = (typeof mockTasks)[number];
export type InboxItem = (typeof mockInbox)[number];
export type CalendarEvent = (typeof mockEvents)[number];
export type Goal = (typeof mockGoals)[number];
export type Project = (typeof mockProjects)[number];
export type Note = (typeof mockNotes)[number];
export type Asset = (typeof mockAssets)[number];
export type DocumentItem = (typeof mockDocuments)[number] & { dataUrl?: string };

export interface AppData {
  user: typeof mockUser;
  tasks: Task[];
  inbox: InboxItem[];
  events: CalendarEvent[];
  goals: Goal[];
  projects: Project[];
  notes: Note[];
  finances: typeof mockFinances;
  studies: typeof mockStudies;
  career: typeof mockCareer;
  assets: Asset[];
  documents: DocumentItem[];
  categories: string[];
  preferences: Record<string, boolean>;
  theme: "claro" | "escuro" | "sistema";
}

const initialData: AppData = {
  user: structuredClone(mockUser), tasks: structuredClone(mockTasks), inbox: structuredClone(mockInbox),
  events: structuredClone(mockEvents), goals: structuredClone(mockGoals), projects: structuredClone(mockProjects),
  notes: structuredClone(mockNotes), finances: structuredClone(mockFinances), studies: structuredClone(mockStudies),
  career: structuredClone(mockCareer), assets: structuredClone(mockAssets), documents: structuredClone(mockDocuments),
  categories: ["Pessoal", "Trabalho", "Estudos", "Finanças", "Saúde", "Carreira", "Faculdade"],
  preferences: {
    "Tarefas com prazo hoje": true,
    "Contas próximas do vencimento": true,
    "Atividades da faculdade": true,
    "Próximas manutenções do veículo": true,
    "Resumo semanal": true,
  },
  theme: "claro",
};

const STORAGE_KEY = "life-os-data-v1";

interface DataContextValue {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  resetData: () => void;
  exportData: () => void;
  importData: (file: File) => Promise<void>;
}

const DataContext = createContext<DataContextValue | null>(null);

function readInitialData(): AppData {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? { ...initialData, ...JSON.parse(saved) } : initialData;
  } catch {
    return initialData;
  }
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(readInitialData);

  useEffect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(data)), [data]);
  useEffect(() => {
    const dark = data.theme === "escuro" || (data.theme === "sistema" && matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", dark);
  }, [data.theme]);

  const value = useMemo<DataContextValue>(() => ({
    data,
    setData,
    resetData: () => setData(structuredClone(initialData)),
    exportData: () => {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `life-os-backup-${new Date().toISOString().slice(0, 10)}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
    },
    importData: async (file: File) => {
      const imported = JSON.parse(await file.text()) as Partial<AppData>;
      if (!imported || !Array.isArray(imported.tasks) || !Array.isArray(imported.notes)) throw new Error("Arquivo de backup inválido.");
      setData({ ...initialData, ...imported });
    },
  }), [data]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData deve ser usado dentro de DataProvider");
  return context;
}

export function nextId(items: { id: number }[]) {
  return items.reduce((max, item) => Math.max(max, item.id), 0) + 1;
}

export const today = () => new Date().toISOString().slice(0, 10);
