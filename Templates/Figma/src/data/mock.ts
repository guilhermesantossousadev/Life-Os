export const mockUser = {
  name: "Guilherme",
  email: "guilherme@email.com",
  avatar: "GS",
};

export const mockTasks = [
  { id: 1, title: "Revisar relatório do projeto SAP", done: false, priority: "alta", category: "Trabalho", date: "2026-08-22", project: "SAP Migration" },
  { id: 2, title: "Estudar módulo SD do SAP", done: false, priority: "alta", category: "Estudos", date: "2026-08-22", project: null },
  { id: 3, title: "Pagar fatura do cartão Nubank", done: false, priority: "alta", category: "Finanças", date: "2026-08-23", project: null },
  { id: 4, title: "Ler capítulo 3 do livro Clean Code", done: true, priority: "normal", category: "Estudos", date: "2026-08-21", project: null },
  { id: 5, title: "Ligar para o banco sobre limite", done: false, priority: "normal", category: "Finanças", date: "2026-08-22", project: null },
  { id: 6, title: "Comprar lâmpada do carro", done: false, priority: "baixa", category: "Pessoal", date: "2026-08-25", project: null },
  { id: 7, title: "Enviar trabalho de Análise de Sistemas", done: false, priority: "alta", category: "Faculdade", date: "2026-08-24", project: null },
  { id: 8, title: "Atualizar LinkedIn com nova experiência", done: false, priority: "normal", category: "Carreira", date: "2026-08-26", project: null },
  { id: 9, title: "Agendar revisão do notebook", done: false, priority: "baixa", category: "Pessoal", date: "2026-08-28", project: null },
  { id: 10, title: "Pesquisar certificação SAP C_ABAPD_2309", done: false, priority: "normal", category: "Carreira", date: "2026-08-30", project: null },
];

export const mockInbox = [
  { id: 1, text: "Comprar lâmpada do carro", created: "2026-08-22T08:30:00" },
  { id: 2, text: "Estudar ABAP — módulo de classes", created: "2026-08-22T09:15:00" },
  { id: 3, text: "Pesquisar curso de arquitetura SAP", created: "2026-08-21T22:00:00" },
  { id: 4, text: "Pagar cartão antes do vencimento", created: "2026-08-21T18:45:00" },
  { id: 5, text: "Ideia: criar app para rastrear gastos com carro", created: "2026-08-20T14:20:00" },
  { id: 6, text: "Ver vídeo de Docker na Alura", created: "2026-08-19T21:00:00" },
];

export const mockEvents = [
  { id: 1, title: "Reunião com equipe SAP", date: "2026-08-22", time: "14:00", endTime: "15:00", category: "Trabalho", local: "Google Meet" },
  { id: 2, title: "Aula de Análise de Sistemas", date: "2026-08-22", time: "19:00", endTime: "22:30", category: "Faculdade", local: "Presencial" },
  { id: 3, title: "Consulta médica", date: "2026-08-23", time: "10:30", endTime: "11:30", category: "Pessoal", local: "Clínica Saúde+" },
  { id: 4, title: "Entrevista estágio TechBrasil", date: "2026-08-25", time: "09:00", endTime: "10:00", category: "Carreira", local: "Online" },
  { id: 5, title: "Prova de Banco de Dados", date: "2026-08-27", time: "19:00", endTime: "21:00", category: "Faculdade", local: "Sala 204" },
  { id: 6, title: "Aniversário do Pedro", date: "2026-08-29", time: "20:00", endTime: "23:00", category: "Pessoal", local: "Restaurante Central" },
];

export const mockGoals = [
  { id: 1, title: "Comprar carro", category: "Financeira", target: 30000, current: 8400, unit: "BRL", deadline: "2027-06-01", description: "Honda City 2023 seminovo", actions: ["Guardar R$1.200/mês", "Vender notebook antigo"] },
  { id: 2, title: "Aprovação certificação SAP", category: "Profissional", target: 100, current: 62, unit: "%", deadline: "2026-11-30", description: "SAP Certified Development Associate C_ABAPD_2309", actions: ["Estudar 2h/dia", "Fazer simulados semanais"] },
  { id: 3, title: "Concluir graduação", category: "Estudos", target: 8, current: 5, unit: "semestres", deadline: "2027-12-15", description: "ADS - Análise e Desenvolvimento de Sistemas", actions: ["Manter média acima de 7", "Não reprovar nenhuma matéria"] },
  { id: 4, title: "Montar reserva de emergência", category: "Financeira", target: 15000, current: 4200, unit: "BRL", deadline: "2027-03-01", description: "6 meses de despesas essenciais", actions: ["Guardar 20% do salário", "Aplicar em CDB"] },
  { id: 5, title: "Aprender Docker avançado", category: "Estudos", target: 100, current: 35, unit: "%", deadline: "2026-10-15", description: "Containers, compose, kubernetes básico", actions: ["Curso na Alura", "Projeto prático"] },
];

