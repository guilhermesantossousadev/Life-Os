import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles } from "lucide-react";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  time: string;
}

const suggestions = [
  "Quais tarefas tenho amanhã?",
  "Quanto gastei esse mês?",
  "Quanto falta para minha meta de comprar o carro?",
  "Tenho algum trabalho da faculdade próximo?",
  "Organize minha semana.",
  "Quanto ainda tenho de parcelas?",
];

const getResponse = (question: string): string => {
  const q = question.toLowerCase();
  if (q.includes("tarefa") || q.includes("amanhã"))
    return "Amanhã você tem 2 tarefas agendadas:\n\n• **Pagar fatura do cartão Nubank** (Alta prioridade)\n• **Consulta médica às 10h30** (Agenda)\n\nQuando quiser, posso detalhar alguma delas.";
  if (q.includes("gast") || q.includes("mês"))
    return "Esse mês você gastou **R$ 830,20** no total. As maiores categorias foram:\n\n• Alimentação: R$ 422,90\n• Transporte: R$ 138,50\n• Educação: R$ 79,90\n\nVocê está dentro do orçamento em todas as categorias.";
  if (q.includes("meta") || q.includes("carro"))
    return "Para a meta **Comprar carro** você já juntou R$ 8.400 de R$ 30.000 necessários — isso é 28% do objetivo. No ritmo atual, você deve atingir a meta em **aproximadamente 18 meses**.";
  if (q.includes("faculdade") || q.includes("trabalho") || q.includes("prova"))
    return "Você tem 2 atividades urgentes na faculdade:\n\n• **Trabalho de Análise de Sistemas** — entrega em 24/08\n• **Prova P2 de Banco de Dados** — em 27/08\n\nRecomendo priorizar o trabalho primeiro, já que o prazo é mais próximo.";
  if (q.includes("semana") || q.includes("organiz"))
    return "Sua semana está assim:\n\n**Segunda a Quarta:** 3 tarefas de trabalho + 2 aulas\n**Quinta:** Prova de Banco de Dados\n**Sexta a Domingo:** Mais tranquilo, bom para avançar nos estudos de SAP\n\nRecomendo dedicar 1h diária ao ABAP para manter o ritmo.";
  if (q.includes("parcela"))
    return "Você possui 3 compras parceladas ativas:\n\n• Notebook Dell — R$ 258,25/mês (restam 8 parcelas = R$ 2.066)\n• Teclado Mecânico — R$ 75/mês (restam 3 parcelas = R$ 225)\n• Seguro do carro — R$ 200/mês (restam 5 parcelas = R$ 1.000)\n\n**Total restante: R$ 3.291**";
  return "Entendido! Posso ajudar com informações sobre tarefas, finanças, agenda, metas, estudos e muito mais. O que você gostaria de saber?";
};

const timeNow = () => new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

export default function Assistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1, role: "assistant",
      content: "Olá, Guilherme! Sou seu assistente pessoal. Posso responder perguntas sobre suas tarefas, finanças, metas, faculdade e muito mais. O que você quer saber?",
      time: "22:00",
    },
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = (text?: string) => {
    const content = (text || input).trim();
    if (!content) return;
    const t = timeNow();
    const userMsg: Message = { id: Date.now(), role: "user", content, time: t };
    setMessages(m => [...m, userMsg]);
    setInput("");
    setTimeout(() => {
      setMessages(m => [...m, { id: Date.now() + 1, role: "assistant", content: getResponse(content), time: timeNow() }]);
    }, 600);
  };

  const renderContent = (text: string) => {
    return text.split("\n").map((line, i) => {
      const bold = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      if (line.startsWith("•")) return <p key={i} className="flex gap-2 text-[13.5px] leading-relaxed"><span className="text-[var(--primary)] flex-shrink-0">•</span><span dangerouslySetInnerHTML={{ __html: bold.slice(1).trim() }} /></p>;
      if (line === "") return <br key={i} />;
      return <p key={i} className="text-[13.5px] leading-relaxed" dangerouslySetInnerHTML={{ __html: bold }} />;
    });
  };

  return (
    <div className="flex flex-col h-full" style={{ fontFamily: "var(--font-ui)" }}>
      {/* Header */}
      <div className="bg-white border-b border-[var(--border)] px-6 py-4 flex items-center gap-3 flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center">
          <Bot size={15} className="text-white" />
        </div>
        <div>
          <p className="text-[14px] font-semibold text-[var(--foreground)]">Assistente Life OS</p>
          <p className="text-[11px] text-[var(--muted-foreground)] flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" /> Online</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 bg-[var(--background)]">
        {messages.map(msg => (
          <div key={msg.id} className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === "assistant" ? "bg-[var(--primary)]" : "bg-[var(--secondary)] border border-[var(--border)]"}`}>
              {msg.role === "assistant" ? <Bot size={13} className="text-white" /> : <User size={13} className="text-[var(--muted-foreground)]" />}
            </div>
            <div className={`max-w-lg rounded-2xl px-4 py-3 ${msg.role === "assistant" ? "bg-white border border-[var(--border)] rounded-tl-sm" : "bg-[var(--primary)] text-white rounded-tr-sm"}`}>
              <div className={msg.role === "user" ? "text-white" : ""}>
                {renderContent(msg.content)}
              </div>
              <p className={`text-[10px] mt-1.5 ${msg.role === "user" ? "text-blue-100" : "text-[var(--muted-foreground)]"}`}>{msg.time}</p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 2 && (
        <div className="px-6 pb-3 flex-shrink-0">
          <p className="text-[11px] font-semibold text-[var(--muted-foreground)] mb-2 flex items-center gap-1"><Sparkles size={10} /> Sugestões</p>
          <div className="flex gap-2 flex-wrap">
            {suggestions.slice(0, 4).map(s => (
              <button
                key={s}
                onClick={() => send(s)}
                className="px-3 py-1.5 rounded-full bg-white border border-[var(--border)] text-[12px] text-[var(--foreground)] hover:border-[var(--primary)]/40 hover:bg-[var(--accent)] transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-[var(--border)] bg-white px-5 py-4 flex-shrink-0">
        <div className="flex items-center gap-3 bg-[var(--secondary)] rounded-xl px-4 py-2.5">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
            placeholder="Pergunte qualquer coisa sobre seu Life OS..."
            className="flex-1 text-[13.5px] bg-transparent text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]"
          />
          <button
            onClick={() => send()}
            disabled={!input.trim()}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-[var(--primary)] text-white disabled:opacity-40 hover:bg-blue-700 transition-all flex-shrink-0"
          >
            <Send size={12} />
          </button>
        </div>
        <p className="text-[10.5px] text-[var(--muted-foreground)] text-center mt-2">Enter para enviar</p>
      </div>
    </div>
  );
}
