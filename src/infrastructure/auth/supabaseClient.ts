import { createClient } from "@supabase/supabase-js"
import type { AuthGateway } from "@/application/ports/auth"

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

const supabaseConfigured = Boolean(url && anonKey)
export const supabase = createClient(
  url || "https://invalid.local",
  anonKey || "missing-anon-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
)

export const supabaseAuthGateway: AuthGateway = {
  configured: supabaseConfigured,
  async getSession() {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    return data.session
  },
  subscribe(listener) {
    const { data } = supabase.auth.onAuthStateChange((_event, session) =>
      listener(session),
    )
    return () => data.subscription.unsubscribe()
  },
  async signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
  },
  async signUp(name, email, password) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })
    if (error) throw error
  },
  async resetPassword(email, redirectTo) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    })
    if (error) throw error
  },
  async updateEmail(email) {
    const { error } = await supabase.auth.updateUser({ email })
    if (error) throw error
  },
  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },
}
