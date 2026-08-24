import { useState, type FormEvent } from "react"
import { CheckCircle2, Loader2, LockKeyhole } from "lucide-react"
import { useAuth } from "@/application/state/AuthContext"

type Mode = "login" | "register" | "forgot"

export default function AuthPage() {
  const { signIn, signUp, resetPassword } = useAuth()
  const [mode, setMode] = useState<Mode>("login")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      if (mode === "login") await signIn(email, password)
      else if (mode === "register") {
        await signUp(name, email, password)
        setMessage(
          "Cadastro realizado. Verifique seu e-mail se a confirmação estiver habilitada.",
        )
      } else {
        await resetPassword(email)
        setMessage("Enviamos as instruções de recuperação para seu e-mail.")
      }
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Não foi possível concluir a autenticação.",
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <main
      className="min-h-screen bg-[var(--background)] grid lg:grid-cols-2"
      style={{ fontFamily: "var(--font-ui)" }}
    >
      <section className="hidden lg:flex bg-slate-950 text-white p-14 flex-col justify-between">
        <div className="flex items-center gap-3 text-lg font-bold">
          <span className="w-9 h-9 rounded-xl bg-blue-600 grid place-items-center">
            L
          </span>
          Life OS
        </div>
        <div className="max-w-lg">
          <h1 className="text-4xl font-semibold leading-tight mb-5">
            Sua vida organizada em um único lugar.
          </h1>
          <p className="text-slate-300 leading-relaxed">
            Tarefas, agenda, metas, projetos, estudos, patrimônio, documentos e
            finanças sincronizados com segurança.
          </p>
        </div>
        <p className="text-xs text-slate-500">
          Dados privados, autenticação real e acesso em qualquer dispositivo.
        </p>
      </section>
      <section className="flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white border border-[var(--border)] rounded-2xl shadow-sm p-7">
          <div className="lg:hidden flex items-center gap-2 font-bold mb-7">
            <span className="w-8 h-8 rounded-lg bg-blue-600 text-white grid place-items-center">
              L
            </span>
            Life OS
          </div>
          <div className="w-10 h-10 rounded-xl bg-[var(--accent)] text-[var(--primary)] grid place-items-center mb-5">
            <LockKeyhole size={19} />
          </div>
          <h1 className="text-2xl font-semibold">
            {mode === "login"
              ? "Entrar"
              : mode === "register"
                ? "Criar sua conta"
                : "Recuperar acesso"}
          </h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1 mb-6">
            {mode === "forgot"
              ? "Informe o e-mail da sua conta."
              : "Use seu e-mail e senha para continuar."}
          </p>
          <form onSubmit={submit} className="space-y-4">
            {mode === "register" && (
              <label className="block text-sm font-medium">
                Nome
                <input
                  required
                  maxLength={150}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  autoComplete="name"
                  className="field-input mt-1.5"
                />
              </label>
            )}
            <label className="block text-sm font-medium">
              E-mail
              <input
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                className="field-input mt-1.5"
              />
            </label>
            {mode !== "forgot" && (
              <label className="block text-sm font-medium">
                Senha
                <input
                  required
                  minLength={8}
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete={
                    mode === "login" ? "current-password" : "new-password"
                  }
                  className="field-input mt-1.5"
                />
              </label>
            )}
            {error && (
              <div
                role="alert"
                className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3"
              >
                {error}
              </div>
            )}
            {message && (
              <div
                role="status"
                className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex gap-2"
              >
                <CheckCircle2 size={16} />
                {message}
              </div>
            )}
            <button
              disabled={busy}
              className="w-full bg-[var(--primary)] text-white rounded-lg py-2.5 text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {busy && <Loader2 size={15} className="animate-spin" />}
              {mode === "login"
                ? "Entrar"
                : mode === "register"
                  ? "Criar conta"
                  : "Enviar instruções"}
            </button>
          </form>
          <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm text-[var(--primary)]">
            {mode !== "login" && (
              <button
                onClick={() => {
                  setMode("login")
                  setError(null)
                }}
              >
                Voltar ao login
              </button>
            )}
            {mode === "login" && (
              <>
                <button onClick={() => setMode("register")}>Criar conta</button>
                <button onClick={() => setMode("forgot")}>
                  Esqueci minha senha
                </button>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}

export function SupabaseNotConfigured() {
  return (
    <main className="min-h-screen grid place-items-center bg-[var(--background)] p-6">
      <div className="max-w-lg bg-white border border-amber-200 rounded-2xl p-7">
        <h1 className="text-xl font-semibold mb-2">Configuração necessária</h1>
        <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
          Defina <code>VITE_SUPABASE_URL</code> e{" "}
          <code>VITE_SUPABASE_ANON_KEY</code> no arquivo <code>.env</code>.
          Consulte o README para preparar o ambiente.
        </p>
      </div>
    </main>
  )
}
