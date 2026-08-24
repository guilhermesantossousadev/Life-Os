import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import type {
  AuthGateway,
  AuthSession,
  AuthUser,
} from "@/application/ports/auth"

interface AuthValue {
  session: AuthSession | null
  user: AuthUser | null
  loading: boolean
  configured: boolean
  signIn(email: string, password: string): Promise<void>
  signUp(name: string, email: string, password: string): Promise<void>
  resetPassword(email: string): Promise<void>
  updateEmail(email: string): Promise<void>
  signOut(): Promise<void>
}

const AuthContext = createContext<AuthValue | null>(null)

export function AuthProvider({
  children,
  gateway,
}: {
  children: ReactNode
  gateway: AuthGateway
}) {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!gateway.configured) {
      setLoading(false)
      return
    }
    gateway
      .getSession()
      .then((next) => {
        setSession(next)
        setLoading(false)
      })
      .catch(() => setLoading(false))
    return gateway.subscribe((next) => {
      setSession(next)
      setLoading(false)
    })
  }, [gateway])

  const value = useMemo<AuthValue>(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      configured: gateway.configured,
      signIn: gateway.signIn,
      signUp: gateway.signUp,
      resetPassword: (email) =>
        gateway.resetPassword(email, `${window.location.origin}/settings`),
      updateEmail: gateway.updateEmail,
      signOut: gateway.signOut,
    }),
    [gateway, session, loading],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error("useAuth deve ser usado dentro de AuthProvider")
  return value
}
