import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'
import { api } from './lib/api'
import { fallbackAppointments, fallbackClients, fallbackDashboard, fallbackPayments } from './lib/fallback'
import type {
  Appointment,
  AppointmentCreatePayload,
  Client,
  ClientCreatePayload,
  Dashboard,
  Payment,
  PaymentCreatePayload,
} from './types'

const defaultClientForm = {
  full_name: '',
  phone: '',
  email: '',
  instagram_handle: '',
  preferred_service: '',
  notes: '',
  has_active_package: false,
  anamnesis_summary: '',
  anamnesis_pain_points: '',
  contraindications: '',
  plan_title: '',
  plan_session_type: 'Pacote',
  plan_sessions_total: '4',
  plan_sessions_remaining: '4',
  plan_price_total: '',
}

const defaultAppointmentForm = {
  client_id: '',
  service_name: '',
  scheduled_at: '',
  duration_minutes: '60',
  status: 'scheduled',
  notes: '',
}

const defaultPaymentForm = {
  client_id: '',
  amount: '',
  method: 'pix',
  description: '',
}

function App() {
  const [dashboard, setDashboard] = useState<Dashboard>(fallbackDashboard)
  const [clients, setClients] = useState<Client[]>(fallbackClients)
  const [appointments, setAppointments] = useState<Appointment[]>(fallbackAppointments)
  const [payments, setPayments] = useState<Payment[]>(fallbackPayments)
  const [status, setStatus] = useState('Aguardando autenticacao.')
  const [token, setToken] = useState('')
  const [loginError, setLoginError] = useState('')
  const [authForm, setAuthForm] = useState({
    email: 'admin@brmassoterapia.com',
    password: 'admin123',
  })
  const [clientForm, setClientForm] = useState(defaultClientForm)
  const [appointmentForm, setAppointmentForm] = useState(defaultAppointmentForm)
  const [paymentForm, setPaymentForm] = useState(defaultPaymentForm)
  const [submitMessage, setSubmitMessage] = useState('')

  async function loadData() {
    const [dashboardData, clientsData, appointmentsData, paymentsData] = await Promise.all([
      api.dashboard(),
      api.clients(),
      api.appointments(),
      api.payments(),
    ])
    setDashboard(dashboardData)
    setClients(clientsData)
    setAppointments(appointmentsData)
    setPayments(paymentsData)
  }

  useEffect(() => {
    if (!token) {
      return
    }

    async function bootstrap() {
      try {
        await loadData()
        setStatus('Painel conectado e pronto para operacao.')
      } catch {
        setStatus('Falha ao carregar dados reais. Exibindo modo demonstracao.')
      }
    }

    void bootstrap()
  }, [token])

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoginError('')
    setSubmitMessage('')
    try {
      const response = await api.login(authForm)
      setToken(response.access_token)
      setStatus('Autenticacao validada.')
    } catch {
      setLoginError('Nao foi possivel autenticar com as credenciais informadas.')
    }
  }

  async function handleCreateClient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const payload: ClientCreatePayload = {
      full_name: clientForm.full_name,
      phone: clientForm.phone,
      email: clientForm.email || null,
      instagram_handle: clientForm.instagram_handle || null,
      preferred_service: clientForm.preferred_service || null,
      notes: clientForm.notes || null,
      has_active_package: clientForm.has_active_package,
      anamnesis:
        clientForm.anamnesis_summary && clientForm.anamnesis_pain_points
          ? {
              summary: clientForm.anamnesis_summary,
              pain_points: clientForm.anamnesis_pain_points,
              contraindications: clientForm.contraindications || null,
            }
          : undefined,
      plans: clientForm.plan_title
        ? [
            {
              title: clientForm.plan_title,
              session_type: clientForm.plan_session_type,
              sessions_total: Number(clientForm.plan_sessions_total),
              sessions_remaining: Number(clientForm.plan_sessions_remaining),
              price_total: Number(clientForm.plan_price_total || 0),
              active: true,
            },
          ]
        : [],
    }
    await api.createClient(payload)
    await loadData()
    setClientForm(defaultClientForm)
    setSubmitMessage('Cliente cadastrado com sucesso.')
  }

  async function handleCreateAppointment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const payload: AppointmentCreatePayload = {
      client_id: Number(appointmentForm.client_id),
      service_name: appointmentForm.service_name,
      scheduled_at: new Date(appointmentForm.scheduled_at).toISOString(),
      duration_minutes: Number(appointmentForm.duration_minutes),
      status: appointmentForm.status,
      notes: appointmentForm.notes || null,
    }
    await api.createAppointment(payload)
    await loadData()
    setAppointmentForm(defaultAppointmentForm)
    setSubmitMessage('Agendamento criado e sincronizado na API.')
  }

  async function handleCreatePayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const payload: PaymentCreatePayload = {
      client_id: Number(paymentForm.client_id),
      amount: Number(paymentForm.amount),
      method: paymentForm.method,
      description: paymentForm.description,
    }
    await api.createPayment(payload)
    await loadData()
    setPaymentForm(defaultPaymentForm)
    setSubmitMessage('Pagamento registrado com sucesso.')
  }

  if (!token) {
    return (
      <main className="app-shell auth-shell">
        <section className="panel auth-panel">
          <p className="eyebrow">@b.r.massoterapia</p>
          <h1>Acesso administrativo</h1>
          <p className="hero-copy">
            Entre com o usuario inicial do sistema para liberar cadastro de clientes, agenda e financeiro.
          </p>
          <form className="form-grid" onSubmit={handleLogin}>
            <label>
              E-mail
              <input
                value={authForm.email}
                onChange={(event) => setAuthForm((current) => ({ ...current, email: event.target.value }))}
              />
            </label>
            <label>
              Senha
              <input
                type="password"
                value={authForm.password}
                onChange={(event) => setAuthForm((current) => ({ ...current, password: event.target.value }))}
              />
            </label>
            <button type="submit">Entrar no painel</button>
          </form>
          {loginError ? <p className="feedback error">{loginError}</p> : null}
        </section>
      </main>
    )
  }

  return (
    <main className="app-shell">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">@b.r.massoterapia</p>
          <h1>CRM de massoterapia com agenda, anamnese e pagamentos</h1>
          <p className="hero-copy">
            Painel operacional com login, cadastro de clientes, agendamentos e recebimentos conectados na API.
          </p>
        </div>
        <div className="hero-card">
          <span className="status-pill">{status}</span>
          <div className="cta-grid">
            <a href={dashboard.google_form_url} target="_blank" rel="noreferrer">
              Abrir Google Forms
            </a>
            <span>Google Calendar: {dashboard.calendar_id}</span>
            <span>Pix principal: {dashboard.pix_key}</span>
            <span>Token ativo: {token.slice(0, 16)}...</span>
          </div>
        </div>
      </section>

      <section className="metrics-grid">
        <article>
          <strong>{dashboard.clients_total}</strong>
          <span>Clientes cadastrados</span>
        </article>
        <article>
          <strong>{dashboard.active_packages}</strong>
          <span>Pacotes ativos</span>
        </article>
        <article>
          <strong>R$ {dashboard.monthly_revenue.toFixed(2)}</strong>
          <span>Receita registrada</span>
        </article>
        <article>
          <strong>{dashboard.upcoming_appointments}</strong>
          <span>Atendimentos futuros</span>
        </article>
      </section>

      <section className="content-grid">
        <article className="panel">
          <div className="panel-heading">
            <h2>Novo cliente</h2>
            <p>Cadastro com anamnese inicial e pacote opcional.</p>
          </div>
          <form className="form-grid" onSubmit={handleCreateClient}>
            <label>
              Nome completo
              <input value={clientForm.full_name} onChange={(event) => setClientForm((current) => ({ ...current, full_name: event.target.value }))} required />
            </label>
            <label>
              Telefone
              <input value={clientForm.phone} onChange={(event) => setClientForm((current) => ({ ...current, phone: event.target.value }))} required />
            </label>
            <label>
              E-mail
              <input value={clientForm.email} onChange={(event) => setClientForm((current) => ({ ...current, email: event.target.value }))} />
            </label>
            <label>
              Instagram
              <input value={clientForm.instagram_handle} onChange={(event) => setClientForm((current) => ({ ...current, instagram_handle: event.target.value }))} />
            </label>
            <label>
              Servico principal
              <input value={clientForm.preferred_service} onChange={(event) => setClientForm((current) => ({ ...current, preferred_service: event.target.value }))} />
            </label>
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={clientForm.has_active_package}
                onChange={(event) => setClientForm((current) => ({ ...current, has_active_package: event.target.checked }))}
              />
              Pacote ativo
            </label>
            <label className="full-span">
              Observacoes
              <textarea value={clientForm.notes} onChange={(event) => setClientForm((current) => ({ ...current, notes: event.target.value }))} />
            </label>
            <label className="full-span">
              Resumo da anamnese
              <textarea
                value={clientForm.anamnesis_summary}
                onChange={(event) => setClientForm((current) => ({ ...current, anamnesis_summary: event.target.value }))}
              />
            </label>
            <label className="full-span">
              Pontos de dor
              <textarea
                value={clientForm.anamnesis_pain_points}
                onChange={(event) => setClientForm((current) => ({ ...current, anamnesis_pain_points: event.target.value }))}
              />
            </label>
            <label className="full-span">
              Contraindicacoes
              <textarea
                value={clientForm.contraindications}
                onChange={(event) => setClientForm((current) => ({ ...current, contraindications: event.target.value }))}
              />
            </label>
            <label>
              Nome do pacote
              <input value={clientForm.plan_title} onChange={(event) => setClientForm((current) => ({ ...current, plan_title: event.target.value }))} />
            </label>
            <label>
              Tipo
              <input
                value={clientForm.plan_session_type}
                onChange={(event) => setClientForm((current) => ({ ...current, plan_session_type: event.target.value }))}
              />
            </label>
            <label>
              Sessoes totais
              <input
                type="number"
                value={clientForm.plan_sessions_total}
                onChange={(event) => setClientForm((current) => ({ ...current, plan_sessions_total: event.target.value }))}
              />
            </label>
            <label>
              Sessoes restantes
              <input
                type="number"
                value={clientForm.plan_sessions_remaining}
                onChange={(event) => setClientForm((current) => ({ ...current, plan_sessions_remaining: event.target.value }))}
              />
            </label>
            <label>
              Valor total
              <input
                type="number"
                step="0.01"
                value={clientForm.plan_price_total}
                onChange={(event) => setClientForm((current) => ({ ...current, plan_price_total: event.target.value }))}
              />
            </label>
            <button type="submit" className="full-span">
              Salvar cliente
            </button>
          </form>
        </article>

        <article className="panel">
          <div className="panel-heading">
            <h2>Novo agendamento</h2>
            <p>Cria atendimento e gera identificador de sincronizacao.</p>
          </div>
          <form className="form-grid" onSubmit={handleCreateAppointment}>
            <label>
              Cliente
              <select value={appointmentForm.client_id} onChange={(event) => setAppointmentForm((current) => ({ ...current, client_id: event.target.value }))} required>
                <option value="">Selecione</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.full_name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Servico
              <input
                value={appointmentForm.service_name}
                onChange={(event) => setAppointmentForm((current) => ({ ...current, service_name: event.target.value }))}
                required
              />
            </label>
            <label>
              Data e hora
              <input
                type="datetime-local"
                value={appointmentForm.scheduled_at}
                onChange={(event) => setAppointmentForm((current) => ({ ...current, scheduled_at: event.target.value }))}
                required
              />
            </label>
            <label>
              Duracao
              <input
                type="number"
                value={appointmentForm.duration_minutes}
                onChange={(event) => setAppointmentForm((current) => ({ ...current, duration_minutes: event.target.value }))}
              />
            </label>
            <label>
              Status
              <select value={appointmentForm.status} onChange={(event) => setAppointmentForm((current) => ({ ...current, status: event.target.value }))}>
                <option value="scheduled">scheduled</option>
                <option value="confirmed">confirmed</option>
                <option value="completed">completed</option>
                <option value="cancelled">cancelled</option>
              </select>
            </label>
            <label className="full-span">
              Observacoes
              <textarea value={appointmentForm.notes} onChange={(event) => setAppointmentForm((current) => ({ ...current, notes: event.target.value }))} />
            </label>
            <button type="submit" className="full-span">
              Salvar agendamento
            </button>
          </form>
        </article>
      </section>

      <section className="content-grid">
        <article className="panel">
          <div className="panel-heading">
            <h2>Novo pagamento</h2>
            <p>Registro financeiro inicial para Pix, credito ou debito.</p>
          </div>
          <form className="form-grid" onSubmit={handleCreatePayment}>
            <label>
              Cliente
              <select value={paymentForm.client_id} onChange={(event) => setPaymentForm((current) => ({ ...current, client_id: event.target.value }))} required>
                <option value="">Selecione</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.full_name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Valor
              <input
                type="number"
                step="0.01"
                value={paymentForm.amount}
                onChange={(event) => setPaymentForm((current) => ({ ...current, amount: event.target.value }))}
                required
              />
            </label>
            <label>
              Metodo
              <select value={paymentForm.method} onChange={(event) => setPaymentForm((current) => ({ ...current, method: event.target.value }))}>
                <option value="pix">pix</option>
                <option value="credit_card">credit_card</option>
                <option value="debit_card">debit_card</option>
              </select>
            </label>
            <label className="full-span">
              Descricao
              <input
                value={paymentForm.description}
                onChange={(event) => setPaymentForm((current) => ({ ...current, description: event.target.value }))}
                required
              />
            </label>
            <button type="submit" className="full-span">
              Salvar pagamento
            </button>
          </form>
          {submitMessage ? <p className="feedback">{submitMessage}</p> : null}
        </article>

        <article className="panel">
          <div className="panel-heading">
            <h2>Clientes e anamnese</h2>
            <p>Base central com historico clinico e planos.</p>
          </div>
          <div className="list-grid">
            {clients.map((client) => (
              <div key={client.id} className="card">
                <div className="card-header">
                  <div>
                    <h3>{client.full_name}</h3>
                    <p>{client.preferred_service ?? 'Servico a definir'}</p>
                  </div>
                  <span className={client.has_active_package ? 'tag active' : 'tag'}>
                    {client.has_active_package ? 'Pacote ativo' : 'Avulso'}
                  </span>
                </div>
                <p>{client.notes ?? 'Sem observacoes registradas.'}</p>
                <p>
                  <strong>Contato:</strong> {client.phone} {client.instagram_handle ? `| ${client.instagram_handle}` : ''}
                </p>
                <p>
                  <strong>Anamnese:</strong> {client.anamneses[0]?.summary ?? 'Nao preenchida'}
                </p>
                <p>
                  <strong>Plano:</strong>{' '}
                  {client.plans[0]
                    ? `${client.plans[0].title} (${client.plans[0].sessions_remaining}/${client.plans[0].sessions_total})`
                    : 'Nenhum'}
                </p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="content-grid">
        <article className="panel">
          <div className="panel-heading">
            <h2>Agenda integrada</h2>
            <p>Horarios sincronizados para o Google Calendar.</p>
          </div>
          <div className="list-grid">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="schedule-row">
                <div>
                  <h3>{appointment.service_name}</h3>
                  <p>{new Date(appointment.scheduled_at).toLocaleString('pt-BR')}</p>
                </div>
                <div>
                  <span className="tag">{appointment.status}</span>
                  <p>{appointment.duration_minutes} min</p>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <div className="panel-heading">
            <h2>Financeiro</h2>
            <p>Recebimentos por Pix e cartoes.</p>
          </div>
          <div className="list-grid">
            {payments.map((payment) => (
              <div key={payment.id} className="payment-row">
                <div>
                  <h3>{payment.description}</h3>
                  <p>{payment.method}</p>
                </div>
                <div>
                  <strong>R$ {payment.amount.toFixed(2)}</strong>
                  <p>{payment.status}</p>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  )
}

export default App