export const mockFinances = {
  accounts: [
    { id: 1, name: "Nubank", type: "Conta corrente", balance: 2340.50, color: "#7C3AED" },
    { id: 2, name: "Caixa Poupança", type: "Poupança", balance: 4200.00, color: "#0284C7" },
    { id: 3, name: "Carteira", type: "Dinheiro", balance: 120.00, color: "#059669" },
    { id: 4, name: "Tesouro Direto", type: "Investimentos", balance: 1850.00, color: "#D97706" },
  ],
  cards: [
    { id: 1, name: "Nubank Roxinho", limit: 3500, used: 1247.80, closing: "2026-09-05", due: "2026-09-15", color: "#7C3AED" },
    { id: 2, name: "C6 Bank", limit: 2000, used: 380.00, closing: "2026-09-10", due: "2026-09-20", color: "#18181B" },
  ],
  transactions: [
    { id: 1, desc: "Salário Estágio", category: "Receita", date: "2026-08-05", value: 1800.00, type: "receita", account: "Nubank" },
    { id: 2, desc: "iFood - Jantar", category: "Alimentação", date: "2026-08-21", value: -42.90, type: "despesa", account: "Nubank" },
    { id: 3, desc: "Uber - Trabalho", category: "Transporte", date: "2026-08-21", value: -18.50, type: "despesa", account: "Nubank" },
    { id: 4, desc: "Plano de internet", category: "Moradia", date: "2026-08-20", value: -99.90, type: "despesa", account: "Nubank" },
    { id: 5, desc: "Reembolso viagem", category: "Receita", date: "2026-08-18", value: 250.00, type: "receita", account: "Nubank" },
    { id: 6, desc: "Mercado Mensal", category: "Alimentação", date: "2026-08-15", value: -380.00, type: "despesa", account: "C6 Bank" },
    { id: 7, desc: "Spotify Premium", category: "Lazer", date: "2026-08-10", value: -21.90, type: "despesa", account: "Nubank" },
    { id: 8, desc: "Curso Alura", category: "Educação", date: "2026-08-08", value: -79.90, type: "despesa", account: "Nubank" },
    { id: 9, desc: "Farmácia", category: "Saúde", date: "2026-08-07", value: -67.00, type: "despesa", account: "Carteira" },
    { id: 10, desc: "Gasolina", category: "Transporte", date: "2026-08-06", value: -120.00, type: "despesa", account: "C6 Bank" },
  ],
  installments: [
    { id: 1, desc: "Notebook Dell Inspiron", total: 3099, installment: 258.25, current: 4, total_installments: 12, account: "Nubank" },
    { id: 2, desc: "Teclado Mecânico", total: 450, installment: 75.00, current: 3, total_installments: 6, account: "C6 Bank" },
    { id: 3, desc: "Seguro do carro", total: 2400, installment: 200.00, current: 7, total_installments: 12, account: "Nubank" },
  ],
  debts: [
    { id: 1, creditor: "Empréstimo Caixa", initial: 5000, remaining: 2800, installment: 280, installments_left: 10, end_date: "2027-06-01" },
  ],
  budgets: [
    { category: "Alimentação", limit: 600, spent: 422.90 },
    { category: "Transporte", limit: 300, spent: 138.50 },
    { category: "Lazer", limit: 200, spent: 21.90 },
    { category: "Educação", limit: 150, spent: 79.90 },
    { category: "Saúde", limit: 100, spent: 67.00 },
    { category: "Moradia", limit: 500, spent: 99.90 },
  ],
};

