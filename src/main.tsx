import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { DataProvider } from './context/DataContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import AuthPage, { SupabaseNotConfigured } from './pages/Auth'
import { BrowserRouter } from 'react-router-dom'

function Root() {
  const { session, loading, configured } = useAuth()
  if (loading) return <div className="min-h-screen grid place-items-center text-sm text-[var(--muted-foreground)]">Recuperando sua sessão...</div>
  if (!configured) return <SupabaseNotConfigured />
  if (!session) return <AuthPage />
  return <DataProvider><App /></DataProvider>
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter><AuthProvider><Root /></AuthProvider></BrowserRouter>
  </React.StrictMode>,
)
