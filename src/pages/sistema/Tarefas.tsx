import { DragEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  CircleDashed,
  Clock3,
  GripVertical,
  Link2,
  LockKeyhole,
  Pencil,
  Plus,
  RefreshCw,
  UserRound,
} from 'lucide-react';
import Modal from '../../components/sistema/Modal/Modal';
import { ApiError } from '../../services/api';
import { ClientListItem, listClients } from '../../services/clients';
import { UserOption, listActiveUsers } from '../../services/leads';
import { ProcessListItem, listProcesses } from '../../services/processes';
import {
  Task,
  TaskKanban,
  TaskPriority,
  TaskStatus,
  TaskWrite,
  createTask,
  getTaskKanban,
  moveTask,
  updateTask,
} from '../../services/tasks';
import styles from './Tarefas.module.css';

const STATUS_ORDER: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'BLOCKED', 'DONE'];

const STATUS_CONFIG: Record<TaskStatus, {
  label: string;
  icon: React.ReactNode;
  tone: 'gray' | 'blue' | 'amber' | 'green';
}> = {
  TODO: { label: 'A fazer', icon: <CircleDashed size={17} />, tone: 'gray' },
  IN_PROGRESS: { label: 'Em andamento', icon: <Clock3 size={17} />, tone: 'blue' },
  BLOCKED: { label: 'Bloqueadas', icon: <LockKeyhole size={17} />, tone: 'amber' },
  DONE: { label: 'Concluídas', icon: <CheckCircle2 size={17} />, tone: 'green' },
};

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  LOW: 'Baixa',
  MEDIUM: 'Média',
  HIGH: 'Alta',
};

type TaskForm = {
  title: string;
  description: string;
  dueDate: string;
  priority: TaskPriority;
  assignedTo: number | '';
  clientId: number | '';
  processId: number | '';
};

const EMPTY_FORM: TaskForm = {
  title: '',
  description: '',
  dueDate: '',
  priority: 'MEDIUM',
  assignedTo: '',
  clientId: '',
  processId: '',
};

function emptyKanban(): TaskKanban {
  return {
    TODO: { items: [], total: 0, has_more: false },
    IN_PROGRESS: { items: [], total: 0, has_more: false },
    BLOCKED: { items: [], total: 0, has_more: false },
    DONE: { items: [], total: 0, has_more: false },
  };
}