export const mockStudies = {
  subjects: [
    { id: 1, name: "Análise de Sistemas", professor: "Prof. Ricardo", schedule: "Ter/Qui 19h", grade: 7.5, status: "Em andamento" },
    { id: 2, name: "Banco de Dados II", professor: "Prof. Ana", schedule: "Seg/Qua 19h", grade: 8.0, status: "Em andamento" },
    { id: 3, name: "Engenharia de Software", professor: "Prof. Carlos", schedule: "Sex 19h", grade: 7.0, status: "Em andamento" },
    { id: 4, name: "Redes de Computadores", professor: "Prof. Marcos", schedule: "Ter/Qui 21h", grade: 6.5, status: "Em andamento" },
  ],
  assignments: [
    { id: 1, title: "Trabalho: Diagrama UML do sistema", subject: "Análise de Sistemas", due: "2026-08-24", status: "pendente" },
    { id: 2, title: "Prova P2", subject: "Banco de Dados II", due: "2026-08-27", status: "pendente" },
    { id: 3, title: "Seminário: Cloud Computing", subject: "Redes de Computadores", due: "2026-09-10", status: "pendente" },
    { id: 4, title: "Projeto Final: App web", subject: "Engenharia de Software", due: "2026-11-30", status: "em andamento" },
  ],
  courses: [
    { id: 1, name: "SAP ABAP para iniciantes", platform: "Udemy", progress: 68, total_hours: 24, done_hours: 16, certificate: false },
    { id: 2, name: "Docker e Kubernetes", platform: "Alura", progress: 35, total_hours: 18, done_hours: 6, certificate: false },
    { id: 3, name: "React Avançado", platform: "Rocketseat", progress: 100, total_hours: 20, done_hours: 20, certificate: true },
    { id: 4, name: "Java Completo", platform: "Udemy", progress: 55, total_hours: 40, done_hours: 22, certificate: false },
  ],
  topics: [
    { id: 1, subject: "SAP", description: "ERP, módulos, integração" },
    { id: 2, subject: "ABAP", description: "Programação orientada a objetos em SAP" },
    { id: 3, subject: "Arquitetura de Software", description: "Padrões, microsserviços, clean architecture" },
    { id: 4, subject: "Cloud Computing", description: "AWS, Azure, conceitos gerais" },
  ],
};

export const mockCareer = {
  current: {
    role: "Estagiário em TI",
    company: "TechConsult Brasil",
    start: "2026-02-01",
    salary: 1800,
    location: "São Paulo, SP",
  },
  history: [
    { role: "Auxiliar Administrativo", company: "Comércio Dias", start: "2024-06-01", end: "2026-01-31" },
  ],
  objective: "Tornar-me Arquiteto de Soluções SAP em 6 anos",
  path: [
    { level: "Estagiário em TI", status: "atual" },
    { level: "Trainee / Júnior SAP", status: "próximo" },
    { level: "Consultor SAP Júnior", status: "futuro" },
    { level: "Consultor SAP Pleno", status: "futuro" },
    { level: "Consultor SAP Sênior", status: "futuro" },
    { level: "Arquiteto de Soluções", status: "futuro" },
  ],
  skills: [
    { name: "ABAP", level: "Básico" },
    { name: "SAP ERP", level: "Básico" },
    { name: "Java", level: "Intermediário" },
    { name: "React", level: "Intermediário" },
    { name: "TypeScript", level: "Intermediário" },
    { name: "SQL", level: "Intermediário" },
    { name: "Docker", level: "Aprendendo" },
    { name: "Git", level: "Avançado" },
  ],
  certifications: [
    { name: "SAP C_ABAPD_2309", issuer: "SAP", date: null, status: "Em preparação" },
    { name: "Oracle Java SE 11", issuer: "Oracle", date: null, status: "Planejado" },
    { name: "AWS Cloud Practitioner", issuer: "Amazon", date: null, status: "Planejado" },
  ],
};

export const mockProjects = [
  {
    id: 1,
    name: "Life OS — Sistema Pessoal",
    description: "Desenvolver o sistema Life OS completo com todas as funcionalidades mapeadas.",
    status: "Em andamento",
    progress: 15,
    deadline: "2027-01-01",
    tasks: [
      { id: 1, title: "Definir arquitetura do banco", done: true },
      { id: 2, title: "Criar protótipo no Figma", done: true },
      { id: 3, title: "Configurar ambiente Next.js + Supabase", done: false },
      { id: 4, title: "Desenvolver módulo de tarefas", done: false },
    ],
    tags: ["React", "TypeScript", "Supabase"],
  },
  {
    id: 2,
    name: "API de Rastreamento de Gastos",
    description: "API REST para integração com planilhas de controle financeiro.",
    status: "Planejado",
    progress: 0,
    deadline: "2026-12-01",
    tasks: [
      { id: 1, title: "Modelar entidades", done: false },
      { id: 2, title: "Implementar endpoints principais", done: false },
    ],
    tags: ["Java", "Spring Boot", "PostgreSQL"],
  },
  {
    id: 3,
    name: "Portfólio Profissional",
    description: "Site de portfólio com projetos, habilidades e experiências.",
    status: "Em andamento",
    progress: 60,
    deadline: "2026-10-01",
    tasks: [
      { id: 1, title: "Design da homepage", done: true },
      { id: 2, title: "Seção de projetos", done: true },
      { id: 3, title: "Seção de habilidades", done: false },
      { id: 4, title: "Deploy na Vercel", done: false },
    ],
    tags: ["React", "Tailwind"],
  },
];

