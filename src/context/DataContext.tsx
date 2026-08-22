import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { mockAssets, mockCareer, mockDocuments, mockEvents, mockFinances, mockGoals, mockInbox, mockNotes, mockProjects, mockStudies, mockTasks, mockUser } from "../data/mock";
import { civilDate, localTime, saoPauloLocalToIso, todayInSaoPaulo } from "../lib/dates";
import { api, ApiError } from "../services/api";
import { resources, type ServerEntity } from "../services/resources";
import { useAuth } from "./AuthContext";

type Remote<T> = T & { serverId?: string };
export type Task = Remote<(typeof mockTasks)[number]> & { subtasks?: Array<{ id: number; serverId?: string; title: string; done: boolean }> };
export type InboxItem = Remote<(typeof mockInbox)[number]> & { archived?: boolean };
export type CalendarEvent = Remote<(typeof mockEvents)[number]>;
export type Goal = Remote<(typeof mockGoals)[number]> & { actionRecords?: Array<{ id: number; serverId?: string; title: string; done: boolean }> };
export type Project = Remote<(typeof mockProjects)[number]> & { tagIds?: Record<string, string> };
export type Note = Remote<(typeof mockNotes)[number]> & { tagIds?: Record<string, string> };
export type Asset = Remote<(typeof mockAssets)[number]>;
export type DocumentItem = Remote<(typeof mockDocuments)[number]>;
type Account = Remote<(typeof mockFinances.accounts)[number]> & { initialBalance?: number };
type Card = Remote<(typeof mockFinances.cards)[number]>;
type Transaction = Remote<(typeof mockFinances.transactions)[number]>;
type Installment = Remote<(typeof mockFinances.installments)[number]>;
type Debt = Remote<(typeof mockFinances.debts)[number]>;
type Budget = Remote<(typeof mockFinances.budgets)[number]> & { id?: number };
type Subject = Remote<(typeof mockStudies.subjects)[number]>;
type Assignment = Remote<(typeof mockStudies.assignments)[number]>;
type Course = Remote<(typeof mockStudies.courses)[number]>;
type Topic = Remote<(typeof mockStudies.topics)[number]>;
type CareerCurrent = Remote<typeof mockCareer.current>;
type CareerHistory = Remote<(typeof mockCareer.history)[number]> & { id?: number };
type CareerPath = Remote<(typeof mockCareer.path)[number]> & { id?: number };
type CareerSkill = Remote<(typeof mockCareer.skills)[number]> & { id?: number };
type CareerCertification = Remote<(typeof mockCareer.certifications)[number]> & { id?: number };

export interface AppData {
  user: typeof mockUser;
  tasks: Task[];
  inbox: InboxItem[];
  events: CalendarEvent[];
  goals: Goal[];
  projects: Project[];
  notes: Note[];
  finances: { accounts: Account[]; cards: Card[]; transactions: Transaction[]; installments: Installment[]; debts: Debt[]; budgets: Budget[] };
  studies: { subjects: Subject[]; assignments: Assignment[]; courses: Course[]; topics: Topic[] };
  career: { current: CareerCurrent; history: CareerHistory[]; objective: string; path: CareerPath[]; skills: CareerSkill[]; certifications: CareerCertification[] };
  assets: Asset[];
  documents: DocumentItem[];
  categories: string[];
  preferences: Record<string, boolean>;
  theme: "claro" | "escuro" | "sistema";
}

const emptyData: AppData = {
  user: { name: "", email: "", avatar: "" }, tasks: [], inbox: [], events: [], goals: [], projects: [], notes: [],
  finances: { accounts: [], cards: [], transactions: [], installments: [], debts: [], budgets: [] },
  studies: { subjects: [], assignments: [], courses: [], topics: [] },
  career: { current: { role: "", company: "", start: todayInSaoPaulo(), salary: 0, location: "" }, history: [], objective: "", path: [], skills: [], certifications: [] },
  assets: [], documents: [], categories: [], preferences: {}, theme: "sistema",
};

type SaveStatus = "idle" | "saving" | "saved" | "error";
interface DataContextValue {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  loading: boolean;
  error: string | null;
  saveStatus: SaveStatus;
  reload: () => Promise<void>;
  resetData: () => void;
  exportData: () => void;
  importData: (file: File) => Promise<void>;
}

const DataContext = createContext<DataContextValue | null>(null);
const LEGACY_STORAGE_KEY = "life-os-data-v1";
type JsonRecord = Record<string, any>;

function numericId(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index++) hash = (Math.imul(31, hash) + value.charCodeAt(index)) | 0;
  return Math.abs(hash) || 1;
}