function formatDueDate(value: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

function dueState(value: string | null): 'late' | 'today' | 'soon' | 'normal' {
  if (!value) return 'normal';
  const due = new Date(value);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  const difference = Math.round((dueDay.getTime() - today.getTime()) / 86_400_000);
  if (difference < 0) return 'late';
  if (difference === 0) return 'today';
  if (difference <= 3) return 'soon';
  return 'normal';
}

function dueLabel(value: string | null): string {
  if (!value) return 'Sem vencimento';
  const state = dueState(value);
  if (state === 'late') return `Atrasada · ${formatDueDate(value)}`;
  if (state === 'today') return 'Vence hoje';
  return formatDueDate(value);
}

function toDateTimeLocal(value: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  return 'Não foi possível concluir a operação.';
}

export default function Tarefas() {
  const [kanban, setKanban] = useState<TaskKanban>(emptyKanban);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [movingId, setMovingId] = useState<number | null>(null);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [dropTarget, setDropTarget] = useState<TaskStatus | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [form, setForm] = useState<TaskForm>(EMPTY_FORM);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [clients, setClients] = useState<ClientListItem[]>([]);
  const [processes, setProcesses] = useState<ProcessListItem[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [feedback, setFeedback] = useState<{ message: string; kind: 'success' | 'error' } | null>(null);

  const metrics = useMemo(() => ({
    total: STATUS_ORDER.reduce((sum, status) => sum + kanban[status].total, 0),
    open: kanban.TODO.total + kanban.IN_PROGRESS.total + kanban.BLOCKED.total,
    urgent: STATUS_ORDER.flatMap(status => kanban[status].items).filter(task => task.priority === 'HIGH' && task.status !== 'DONE').length,
    dueSoon: STATUS_ORDER.flatMap(status => kanban[status].items).filter(task => ['late', 'today', 'soon'].includes(dueState(task.due_date)) && task.status !== 'DONE').length,
  }), [kanban]);

  async function loadKanban(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      setKanban(await getTaskKanban());
    } catch (error) {
      showFeedback(errorMessage(error), 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void loadKanban();
    void Promise.all([
      listClients({ limit: 100 }).then(response => setClients(response.data)),
      listProcesses({ limit: 100 }).then(response => setProcesses(response.data)),
      listActiveUsers().then(response => setUsers(response.data)).catch(() => setUsers([])),
    ]).catch(error => showFeedback(errorMessage(error), 'error'));
  }, []);

  function showFeedback(message: string, kind: 'success' | 'error' = 'success') {
    setFeedback({ message, kind });
    window.setTimeout(() => setFeedback(null), 4000);
  }

  async function handleMove(task: Task, status: TaskStatus, order: number) {
    if (movingId !== null || (task.status === status && task.order === order)) return;
    setMovingId(task.id);
    try {
      await moveTask(task.id, status, order);
      await loadKanban(true);
      showFeedback(`"${task.title}" movida para ${STATUS_CONFIG[status].label.toLowerCase()}.`);
    } catch (error) {
      showFeedback(errorMessage(error), 'error');
    } finally {
      setMovingId(null);
      setDraggingId(null);
      setDropTarget(null);
    }
  }

  function adjacentStatus(status: TaskStatus, direction: -1 | 1): TaskStatus | null {
    const index = STATUS_ORDER.indexOf(status) + direction;
    return STATUS_ORDER[index] ?? null;
  }

  function handleDragStart(event: DragEvent<HTMLElement>, task: Task) {
    setDraggingId(task.id);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', String(task.id));
  }

  function handleDrop(event: DragEvent<HTMLElement>, status: TaskStatus) {
    event.preventDefault();
    const taskId = Number(event.dataTransfer.getData('text/plain'));
    const task = STATUS_ORDER.flatMap(item => kanban[item].items).find(item => item.id === taskId);
    if (task) void handleMove(task, status, kanban[status].items.length);
  }

  function updateForm<K extends keyof TaskForm>(field: K, value: TaskForm[K]) {
    setForm(current => ({ ...current, [field]: value }));
  }

  function openCreate() {
    setEditingTask(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setShowCreate(true);
  }

  function openEdit(task: Task) {
    setShowCreate(false);
    setEditingTask(task);
    setForm({
      title: task.title,
      description: task.description ?? '',
      dueDate: toDateTimeLocal(task.due_date),
      priority: task.priority,
      assignedTo: task.assigned_to ?? '',
      clientId: task.client_id ?? '',
      processId: task.process_id ?? '',
    });
    setFormError('');
  }

  function closeForm() {
    setShowCreate(false);
    setEditingTask(null);
    setFormError('');
  }

  async function handleSaveTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError('');
    const payload: TaskWrite = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      due_date: form.dueDate ? new Date(form.dueDate).toISOString() : null,
      priority: form.priority,
      assigned_to: form.assignedTo || null,
      client_id: form.clientId || null,
      process_id: form.processId || null,
    };

    setFormSubmitting(true);
    try {
      const saved = editingTask
        ? await updateTask(editingTask.id, payload)
        : await createTask(payload);
      closeForm();
      await loadKanban(true);
      showFeedback(editingTask ? `"${saved.title}" atualizada com sucesso.` : `"${saved.title}" criada em A fazer.`);
    } catch (error) {
      setFormError(errorMessage(error));
    } finally {
      setFormSubmitting(false);
    }
  }

  return (
    <div className={styles.page}>
      {feedback && (
        <div className={`${styles.toast} ${feedback.kind === 'error' ? styles.toastError : styles.toastSuccess}`}>
          {feedback.message}
        </div>
      )}

      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Organização operacional</p>
          <h1>Tarefas</h1>
          <p className={styles.subtitle}>Acompanhe o trabalho do escritório por etapa.</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.refreshButton} onClick={() => void loadKanban(true)} disabled={refreshing}>
            <RefreshCw size={17} className={refreshing ? styles.spinning : ''} />
            Atualizar
          </button>
          <button className={styles.primaryButton} onClick={openCreate}>
            <Plus size={17} />
            Nova tarefa
          </button>
        </div>
      </header>

      <section className={styles.metrics}>
        <Metric icon={<CircleDashed size={20} />} label="Tarefas cadastradas" value={metrics.total} tone="navy" />
        <Metric icon={<Clock3 size={20} />} label="Em aberto" value={metrics.open} tone="blue" />
        <Metric icon={<AlertCircle size={20} />} label="Prioridade alta" value={metrics.urgent} tone="crimson" />
        <Metric icon={<CalendarClock size={20} />} label="Vencendo ou atrasadas" value={metrics.dueSoon} tone="amber" />
      </section>

      <section className={styles.board} aria-label="Quadro de tarefas">
        {STATUS_ORDER.map(status => {
          const config = STATUS_CONFIG[status];
          const column = kanban[status];
          return (
            <section
              className={`${styles.column} ${dropTarget === status ? styles.dropActive : ''}`}
              key={status}
              onDragOver={event => { event.preventDefault(); setDropTarget(status); }}
              onDragLeave={event => {
                if (!event.currentTarget.contains(event.relatedTarget as Node)) setDropTarget(null);
              }}
              onDrop={event => handleDrop(event, status)}
            >
              <header className={styles.columnHeader}>
                <div className={`${styles.columnTitle} ${styles[config.tone]}`}>
                  {config.icon}
                  <h2>{config.label}</h2>
                </div>
                <span>{column.total}</span>
              </header>

              <div className={styles.taskList}>
                {loading && <ColumnLoading />}
                {!loading && column.items.map(task => (
                  <article
                    className={`${styles.taskCard} ${draggingId === task.id ? styles.dragging : ''}`}
                    key={task.id}
                    draggable={movingId === null}
                    onDragStart={event => handleDragStart(event, task)}
                    onDragEnd={() => { setDraggingId(null); setDropTarget(null); }}
                  >
                    <div className={styles.taskTopline}>
                      <span className={`${styles.priority} ${styles[`priority${task.priority}`]}`}>
                        {PRIORITY_LABELS[task.priority]}
                      </span>
                      <div className={styles.cardTools}>
                        <button
                          onClick={() => openEdit(task)}
                          onMouseDown={event => event.stopPropagation()}
                          title="Editar tarefa"
                          aria-label="Editar tarefa"
                        >
                          <Pencil size={14} />
                        </button>
                        <GripVertical size={16} className={styles.grip} aria-hidden="true" />
                      </div>
                    </div>
                    <h3>{task.title}</h3>
                    {task.description && <p className={styles.description}>{task.description}</p>}

                    <div className={styles.taskMeta}>
                      <span className={`${styles.dueDate} ${styles[dueState(task.due_date)]}`}>
                        <CalendarClock size={14} />
                        {dueLabel(task.due_date)}
                      </span>
                      <span>
                        <UserRound size={14} />
                        {task.assigned_to_name ?? 'Sem responsável'}
                      </span>
                      {(task.client_id || task.process_id) && (
                        <span>
                          <Link2 size={14} />
                          {task.process_id ? 'Processo vinculado' : 'Cliente vinculado'}
                        </span>
                      )}
                    </div>

                    <footer className={styles.taskActions}>
                      <button
                        aria-label="Mover para etapa anterior"
                        title="Mover para etapa anterior"
                        disabled={!adjacentStatus(task.status, -1) || movingId !== null}
                        onClick={() => {
                          const target = adjacentStatus(task.status, -1);
                          if (target) void handleMove(task, target, kanban[target].items.length);
                        }}
                      >
                        <ArrowLeft size={15} />
                      </button>
                      <span>{task.created_by_name}</span>
                      <button
                        aria-label="Mover para próxima etapa"
                        title="Mover para próxima etapa"
                        disabled={!adjacentStatus(task.status, 1) || movingId !== null}
                        onClick={() => {
                          const target = adjacentStatus(task.status, 1);
                          if (target) void handleMove(task, target, kanban[target].items.length);
                        }}
                      >
                        <ArrowRight size={15} />
                      </button>
                    </footer>
                  </article>
                ))}
                {!loading && column.items.length === 0 && (
                  <div className={styles.emptyColumn}>
                    <span className={`${styles.emptyIcon} ${styles[config.tone]}`}>{config.icon}</span>
                    <p>Nenhuma tarefa nesta etapa.</p>
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </section>

      {(showCreate || editingTask) && (
        <Modal title={editingTask ? 'Editar tarefa' : 'Criar tarefa'} onClose={closeForm} width={660}>
          <form className={styles.taskForm} onSubmit={handleSaveTask}>
            <div className={styles.formGrid}>
              <label className={styles.fullField}>
                <span>Título *</span>
                <input required maxLength={150} value={form.title} onChange={event => updateForm('title', event.target.value)} />
              </label>
              <label className={styles.fullField}>
                <span>Descrição</span>
                <textarea rows={4} maxLength={5000} value={form.description} onChange={event => updateForm('description', event.target.value)} />
              </label>
              <label>
                <span>Prioridade</span>
                <select value={form.priority} onChange={event => updateForm('priority', event.target.value as TaskPriority)}>
                  <option value="LOW">Baixa</option>
                  <option value="MEDIUM">Média</option>
                  <option value="HIGH">Alta</option>
                </select>
              </label>
              <label>
                <span>Vencimento</span>
                <input type="datetime-local" value={form.dueDate} onChange={event => updateForm('dueDate', event.target.value)} />
              </label>
              <label>
                <span>Responsável</span>
                <select value={form.assignedTo} onChange={event => updateForm('assignedTo', event.target.value ? Number(event.target.value) : '')}>
                  <option value="">Sem responsável</option>
                  {users.map(user => <option value={user.id} key={user.id}>{user.name}</option>)}
                </select>
                {users.length === 0 && <small>Responsáveis disponíveis apenas para administradores.</small>}
              </label>
              <label>
                <span>Cliente vinculado</span>
                <select value={form.clientId} onChange={event => updateForm('clientId', event.target.value ? Number(event.target.value) : '')}>
                  <option value="">Nenhum cliente</option>
                  {clients.map(client => <option value={client.id} key={client.id}>{client.name}</option>)}
                </select>
              </label>
              <label className={styles.fullField}>
                <span>Processo vinculado</span>
                <select value={form.processId} onChange={event => updateForm('processId', event.target.value ? Number(event.target.value) : '')}>
                  <option value="">Nenhum processo</option>
                  {processes.map(process => (
                    <option value={process.id} key={process.id}>{process.number} · {process.action_type}</option>
                  ))}
                </select>
              </label>
            </div>

            {formError && <p className={styles.formError}>{formError}</p>}

            <div className={styles.formActions}>
              <button type="button" className={styles.cancelButton} onClick={closeForm}>Cancelar</button>
              <button type="submit" className={styles.submitButton} disabled={formSubmitting}>
                {formSubmitting ? 'Salvando...' : editingTask ? 'Salvar alterações' : 'Criar tarefa'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function Metric({ icon, label, value, tone }: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: 'navy' | 'blue' | 'crimson' | 'amber';
}) {
  return (
    <div className={styles.metric}>
      <span className={`${styles.metricIcon} ${styles[tone]}`}>{icon}</span>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function ColumnLoading() {
  return (
    <>
      <div className={styles.loadingCard} />
      <div className={styles.loadingCard} />
    </>
  );
}
