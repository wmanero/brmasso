import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const mobileNavClass = ({ isActive }: { isActive: boolean }) =>
  `flex flex-1 flex-col items-center gap-1 py-2 text-xs font-medium ${
    isActive ? 'text-violet-700' : 'text-zinc-500'
  }`

const desktopNavClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
    isActive ? 'bg-violet-100 text-violet-900' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
  }`

export function AppShell() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-dvh bg-zinc-100 lg:flex">
      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex lg:w-72 lg:shrink-0 lg:flex-col lg:border-r lg:border-zinc-200 lg:bg-white">
        <div className="border-b border-zinc-200 px-6 py-5">
          <p className="text-xs font-medium uppercase tracking-wide text-violet-700">Agenda interna</p>
          <h1 className="mt-1 text-xl font-semibold text-zinc-900">Barbará Rodrigues</h1>
          {user ? (
            <p className="mt-2 text-sm text-zinc-600">
              Logada como <span className="font-medium text-zinc-800">{user.full_name}</span>
            </p>
          ) : null}
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-4">
          <NavLink to="/" end className={desktopNavClass}>
            <span className="text-lg" aria-hidden>
              📅
            </span>
            Agenda
          </NavLink>
          <NavLink to="/clientes" className={desktopNavClass}>
            <span className="text-lg" aria-hidden>
              👤
            </span>
            Clientes
          </NavLink>
          <NavLink to="/novo-agendamento" className={desktopNavClass}>
            <span className="text-lg" aria-hidden>
              ＋
            </span>
            Novo agendamento
          </NavLink>
          <NavLink to="/conta" className={desktopNavClass}>
            <span className="text-lg" aria-hidden>
              ⚙
            </span>
            Minha conta
          </NavLink>
        </nav>

        <div className="border-t border-zinc-200 p-4">
          <button
            type="button"
            onClick={logout}
            className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Sair
          </button>
        </div>
      </aside>

      {/* Conteúdo + header mobile */}
      <div className="flex min-h-dvh flex-1 flex-col">
        <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-zinc-500">Agenda interna</p>
              <h1 className="text-lg font-semibold text-zinc-900">Barbará Rodrigues</h1>
            </div>
            <button
              type="button"
              onClick={logout}
              className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm text-zinc-700"
            >
              Sair
            </button>
          </div>
          {user ? (
            <p className="mx-auto mt-1 max-w-lg text-sm text-zinc-600">
              Logada como <span className="font-medium">{user.full_name}</span>
            </p>
          ) : null}
        </header>

        <main className="flex-1 px-4 py-4 pb-24 lg:px-8 lg:py-8 lg:pb-8">
          <div className="mx-auto w-full max-w-lg lg:max-w-7xl">
            <Outlet />
          </div>
        </main>

        {/* Nav inferior — mobile */}
        <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-zinc-200 bg-white lg:hidden">
          <div className="mx-auto flex max-w-lg">
            <NavLink to="/" end className={mobileNavClass}>
              <span aria-hidden>📅</span>
              Agenda
            </NavLink>
            <NavLink to="/clientes" className={mobileNavClass}>
              <span aria-hidden>👤</span>
              Clientes
            </NavLink>
          <NavLink to="/novo-agendamento" className={mobileNavClass}>
            <span aria-hidden>＋</span>
            Novo
          </NavLink>
          <NavLink to="/conta" className={mobileNavClass}>
            <span aria-hidden>⚙</span>
            Conta
          </NavLink>
        </div>
      </nav>
      </div>
    </div>
  )
}
