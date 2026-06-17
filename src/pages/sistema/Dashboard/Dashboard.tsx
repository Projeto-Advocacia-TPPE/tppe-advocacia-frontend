import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarClock,
  CheckCircle2,
  Clock3,
  ListChecks,
  RefreshCw,
  UsersRound,
} from 'lucide-react';
import { apiRequest, PaginatedResponse } from '../../../services/api';
import styles from './Dashboard.module.css';

type ProcessItem = {
  id: number;
  number: string;
  client_name: string | null;
  court: string;
  action_type: string;
  status: string;
};

type TaskItem = {
  id: number;
  title: string;
  status: string;
  priority: string;
  due_date: string | null;
};

type AppointmentItem = {
  id: number;
  title: string;
  type: string;
  starts_at: string;
  location: string | null;
};

type KanbanColumn = {
  total: number;
};

type KanbanData = {
  TODO: KanbanColumn;
  IN_PROGRESS: KanbanColumn;
  BLOCKED: KanbanColumn;
  DONE: KanbanColumn;
};

type DashboardData = {
  processes: PaginatedResponse<ProcessItem> | null;
  clients: PaginatedResponse<unknown> | null;
  tasks: PaginatedResponse<TaskItem> | null;
  kanban: KanbanData | null;
  appointments: PaginatedResponse<AppointmentItem> | null;
};

const EMPTY_DATA: DashboardData = {
  processes: null,
  clients: null,
  tasks: null,
  kanban: null,
  appointments: null,
};

