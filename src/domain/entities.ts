export interface RemoteEntity {
  id: number;
  serverId?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
}

export interface Subtask extends RemoteEntity {
  title: string;
  done: boolean;
}

export interface Task extends RemoteEntity {
  title: string;
  done: boolean;
  priority: string;
  category: string;
  date: string;
  project: string | null;
  subtasks?: Subtask[];
}

export interface InboxItem extends RemoteEntity {
  text: string;
  created: string;
  archived?: boolean;
}

export interface CalendarEvent extends RemoteEntity {
  title: string;
  date: string;
  time: string;
  endTime: string;
  category: string;
  local: string;
}

export interface GoalAction extends RemoteEntity {
  title: string;
  done: boolean;
}

export interface Goal extends RemoteEntity {
  title: string;
  category: string;
  target: number;
  current: number;
  unit: string;
  deadline: string;
  description: string;
  actions: string[];
  actionRecords?: GoalAction[];
}

export interface ProjectTask extends RemoteEntity {
  title: string;
  done: boolean;
}

export interface Project extends RemoteEntity {
  name: string;
  description: string;
  status: string;
  progress: number;
  deadline: string;
  tasks: ProjectTask[];
  tags: string[];
  tagIds?: Record<string, string>;
}

export interface Note extends RemoteEntity {
  title: string;
  content: string;
  category: string;
  tags: string[];
  favorite: boolean;
  updated: string;
  tagIds?: Record<string, string>;
}

export interface FinancialAccount extends RemoteEntity {
  name: string;
  type: string;
  balance: number;
  color: string;
  initialBalance?: number;
}

export interface CreditCard extends RemoteEntity {
  name: string;
  limit: number;
  used: number;
  closing: string;
  due: string;
  color: string;
}

export interface FinancialTransaction extends RemoteEntity {
  desc: string;
  category: string;
  date: string;
  value: number;
  type: string;
  account: string;
}

export interface InstallmentPurchase extends RemoteEntity {
  desc: string;
  total: number;
  installment: number;
  current: number;
  total_installments: number;
  account: string;
}

export interface Debt extends RemoteEntity {
  creditor: string;
  initial: number;
  remaining: number;
  installment: number;
  installments_left: number;
  end_date: string;
}

export interface Budget extends RemoteEntity {
  category: string;
  limit: number;
  spent: number;
}

export interface StudySubject extends RemoteEntity {
  name: string;
  professor: string;
  schedule: string;
  grade: number;
  status: string;
}

export interface Assignment extends RemoteEntity {
  title: string;
  subject: string;
  due: string;
  status: string;
}

export interface Course extends RemoteEntity {
  name: string;
  platform: string;
  progress: number;
  total_hours: number;
  done_hours: number;
  certificate: boolean;
}

export interface StudyTopic extends RemoteEntity {
  subject: string;
  description: string;
}

export interface CareerPosition extends Partial<RemoteEntity> {
  role: string;
  company: string;
  start: string;
  end?: string;
}

export interface CurrentCareerPosition extends CareerPosition {
  salary: number;
  location: string;
}

export interface CareerPathStep extends Partial<RemoteEntity> {
  level: string;
  status: string;
  description?: string;
}

export interface CareerSkill extends Partial<RemoteEntity> {
  name: string;
  level: string;
}

export interface CareerCertification extends Partial<RemoteEntity> {
  name: string;
  issuer: string;
  date: string | null;
  status: string;
}

export interface Maintenance extends Partial<RemoteEntity> {
  date: string;
  desc: string;
  cost: number;
}

export interface Asset extends RemoteEntity {
  type: string;
  name: string;
  details: Record<string, string | number>;
  value: number;
  insurance?: { company: string; expiry: string; value: number };
  ipva?: { year: number; value: number; paid: boolean };
  maintenance?: Maintenance[];
  next_maintenance?: string;
  warranty?: string;
}

export interface DocumentItem extends RemoteEntity {
  name: string;
  category: string;
  tags: string[];
  size: string;
  updated: string;
  type: string;
}

export interface AppData {
  user: UserProfile;
  tasks: Task[];
  inbox: InboxItem[];
  events: CalendarEvent[];
  goals: Goal[];
  projects: Project[];
  notes: Note[];
  finances: {
    accounts: FinancialAccount[];
    cards: CreditCard[];
    transactions: FinancialTransaction[];
    installments: InstallmentPurchase[];
    debts: Debt[];
    budgets: Budget[];
  };
  studies: {
    subjects: StudySubject[];
    assignments: Assignment[];
    courses: Course[];
    topics: StudyTopic[];
  };
  career: {
    current: CurrentCareerPosition;
    history: CareerPosition[];
    objective: string;
    path: CareerPathStep[];
    skills: CareerSkill[];
    certifications: CareerCertification[];
  };
  assets: Asset[];
  documents: DocumentItem[];
  categories: string[];
  preferences: Record<string, boolean>;
  theme: "claro" | "escuro" | "sistema";
}
