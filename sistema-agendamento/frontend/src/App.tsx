import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AgendaPage } from './pages/AgendaPage'
import { ClientDetailPage } from './pages/ClientDetailPage'
import { ClientsPage } from './pages/ClientsPage'
import { LoginPage } from './pages/LoginPage'
import { AccountPage } from './pages/AccountPage'
import { NewAppointmentPage } from './pages/NewAppointmentPage'

function ProtectedRoutes() {
  const { token, loading } = useAuth()
  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-sm text-zinc-500">
        Carregando sessao…
      </div>
    )
  }
  if (!token) {
    return <Navigate to="/login" replace />
  }
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<AgendaPage />} />
        <Route path="clientes" element={<ClientsPage />} />
        <Route path="clientes/:id" element={<ClientDetailPage />} />
        <Route path="novo-agendamento" element={<NewAppointmentPage />} />
        <Route path="conta" element={<AccountPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/*" element={<ProtectedRoutes />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