async function safely<T>(request: Promise<T>): Promise<T | null> {
  try {
    return await request;
  } catch {
    return null;
  }
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    ATIVO: 'Ativo',
    SUSPENSO: 'Suspenso',
    ARQUIVADO: 'Arquivado',
    ENCERRADO: 'Encerrado',
    TODO: 'A fazer',
    IN_PROGRESS: 'Em andamento',
    BLOCKED: 'Bloqueada',
    DONE: 'Concluída',
  };
  return labels[status] ?? status;
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData>(EMPTY_DATA);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadDashboard(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    const now = encodeURIComponent(new Date().toISOString());
    const [processes, clients, tasks, kanbanResponse, appointments] = await Promise.all([
      safely(apiRequest<PaginatedResponse<ProcessItem>>('/processes?limit=5')),
      safely(apiRequest<PaginatedResponse<unknown>>('/clients?limit=1')),
      safely(apiRequest<PaginatedResponse<TaskItem>>('/tasks?limit=5')),
      safely(apiRequest<{ success: true; data: KanbanData }>('/tasks/kanban')),
      safely(
        apiRequest<PaginatedResponse<AppointmentItem>>(
          `/appointments?date_from=${now}&limit=5`,
        ),
      ),
    ]);

    setData({
      processes,
      clients,
      tasks,
      kanban: kanbanResponse?.data ?? null,
      appointments,
    });
    setLoading(false);
    setRefreshing(false);
  }

  useEffect(() => {
    void loadDashboard();
  }, []);

  const openTasks = data.kanban
    ? data.kanban.TODO.total + data.kanban.IN_PROGRESS.total + data.kanban.BLOCKED.total
    : undefined;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Visão geral do escritório</p>
          <h1>Bom trabalho por aqui.</h1>
          <p className={styles.subtitle}>
            Acompanhe processos, agenda e pendências em um só lugar.
          </p>
        </div>
        <button
          className={styles.refreshButton}
          onClick={() => void loadDashboard(true)}
          disabled={refreshing}
          title="Atualizar dashboard"
        >
          <RefreshCw size={17} className={refreshing ? styles.spinning : ''} />
          Atualizar
        </button>
      </header>

      <section className={styles.metrics} aria-label="Indicadores">
        <Metric
          icon={<BriefcaseBusiness size={21} />}
          label="Processos cadastrados"
          value={data.processes?.meta.total}
          loading={loading}
          tone="navy"
        />
        <Metric
          icon={<UsersRound size={21} />}
          label="Clientes ativos"
          value={data.clients?.meta.total}
          loading={loading}
          tone="green"
        />
        <Metric
          icon={<ListChecks size={21} />}
          label="Tarefas em aberto"
          value={openTasks}
          loading={loading}
          tone="amber"
        />
        <Metric
          icon={<CalendarClock size={21} />}
          label="Próximos compromissos"
          value={data.appointments?.meta.total}
          loading={loading}
          tone="crimson"
        />
      </section>

      <div className={styles.contentGrid}>
        <section className={styles.panel}>
          <PanelHeader title="Processos recentes" href="/sistema/processos" />
          <div className={styles.list}>
            {loading && <LoadingRows />}
            {!loading && !data.processes && <Unavailable />}
            {!loading && data.processes?.data.length === 0 && (
              <Empty message="Nenhum processo cadastrado." />
            )}
            {data.processes?.data.map(process => (
              <Link
                to="/sistema/processos"
                className={styles.processRow}
                key={process.id}
              >
                <div className={styles.rowIcon}>
                  <BriefcaseBusiness size={18} />
                </div>
                <div className={styles.rowMain}>
                  <strong>{process.number}</strong>
                  <span>{process.client_name ?? process.action_type}</span>
                </div>
                <div className={styles.rowMeta}>
                  <span className={styles.status}>{statusLabel(process.status)}</span>
                  <small>{process.court}</small>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className={styles.panel}>
          <PanelHeader title="Próximos compromissos" href="/sistema/agenda" />
          <div className={styles.list}>
            {loading && <LoadingRows />}
            {!loading && !data.appointments && <Unavailable />}
            {!loading && data.appointments?.data.length === 0 && (
              <Empty message="Sua agenda está livre." />
            )}
            {data.appointments?.data.map(appointment => (
              <Link
                to="/sistema/agenda"
                className={styles.appointmentRow}
                key={appointment.id}
              >
                <div className={styles.dateBadge}>
                  <CalendarClock size={17} />
                </div>
                <div className={styles.rowMain}>
                  <strong>{appointment.title}</strong>
                  <span>{appointment.location ?? statusLabel(appointment.type)}</span>
                </div>
                <time>{formatDate(appointment.starts_at)}</time>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <section className={styles.panel}>
        <PanelHeader title="Tarefas prioritárias" href="/sistema/tarefas" />
        <div className={styles.taskGrid}>
          {loading && <LoadingRows />}
          {!loading && !data.tasks && <Unavailable />}
          {!loading && data.tasks?.data.length === 0 && (
            <Empty message="Nenhuma tarefa pendente." />
          )}
          {data.tasks?.data.map(task => (
            <Link to="/sistema/tarefas" className={styles.taskItem} key={task.id}>
              {task.status === 'DONE' ? (
                <CheckCircle2 size={19} className={styles.doneIcon} />
              ) : (
                <Clock3 size={19} className={styles.pendingIcon} />
              )}
              <div>
                <strong>{task.title}</strong>
                <span>
                  {statusLabel(task.status)}
                  {task.due_date ? ` · ${formatDate(task.due_date)}` : ''}
                </span>
              </div>
              <span className={`${styles.priority} ${styles[task.priority.toLowerCase()]}`}>
                {statusLabel(task.priority)}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function Metric({
  icon,
  label,
  value,
  loading,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | undefined;
  loading: boolean;
  tone: string;
}) {
  return (
    <article className={styles.metric}>
      <div className={`${styles.metricIcon} ${styles[tone]}`}>{icon}</div>
      <div>
        <span>{label}</span>
        <strong>{loading ? '—' : value ?? '—'}</strong>
      </div>
    </article>
  );
}

function PanelHeader({ title, href }: { title: string; href: string }) {
  return (
    <div className={styles.panelHeader}>
      <h2>{title}</h2>
      <Link to={href}>
        Ver tudo <ArrowRight size={15} />
      </Link>
    </div>
  );
}

function LoadingRows() {
  return (
    <>
      <div className={styles.loadingRow} />
      <div className={styles.loadingRow} />
    </>
  );
}

function Empty({ message }: { message: string }) {
  return <p className={styles.empty}>{message}</p>;
}

function Unavailable() {
  return <p className={styles.empty}>Não foi possível carregar estes dados.</p>;
}