function categoryName(categories: JsonRecord[], id?: string | null): string {
  return categories.find(item => item.id === id)?.name ?? "Pessoal";
}

function fromWorkspace(workspace: JsonRecord, email: string): AppData {
  const categories = workspace.categories ?? [];
  const projectsRaw = workspace.projects ?? [];
  const tasksRaw = workspace.tasks ?? [];
  const transactionsRaw = workspace.transactions ?? [];
  const accountsRaw = workspace.accounts ?? [];
  const goalsRaw = workspace.goals ?? [];
  const goalActions = workspace.goalActions ?? [];
  const subjectsRaw = workspace.subjects ?? [];
  const purchases = workspace.installmentPurchases ?? [];
  const installmentsRaw = workspace.installments ?? [];
  const positions = workspace.positions ?? [];
  const currentPosition = positions.find((item: JsonRecord) => item.currentPosition) ?? {};
  const preference = workspace.preferences ?? {};
  const theme = ({ light: "claro", dark: "escuro", system: "sistema" } as Record<string, AppData["theme"]>)[preference.theme] ?? preference.theme ?? "sistema";

  const tasks: Task[] = tasksRaw.map((item: JsonRecord) => ({ id: numericId(item.id), serverId: item.id, title: item.title, done: item.status === "completed", priority: ({ high: "alta", low: "baixa" } as Record<string, string>)[item.priority] ?? item.priority ?? "normal", category: categoryName(categories, item.categoryId), date: item.dueDate ?? todayInSaoPaulo(), project: projectsRaw.find((project: JsonRecord) => project.id === item.projectId)?.title ?? null, subtasks: (workspace.subtasks ?? []).filter((subtask: JsonRecord) => subtask.taskId === item.id).sort((a: JsonRecord, b: JsonRecord) => a.position - b.position).map((subtask: JsonRecord) => ({ id: numericId(subtask.id), serverId: subtask.id, title: subtask.title, done: subtask.isCompleted })) }));
  const projects: Project[] = projectsRaw.map((item: JsonRecord) => {
    const projectTasks = tasksRaw.filter((task: JsonRecord) => task.projectId === item.id);
    const done = projectTasks.filter((task: JsonRecord) => task.status === "completed").length;
    const tagRows = (workspace.projectTags ?? []).filter((link: JsonRecord) => link.projectId === item.id).map((link: JsonRecord) => (workspace.tags ?? []).find((tag: JsonRecord) => tag.id === link.tagId)).filter(Boolean); return { id: numericId(item.id), serverId: item.id, name: item.title, description: item.description ?? "", status: ({ active: "Em andamento", planned: "Planejado", paused: "Pausado", completed: "Concluído" } as Record<string, string>)[item.status] ?? item.status, progress: projectTasks.length ? Math.round(done / projectTasks.length * 100) : 0, deadline: item.deadline ?? todayInSaoPaulo(), tasks: projectTasks.map((task: JsonRecord) => ({ id: numericId(task.id), serverId: task.id, title: task.title, done: task.status === "completed" })), tags: tagRows.map((tag: JsonRecord) => tag.name), tagIds: Object.fromEntries(tagRows.map((tag: JsonRecord) => [tag.name, tag.id])) };
  });
  const movementsFor = (accountId: string) => transactionsRaw.filter((item: JsonRecord) => item.accountId === accountId).reduce((sum: number, item: JsonRecord) => sum + (item.type === "income" || (item.type === "transfer" && item.notes === "in") ? Number(item.amount) : -Number(item.amount)), 0);

  return {
    user: { name: workspace.profile?.name ?? email.split("@")[0], email: workspace.profile?.email ?? email, avatar: workspace.profile?.avatarUrl ?? initials(workspace.profile?.name ?? email) },
    tasks,
    inbox: (workspace.inbox ?? []).map((item: JsonRecord) => ({ id: numericId(item.id), serverId: item.id, text: item.content, created: item.createdAt, archived: Boolean(item.archivedAt) })),
    events: (workspace.events ?? []).map((item: JsonRecord) => ({ id: numericId(item.id), serverId: item.id, title: item.title, date: civilDate(item.startAt), time: localTime(item.startAt), endTime: localTime(item.endAt), category: categoryName(categories, item.categoryId), local: item.location ?? "Não informado" })),
    goals: goalsRaw.map((item: JsonRecord) => { const records = goalActions.filter((action: JsonRecord) => action.goalId === item.id).sort((a: JsonRecord, b: JsonRecord) => a.position - b.position).map((action: JsonRecord) => ({ id: numericId(action.id), serverId: action.id, title: action.title, done: action.isCompleted })); return { id: numericId(item.id), serverId: item.id, title: item.title, category: categoryName(categories, item.categoryId), target: Number(item.targetValue), current: Number(item.currentValue), unit: item.unit, deadline: item.deadline ?? todayInSaoPaulo(), description: item.description ?? "", actions: records.map((action: { title: string }) => action.title), actionRecords: records }; }),
    projects,
    notes: (workspace.notes ?? []).map((item: JsonRecord) => { const tagRows = (workspace.noteTags ?? []).filter((link: JsonRecord) => link.noteId === item.id).map((link: JsonRecord) => (workspace.tags ?? []).find((tag: JsonRecord) => tag.id === link.tagId)).filter(Boolean); return { id: numericId(item.id), serverId: item.id, title: item.title, content: item.content, category: categoryName(categories, item.categoryId), tags: tagRows.map((tag: JsonRecord) => tag.name), tagIds: Object.fromEntries(tagRows.map((tag: JsonRecord) => [tag.name, tag.id])), favorite: item.isFavorite, updated: civilDate(item.updatedAt) }; }),
    finances: {
      accounts: accountsRaw.map((item: JsonRecord) => ({ id: numericId(item.id), serverId: item.id, name: item.name, type: ({ checking: "Conta corrente", savings: "Poupança", cash: "Dinheiro", investment: "Investimentos", other: "Outros" } as Record<string, string>)[item.type] ?? item.type, initialBalance: Number(item.initialBalance), balance: Number(item.initialBalance) + movementsFor(item.id), color: item.color ?? "#2563EB" })),
      cards: (workspace.cards ?? []).map((item: JsonRecord) => ({ id: numericId(item.id), serverId: item.id, name: item.name, limit: Number(item.limitAmount), used: transactionsRaw.filter((transaction: JsonRecord) => transaction.cardId === item.id && transaction.type === "expense").reduce((sum: number, transaction: JsonRecord) => sum + Number(transaction.amount), 0), closing: `${todayInSaoPaulo().slice(0, 8)}${String(item.closingDay).padStart(2, "0")}`, due: `${todayInSaoPaulo().slice(0, 8)}${String(item.dueDay).padStart(2, "0")}`, color: item.color ?? "#2563EB" })),
      transactions: transactionsRaw.filter((item: JsonRecord) => item.type !== "transfer").map((item: JsonRecord) => ({ id: numericId(item.id), serverId: item.id, desc: item.description, category: categoryName(categories, item.categoryId), date: item.transactionDate, value: item.type === "expense" ? -Number(item.amount) : Number(item.amount), type: item.type === "expense" ? "despesa" : "receita", account: accountsRaw.find((account: JsonRecord) => account.id === item.accountId)?.name ?? "Conta" })),
      installments: purchases.map((item: JsonRecord) => { const parts = installmentsRaw.filter((part: JsonRecord) => part.purchaseId === item.id); return { id: numericId(item.id), serverId: item.id, desc: item.description, total: Number(item.totalAmount), installment: Number(parts[0]?.amount ?? 0), current: parts.filter((part: JsonRecord) => part.status === "paid").length, total_installments: item.installmentCount, account: (workspace.cards ?? []).find((card: JsonRecord) => card.id === item.cardId)?.name ?? "Cartão" }; }),
      debts: (workspace.debts ?? []).map((item: JsonRecord) => ({ id: numericId(item.id), serverId: item.id, creditor: item.creditor, initial: Number(item.originalAmount), remaining: Number(item.remainingAmount), installment: Number(item.installmentAmount), installments_left: item.installmentsRemaining, end_date: item.expectedEndDate ?? todayInSaoPaulo() })),
      budgets: (workspace.budgets ?? []).map((item: JsonRecord) => { const category = categoryName(categories, item.categoryId); return { id: numericId(item.id), serverId: item.id, category, limit: Number(item.limitAmount), spent: transactionsRaw.filter((transaction: JsonRecord) => transaction.type === "expense" && transaction.categoryId === item.categoryId && Number(transaction.transactionDate.slice(0, 4)) === item.year && Number(transaction.transactionDate.slice(5, 7)) === item.month).reduce((sum: number, transaction: JsonRecord) => sum + Number(transaction.amount), 0) }; }),
    },
    studies: {
      subjects: subjectsRaw.map((item: JsonRecord) => ({ id: numericId(item.id), serverId: item.id, name: item.name, professor: item.professor ?? "", schedule: item.schedule ?? "", grade: Number(item.grade ?? 0), status: translateStatus(item.status) })),
      assignments: (workspace.assignments ?? []).map((item: JsonRecord) => ({ id: numericId(item.id), serverId: item.id, title: item.title, subject: subjectsRaw.find((subject: JsonRecord) => subject.id === item.subjectId)?.name ?? "Sem disciplina", due: item.dueDate, status: translateStatus(item.status).toLowerCase() })),
      courses: (workspace.courses ?? []).map((item: JsonRecord) => ({ id: numericId(item.id), serverId: item.id, name: item.title, platform: item.provider ?? "Outro", progress: Number(item.progress), total_hours: 0, done_hours: 0, certificate: Boolean(item.certificateUrl) })),
      topics: (workspace.topics ?? []).map((item: JsonRecord) => ({ id: numericId(item.id), serverId: item.id, subject: item.title, description: item.description ?? "" })),
    },
    career: {
      current: { serverId: currentPosition.id, role: currentPosition.role ?? "", company: currentPosition.company ?? "", start: currentPosition.startDate ?? todayInSaoPaulo(), salary: 0, location: currentPosition.description ?? "" },
      history: positions.filter((item: JsonRecord) => !item.currentPosition).map((item: JsonRecord) => ({ id: numericId(item.id), serverId: item.id, role: item.role, company: item.company, start: item.startDate, end: item.endDate ?? todayInSaoPaulo() })),
      objective: (workspace.careerGoals ?? [])[0]?.description ?? (workspace.careerGoals ?? [])[0]?.title ?? "",
      path: (workspace.careerGoals ?? []).map((item: JsonRecord, index: number) => ({ id: numericId(item.id), serverId: item.id, level: item.title, status: item.status === "active" ? "atual" : index === 0 ? "próximo" : "futuro" })),
      skills: (workspace.skills ?? []).map((item: JsonRecord) => ({ id: numericId(item.id), serverId: item.id, name: item.name, level: ({ learning: "Aprendendo", basic: "Básico", intermediate: "Intermediário", advanced: "Avançado" } as Record<string, string>)[item.level] ?? item.level })),
      certifications: (workspace.certifications ?? []).map((item: JsonRecord) => ({ id: numericId(item.id), serverId: item.id, name: item.name, issuer: item.institution, date: item.issuedAt, status: translateStatus(item.status) })),
    },
    assets: (workspace.assets ?? []).map((item: JsonRecord) => {
      const vehicle = (workspace.vehicles ?? []).find((row: JsonRecord) => row.assetId === item.id);
      const maintenance = (workspace.maintenances ?? []).filter((row: JsonRecord) => row.assetId === item.id).map((row: JsonRecord) => ({ id: numericId(row.id), serverId: row.id, date: row.maintenanceDate, desc: row.description, cost: Number(row.cost) }));
      if (vehicle) return {
        id: numericId(item.id), serverId: item.id, type: "Veículo", name: item.name,
        details: { modelo: vehicle.model ?? item.name, ano: Number(vehicle.year ?? 0), placa: vehicle.licensePlate ?? "", cor: "", km: Number(vehicle.mileage ?? 0) },
        insurance: { company: "", expiry: vehicle.insuranceExpiration ?? "", value: 0 },
        ipva: { year: Number(todayInSaoPaulo().slice(0, 4)), value: 0, paid: false },
        maintenance, next_maintenance: "", value: Number(item.estimatedValue),
      } as Asset;
      return {
        id: numericId(item.id), serverId: item.id, type: translateAsset(item.type), name: item.name,
        details: { modelo: item.name, compra: item.purchaseDate ?? "", valor: Number(item.purchaseValue ?? 0), serie: "" },
        warranty: "", value: Number(item.estimatedValue),
      } as Asset;
    }),
    documents: (workspace.documents ?? []).map((item: JsonRecord) => ({ id: numericId(item.id), serverId: item.id, name: item.name, category: categoryName(categories, item.categoryId), tags: (workspace.documentTags ?? []).filter((link: JsonRecord) => link.documentId === item.id).map((link: JsonRecord) => (workspace.tags ?? []).find((tag: JsonRecord) => tag.id === link.tagId)?.name).filter(Boolean), size: formatBytes(item.sizeBytes), updated: civilDate(item.updatedAt), type: item.mimeType === "application/pdf" ? "pdf" : "arquivo" })),
    categories: Array.from(new Set<string>(categories.map((item: JsonRecord) => String(item.name)))),
    preferences: { "Tarefas com prazo hoje": preference.taskDueNotifications ?? true, "Contas próximas do vencimento": preference.financeDueNotifications ?? true, "Atividades da faculdade": preference.studyDueNotifications ?? true, "Próximas manutenções do veículo": preference.assetMaintenanceNotifications ?? true, "Resumo semanal": preference.weeklySummary ?? true },
    theme,
  };
}

