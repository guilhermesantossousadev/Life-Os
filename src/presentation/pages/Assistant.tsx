import { Bot, Construction } from "lucide-react"

export default function Assistant() {
  return (
    <div
      className="h-full grid place-items-center p-6 bg-[var(--background)]"
      style={{ fontFamily: "var(--font-ui)" }}
    >
      <div className="max-w-md text-center bg-white border border-[var(--border)] rounded-2xl p-8 shadow-sm">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-[var(--accent)] text-[var(--primary)] grid place-items-center mb-5">
          <Bot size={23} />
        </div>
        <h1 className="text-xl font-semibold mb-2">
          Assistente em desenvolvimento
        </h1>
        <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">
          O assistente inteligente está reservado para uma fase futura. Nenhuma
          IA, chatbot ou API externa está ativa nesta versão.
        </p>
        <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-amber-50 text-amber-800 px-3 py-1.5 text-xs font-medium">
          <Construction size={13} /> Em desenvolvimento
        </div>
      </div>
    </div>
  )
}