export const mockNotes = [
  { id: 1, title: "Arquitetura de Software — Clean Architecture", content: "## Princípios\n\n- Independência de frameworks\n- Testabilidade\n- Independência de UI\n\n## Camadas\n\n1. Entities\n2. Use Cases\n3. Interface Adapters\n4. Frameworks & Drivers", category: "Estudos", tags: ["arquitetura", "clean code"], favorite: true, updated: "2026-08-20" },
  { id: 2, title: "Ideias para o Life OS", content: "- Integração com Google Calendar\n- Widget para celular\n- Modo foco (pomodoro integrado)\n- Sincronização offline", category: "Projetos", tags: ["lifeos", "ideias"], favorite: true, updated: "2026-08-22" },
  { id: 3, title: "Anotações SAP — Módulo SD", content: "SD = Sales & Distribution\n\nPrincipais transações:\n- VA01: Criar pedido de venda\n- VL01N: Criar entrega\n- VF01: Criar fatura", category: "Trabalho", tags: ["sap", "sd"], favorite: false, updated: "2026-08-18" },
  { id: 4, title: "Rotina matinal ideal", content: "06:00 Acordar\n06:10 Exercícios 20min\n06:30 Banho\n06:50 Café da manhã\n07:10 Revisão do dia (Life OS)\n07:30 Saída para trabalho", category: "Pessoal", tags: ["rotina", "produtividade"], favorite: false, updated: "2026-08-15" },
  { id: 5, title: "Comandos Git úteis", content: "```bash\n# Desfazer último commit (mantendo arquivos)\ngit reset --soft HEAD~1\n\n# Ver histórico bonito\ngit log --oneline --graph\n\n# Salvar trabalho temporário\ngit stash\ngit stash pop\n```", category: "Estudos", tags: ["git", "dev"], favorite: false, updated: "2026-08-10" },
];

export const mockAssets = [
  {
    id: 1, type: "Veículo", name: "Honda CG 160 2020",
    details: { modelo: "Honda CG 160 Fan", ano: 2020, placa: "ABC-1D23", cor: "Preta", km: 28500 },
    insurance: { company: "Porto Seguro", expiry: "2027-03-15", value: 2400 },
    ipva: { year: 2026, value: 380.00, paid: true },
    maintenance: [
      { date: "2026-06-10", desc: "Troca de óleo", cost: 80 },
      { date: "2026-03-20", desc: "Revisão 20.000 km", cost: 320 },
    ],
    next_maintenance: "2026-12-10",
    value: 12000,
  },
  {
    id: 2, type: "Eletrônico", name: "Notebook Dell Inspiron 15",
    details: { modelo: "Dell Inspiron 15 3520", compra: "2025-09-15", valor: 3099, serie: "DL8X42A7" },
    warranty: "2027-09-15",
    value: 2800,
  },
  {
    id: 3, type: "Eletrônico", name: "iPhone 14",
    details: { modelo: "Apple iPhone 14 128GB", compra: "2025-01-10", valor: 4299, serie: "F4GHK9P2" },
    warranty: "2027-01-10",
    value: 3500,
  },
];

export const mockDocuments = [
  { id: 1, name: "RG", category: "Pessoal", tags: ["identidade"], size: "1.2 MB", updated: "2025-03-10", type: "pdf" },
  { id: 2, name: "CPF", category: "Pessoal", tags: ["identidade"], size: "0.5 MB", updated: "2025-03-10", type: "pdf" },
  { id: 3, name: "Histórico Escolar - ADS", category: "Faculdade", tags: ["faculdade", "histórico"], size: "0.8 MB", updated: "2026-07-20", type: "pdf" },
  { id: 4, name: "Contrato de Estágio", category: "Trabalho", tags: ["contrato", "estágio"], size: "2.1 MB", updated: "2026-02-01", type: "pdf" },
  { id: 5, name: "Extrato Bancário Agosto", category: "Financeiro", tags: ["banco", "extrato"], size: "0.4 MB", updated: "2026-08-01", type: "pdf" },
  { id: 6, name: "CRLV Moto 2026", category: "Veículos", tags: ["moto", "documento"], size: "0.3 MB", updated: "2026-02-15", type: "pdf" },
  { id: 7, name: "Certificado React - Rocketseat", category: "Certificados", tags: ["certificado", "react"], size: "0.2 MB", updated: "2026-05-18", type: "pdf" },
  { id: 8, name: "Comprovante IPVA 2026", category: "Veículos", tags: ["ipva", "moto"], size: "0.1 MB", updated: "2026-04-10", type: "pdf" },
];

export type Page =
  | "dashboard"
  | "inbox"
  | "agenda"
  | "tasks"
  | "goals"
  | "projects"
  | "notes"
  | "finances"
  | "studies"
  | "career"
  | "assets"
  | "documents"
  | "assistant"
  | "settings";
