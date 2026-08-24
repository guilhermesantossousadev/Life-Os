export interface AuthUser {
  email?: string
}

export interface AuthSession {
  user: AuthUser
}

export interface AuthGateway {
  readonly configured: boolean
  getSession(): Promise<AuthSession | null>
  subscribe(listener: (session: AuthSession | null) => void): () => void
  signIn(email: string, password: string): Promise<void>
  signUp(name: string, email: string, password: string): Promise<void>
  resetPassword(email: string, redirectTo: string): Promise<void>
  updateEmail(email: string): Promise<void>
  signOut(): Promise<void>
}
