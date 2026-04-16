import { useEffect, useState } from 'react'
import './App.css'
import { api } from './lib/api'
import { fallbackAppointments, fallbackClients, fallbackDashboard, fallbackPayments } from './lib/fallback'
import type { Appointment, Client, Dashboard, Payment } from './types'

function App() {
  const [dashboard, setDashboard] = useState<Dashboard>(fallbackDashboard)
  const [clients, setClients] = useState<Client[]>(fallbackClients)
  const [appointments, setAppointments] = useState<Appointment[]>(fallbackAppointments)
  const [payments, setPayments] = useState<Payment[]>(fallbackPayments)
  const [status, setStatus] = useState('Conectando com a API...')

  useEffect(() => {
    async function loadData() {
      try {
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
        setStatus('API conectada com sucesso.')
      } catch {
        setStatus('Modo demonstracao ativo. A API ainda nao respondeu.')
      }
    }

    void loadData()
  }, [])

  return (
    <main className="app-shell">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">@b.r.massoterapia</p>
          <h1>CRM de massoterapia com agenda, anamnese e pagamentos</h1>
          <p className="hero-copy">
            Painel operacional para clientes, agenda Google, Google Forms, sessoes avulsas, pacotes e
            recebimentos via Pix, credito e debito.
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
      </section>

      <section className="content-grid">
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

        <article className="panel accent">
          <div className="panel-heading">
            <h2>MVP entregue</h2>
            <p>Base pronta para ampliar integracoes reais.</p>
          </div>
          <ul className="checklist">
            <li>API FastAPI com autenticacao e seed inicial</li>
            <li>Modelos de clientes, anamnese, agenda, planos e pagamentos</li>
            <li>Frontend React conectado na API</li>
            <li>Dockerfiles e compose para PostgreSQL, frontend e backend</li>
            <li>Config base para OCI e evolucao futura</li>
          </ul>
        </article>
      </section>
    </main>
  )
}

export default App