function initials(value: string) { return value.split(/\s+|@/).filter(Boolean).map(part => part[0]).join("").slice(0, 2).toUpperCase(); }
function translateStatus(value: string) { return ({ active: "Em andamento", pending: "Pendente", completed: "Concluído", planned: "Planejado" } as Record<string, string>)[value] ?? value ?? ""; }
function translateAsset(value: string) { return ({ vehicle: "Veículo", electronic: "Eletrônico", real_estate: "Imóvel", investment: "Investimento", other: "Outro" } as Record<string, string>)[value] ?? value; }
function formatBytes(value: number) { return value >= 1024 * 1024 ? `${(value / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(value / 1024)} KB`; }

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [data, setInternalData] = useState<AppData>(emptyData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const dataRef = useRef(data);
  const syncTimer = useRef<number | null>(null);
  const pending = useRef<{ before: AppData; after: AppData } | null>(null);
  const queue = useRef(Promise.resolve());
  const categoryIds = useRef(new Map<string, string>());

  const reload = useCallback(async () => {
    if (!user) { setInternalData(emptyData); setLoading(false); return; }
    if (!dataRef.current.user.email) setLoading(true);
    setError(null);
    try {
      await api.get("/api/v1/profile");
      await api.get("/api/v1/preferences");
      const workspace = await api.get<JsonRecord>("/api/v1/workspace");
      categoryIds.current = new Map((workspace.categories ?? []).map((item: JsonRecord) => [item.name, item.id]));
      const mapped = fromWorkspace(workspace, user.email ?? "");
      if (workspace.profile?.avatarUrl) {
        try { mapped.user.avatar = (await api.get<{ url: string }>("/api/v1/profile/avatar-url")).url; } catch { /* initials remain available */ }
      }
      dataRef.current = mapped; setInternalData(mapped);
    } catch (reason) { setError(messageFrom(reason)); }
    finally { setLoading(false); }
  }, [user]);

  useEffect(() => { void reload(); }, [reload]);
  useEffect(() => {
    const media = matchMedia("(prefers-color-scheme: dark)");
    const apply = () => document.documentElement.classList.toggle("dark", data.theme === "escuro" || (data.theme === "sistema" && media.matches));
    apply(); media.addEventListener("change", apply); return () => media.removeEventListener("change", apply);
  }, [data.theme]);

  const attachServerId = useCallback((section: string, clientId: number, serverId: string) => {
    setInternalData(current => {
      const copy = structuredClone(current) as AppData;
      const parts = section.split(".");
      let target: any = copy;
      for (const part of parts) target = target[part];
      const item = target.find((entry: any) => entry.id === clientId);
      if (item) item.serverId = serverId;
      dataRef.current = copy;
      return copy;
    });
  }, []);

  const attachProjectTaskServerId = useCallback((projectId: number, taskId: number, serverId: string) => {
    setInternalData(current => {
      const copy = structuredClone(current) as AppData;
      const task = copy.projects.find(project => project.id === projectId)?.tasks.find(item => item.id === taskId) as any;
      if (task) task.serverId = serverId;
      dataRef.current = copy;
      return copy;
    });
  }, []);

  const attachSubtaskServerId = useCallback((taskId: number, subtaskId: number, serverId: string) => {
    setInternalData(current => { const copy = structuredClone(current) as AppData; const subtask = copy.tasks.find(task => task.id === taskId)?.subtasks?.find(item => item.id === subtaskId); if (subtask) subtask.serverId = serverId; dataRef.current = copy; return copy; });
  }, []);

  const attachGoalActionServerId = useCallback((goalId: number, actionId: number, serverId: string) => {
    setInternalData(current => { const copy = structuredClone(current) as AppData; const action = copy.goals.find(goal => goal.id === goalId)?.actionRecords?.find(item => item.id === actionId); if (action) action.serverId = serverId; dataRef.current = copy; return copy; });
  }, []);

  const syncCollection = useCallback(async <T extends { id: number; serverId?: string }>(section: string, path: string, before: T[], after: T[], mapper: (item: T) => unknown) => {
    for (const oldItem of before) if (oldItem.serverId && !after.some(item => item.id === oldItem.id)) await resources.remove(path, oldItem.serverId);
    for (const item of after) {
      const oldItem = before.find(candidate => candidate.id === item.id);
      if (!oldItem || !item.serverId) {
        const created = await resources.create<ServerEntity>(path, mapper(item));
        attachServerId(section, item.id, created.id);
      } else if (JSON.stringify(oldItem) !== JSON.stringify(item)) await resources.update(path, item.serverId, mapper(item));
    }
  }, [attachServerId]);

  const categoryId = useCallback((name: string) => categoryIds.current.get(name) ?? null, []);
  const sync = useCallback(async (before: AppData, after: AppData) => {
    const addedCategories = after.categories.filter(name => !before.categories.includes(name));
    for (const name of addedCategories) { const created = await resources.create<ServerEntity>("categories", { name, domain: "general" }); categoryIds.current.set(name, created.id); }
    const projectId = (name: string | null) => after.projects.find(project => project.name === name)?.serverId ?? null;
    const accountId = (name: string) => after.finances.accounts.find(account => account.name === name)?.serverId;
    await syncCollection("tasks", "tasks", before.tasks, after.tasks, item => ({ title: item.title, status: item.done ? "completed" : "pending", priority: ({ alta: "high", baixa: "low" } as Record<string, string>)[item.priority] ?? "normal", categoryId: categoryId(item.category), projectId: projectId(item.project), dueDate: item.date, completedAt: item.done ? new Date().toISOString() : null }));
    for (const task of after.tasks.filter(item => item.serverId)) {
      const previousSubtasks = before.tasks.find(item => item.id === task.id)?.subtasks ?? [];
      const currentSubtasks = task.subtasks ?? [];
      for (const previous of previousSubtasks) if (previous.serverId && !currentSubtasks.some(item => item.id === previous.id)) await resources.remove("subtasks", previous.serverId);
      for (let position = 0; position < currentSubtasks.length; position++) {
        const subtask = currentSubtasks[position]; const previous = previousSubtasks.find(item => item.id === subtask.id);
        const payload = { taskId: task.serverId, title: subtask.title, isCompleted: subtask.done, position };
        if (!previous || !subtask.serverId) { const created = await resources.create<ServerEntity>("subtasks", payload); attachSubtaskServerId(task.id, subtask.id, created.id); }
        else if (JSON.stringify(previous) !== JSON.stringify(subtask) || previousSubtasks.indexOf(previous) !== position) await resources.update("subtasks", subtask.serverId, payload);
      }
    }
    await syncCollection("inbox", "inbox", before.inbox, after.inbox, item => ({ content: item.text }));
    await syncCollection("events", "events", before.events, after.events, item => ({ title: item.title, location: item.local, categoryId: categoryId(item.category), startAt: saoPauloLocalToIso(item.date, item.time), endAt: saoPauloLocalToIso(item.date, item.endTime), allDay: false }));
    await syncCollection("goals", "goals", before.goals, after.goals, item => ({ title: item.title, description: item.description, categoryId: categoryId(item.category), unit: item.unit, targetValue: item.target, currentValue: item.current, deadline: item.deadline, status: "active" }));
    for (const goal of after.goals.filter(item => item.serverId)) {
      const previousActions = before.goals.find(item => item.id === goal.id)?.actionRecords ?? [];
      const currentActions = goal.actionRecords ?? [];
      for (const previous of previousActions) if (previous.serverId && !currentActions.some(item => item.id === previous.id)) await resources.remove("goal-actions", previous.serverId);
      for (let position = 0; position < currentActions.length; position++) { const action = currentActions[position]; const previous = previousActions.find(item => item.id === action.id); const payload = { goalId: goal.serverId, title: action.title, isCompleted: action.done, position }; if (!previous || !action.serverId) { const created = await resources.create<ServerEntity>("goal-actions", payload); attachGoalActionServerId(goal.id, action.id, created.id); } else if (JSON.stringify(previous) !== JSON.stringify(action)) await resources.update("goal-actions", action.serverId, payload); }
    }
    await syncCollection("projects", "projects", before.projects, after.projects, item => ({ title: item.name, description: item.description, status: ({ "Em andamento": "active", Planejado: "planned", Pausado: "paused", Concluído: "completed" } as Record<string, string>)[item.status] ?? "planned", deadline: item.deadline }));
    for (const project of after.projects.filter(item => item.serverId)) {
      const previousProject = before.projects.find(item => item.id === project.id);
      const previousTasks = previousProject?.tasks ?? [];
      for (const previousTask of previousTasks) {
        const serverId = (previousTask as any).serverId as string | undefined;
        if (serverId && !project.tasks.some(item => item.id === previousTask.id)) await resources.remove("tasks", serverId);
      }
      for (const task of project.tasks) {
        const previousTask = previousTasks.find(item => item.id === task.id);
        const serverId = (task as any).serverId as string | undefined;
        const payload = { title: task.title, status: task.done ? "completed" : "pending", priority: "normal", projectId: project.serverId, dueDate: project.deadline };
        if (!previousTask || !serverId) { const created = await resources.create<ServerEntity>("tasks", payload); attachProjectTaskServerId(project.id, task.id, created.id); }
        else if (JSON.stringify(previousTask) !== JSON.stringify(task)) await resources.update("tasks", serverId, payload);
      }
    }
    await syncCollection("notes", "notes", before.notes, after.notes, item => ({ title: item.title, content: item.content, categoryId: categoryId(item.category), isFavorite: item.favorite }));
    await syncCollection("finances.accounts", "finances/accounts", before.finances.accounts, after.finances.accounts, item => ({ name: item.name, type: ({ "Conta corrente": "checking", Poupança: "savings", Dinheiro: "cash", Investimentos: "investment", Outros: "other" } as Record<string, string>)[item.type] ?? "other", initialBalance: item.initialBalance ?? item.balance, isActive: true, color: item.color }));
    await syncCollection("finances.transactions", "finances/transactions", before.finances.transactions, after.finances.transactions, item => ({ accountId: accountId(item.account), categoryId: categoryId(item.category), description: item.desc, type: item.type === "despesa" ? "expense" : "income", amount: Math.abs(item.value), transactionDate: item.date }));
    await syncCollection("finances.cards", "finances/cards", before.finances.cards, after.finances.cards, item => ({ name: item.name, limitAmount: item.limit, closingDay: Number(item.closing.slice(-2)), dueDay: Number(item.due.slice(-2)), accountId: after.finances.accounts[0]?.serverId, isActive: true, color: item.color }));
    await syncCollection("finances.installments", "finances/installment-purchases", before.finances.installments, after.finances.installments, item => ({ cardId: after.finances.cards.find(card => card.name === item.account)?.serverId, description: item.desc, totalAmount: item.total, installmentCount: item.total_installments, purchaseDate: todayInSaoPaulo(), status: "active" }));
    await syncCollection("finances.debts", "finances/debts", before.finances.debts, after.finances.debts, item => ({ creditor: item.creditor, originalAmount: item.initial, remainingAmount: item.remaining, installmentAmount: item.installment, installmentsTotal: item.installments_left, installmentsRemaining: item.installments_left, startDate: todayInSaoPaulo(), expectedEndDate: item.end_date, status: item.remaining <= 0 ? "paid" : "active" }));
    await syncCollection("finances.budgets", "finances/budgets", before.finances.budgets.map(withRequiredId), after.finances.budgets.map(withRequiredId), item => ({ categoryId: categoryId(item.category), month: Number(todayInSaoPaulo().slice(5, 7)), year: Number(todayInSaoPaulo().slice(0, 4)), limitAmount: item.limit }));
    await syncCollection("studies.subjects", "studies/subjects", before.studies.subjects, after.studies.subjects, item => ({ name: item.name, professor: item.professor, schedule: item.schedule, status: "active" }));
    const subjectId = (name: string) => after.studies.subjects.find(subject => subject.name === name)?.serverId;
    await syncCollection("studies.assignments", "studies/assignments", before.studies.assignments, after.studies.assignments, item => ({ subjectId: subjectId(item.subject), title: item.title, type: "assignment", dueDate: item.due, status: item.status.includes("conclu") ? "completed" : "pending" }));
    await syncCollection("studies.courses", "studies/courses", before.studies.courses, after.studies.courses, item => ({ title: item.name, provider: item.platform, progress: item.progress, status: item.progress >= 100 ? "completed" : "active" }));
    await syncCollection("studies.topics", "studies/topics", before.studies.topics, after.studies.topics, item => ({ title: item.subject, description: item.description, status: "active" }));
    await syncCollection("career.history", "career/positions", before.career.history.map(withRequiredId), after.career.history.map(withRequiredId), item => ({ company: item.company, role: item.role, startDate: item.start, endDate: item.end, currentPosition: false }));
    await syncCollection("career.path", "career/goals", before.career.path.map(withRequiredId), after.career.path.map(withRequiredId), (item: any) => ({ title: item.level, description: item.description ?? "", status: item.status === "atual" ? "active" : "planned", position: after.career.path.findIndex(step => step.id === item.id) }));
    await syncCollection("career.skills", "career/skills", before.career.skills.map(withRequiredId), after.career.skills.map(withRequiredId), item => ({ name: item.name, level: ({ Aprendendo: "learning", "Básico": "basic", "Intermediário": "intermediate", "Avançado": "advanced" } as Record<string, string>)[item.level] ?? "learning" }));
    await syncCollection("career.certifications", "career/certifications", before.career.certifications.map(withRequiredId), after.career.certifications.map(withRequiredId), item => ({ name: item.name, institution: item.issuer, issuedAt: item.date, status: item.status === "Obtido" ? "completed" : "planned" }));
    await syncCollection("assets", "assets", before.assets, after.assets, item => ({ name: item.name, type: ({ Veículo: "vehicle", Eletrônico: "electronic", Imóvel: "real_estate", Investimento: "investment" } as Record<string, string>)[item.type] ?? "other", purchaseDate: (item as any).details?.compra || null, purchaseValue: (item as any).details?.valor || null, estimatedValue: item.value }));

    if (before.user.name !== after.user.name) await api.patch("/api/v1/profile", { name: after.user.name });
    if (before.theme !== after.theme || JSON.stringify(before.preferences) !== JSON.stringify(after.preferences)) await api.put("/api/v1/preferences", { theme: ({ claro: "light", escuro: "dark", sistema: "system" } as const)[after.theme], dateFormat: "dd/MM/yyyy", firstPage: "dashboard", timeZone: "America/Sao_Paulo", taskDueNotifications: after.preferences["Tarefas com prazo hoje"] ?? true, financeDueNotifications: after.preferences["Contas próximas do vencimento"] ?? true, studyDueNotifications: after.preferences["Atividades da faculdade"] ?? true, assetMaintenanceNotifications: after.preferences["Próximas manutenções do veículo"] ?? true, weeklySummary: after.preferences["Resumo semanal"] ?? true });

    const removedCategories = before.categories.filter(name => !after.categories.includes(name));
    for (const name of removedCategories) { const id = categoryIds.current.get(name); if (id) { await resources.remove("categories", id); categoryIds.current.delete(name); } }
  }, [attachGoalActionServerId, attachProjectTaskServerId, attachSubtaskServerId, categoryId, syncCollection]);

  const setData: React.Dispatch<React.SetStateAction<AppData>> = useCallback(update => {
    const before = dataRef.current;
    const after = typeof update === "function" ? update(before) : update;
    dataRef.current = after; setInternalData(after); setSaveStatus("saving");
    pending.current = pending.current ? { before: pending.current.before, after } : { before, after };
    if (syncTimer.current) window.clearTimeout(syncTimer.current);
    syncTimer.current = window.setTimeout(() => {
      const change = pending.current; pending.current = null;
      if (!change) return;
      queue.current = queue.current.then(() => sync(change.before, change.after)).then(() => setSaveStatus("saved")).catch(reason => { setSaveStatus("error"); setError(messageFrom(reason)); });
    }, 650);
  }, [sync]);

  const exportData = useCallback(() => {
    const { documents: _documents, ...structured } = dataRef.current;
    const blob = new Blob([JSON.stringify({ schemaVersion: 2, exportedAt: new Date().toISOString(), data: structured, documents: dataRef.current.documents.map(({ serverId, name, category, tags, size, updated, type }) => ({ serverId, name, category, tags, size, updated, type })) }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = `life-os-backup-${todayInSaoPaulo()}.json`; anchor.click(); URL.revokeObjectURL(url);
  }, []);

  const importData = useCallback(async (file: File) => {
    const parsed = JSON.parse(await file.text());
    const imported = parsed.schemaVersion === 2 ? parsed.data : parsed;
    if (!imported || !Array.isArray(imported.tasks) || !Array.isArray(imported.notes)) throw new Error("Arquivo de backup inválido.");
    setData(current => ({ ...current, ...imported, documents: current.documents }));
  }, [setData]);

  useEffect(() => {
    if (!user) return;
    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!legacy || sessionStorage.getItem("lifeos-legacy-asked")) return;
    sessionStorage.setItem("lifeos-legacy-asked", "1");
    window.dispatchEvent(new CustomEvent("lifeos:legacy-data", { detail: legacy }));
  }, [user]);

  const value = useMemo<DataContextValue>(() => ({ data, setData, loading, error, saveStatus, reload, resetData: () => setData(current => ({ ...structuredClone(emptyData), user: current.user, categories: current.categories, preferences: current.preferences, theme: current.theme, documents: current.documents })), exportData, importData }), [data, setData, loading, error, saveStatus, reload, exportData, importData]);
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

function withRequiredId<T extends { id?: number; serverId?: string }>(item: T): T & { id: number } { return { ...item, id: item.id ?? (item.serverId ? numericId(item.serverId) : Date.now()) }; }
function messageFrom(reason: unknown) { return reason instanceof ApiError ? `${reason.message}${reason.problem.traceId ? ` (código ${reason.problem.traceId})` : ""}` : reason instanceof Error ? reason.message : "Falha inesperada."; }

export function useData() { const context = useContext(DataContext); if (!context) throw new Error("useData deve ser usado dentro de DataProvider"); return context; }
export function nextId(items: { id: number }[]) { return items.reduce((max, item) => Math.max(max, item.id), 0) + 1; }
export const today = todayInSaoPaulo;
