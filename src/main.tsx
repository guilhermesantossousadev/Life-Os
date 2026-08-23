import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/app/App'
import './index.css'
import { DataProvider } from '@/application/state/DataContext'
import { AuthProvider, useAuth } from '@/application/state/AuthContext'
import AuthPage, { SupabaseNotConfigured } from '@/presentation/pages/Auth'
import { BrowserRouter } from 'react-router-dom'
import { supabaseAuthGateway } from '@/infrastructure/auth/supabaseClient'
import { api } from '@/infrastructure/http/apiClient'
import { resources } from '@/infrastructure/http/resourceGateway'

function Root() {
  const { session, loading, configured } = useAuth()
  if (loading) return <div className="min-h-screen grid place-items-center text-sm text-[var(--muted-foreground)]">Recuperando sua sessão...</div>
  if (!configured) return <SupabaseNotConfigured />
  if (!session) return <AuthPage />
  return <DataProvider apiClient={api} resourceGateway={resources}><App /></DataProvider>
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter><AuthProvider gateway={supabaseAuthGateway}><Root /></AuthProvider></BrowserRouter>
  </React.StrictMode>,
)
