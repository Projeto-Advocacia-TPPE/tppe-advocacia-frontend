import {
  useDeferredValue,
  useEffect,
  useState,
} from 'react';
import {
  AlertCircle,
  Archive,
  Building2,
  ChevronLeft,
  ChevronRight,
  CloudDownload,
  ExternalLink,
  Plus,
  RefreshCw,
  Scale,
  Search,
  X,
} from 'lucide-react';
import { ApiError } from '../../../services/api';
import {
  changeProcessStatus,
  ClientListItem,
  createProcess,
  DataJudSyncResult,
  getProcess,
  listClients,
  listMovements,
  listProcesses,
  Movement,
  ProcessCreate,
  ProcessDetail,
  ProcessListItem,
  ProcessStatus,
  syncProcessWithDataJud,
} from '../../../services/processes';
import styles from './Processos.module.css';

const PER_PAGE = 10;
const STATUS_OPTIONS: ProcessStatus[] = ['ATIVO', 'SUSPENSO', 'ARQUIVADO', 'ENCERRADO'];
const TRIBUNAL_SUGGESTIONS = ['tjdft', 'tjsp', 'tjrj', 'trf1', 'trf2', 'trf3', 'trf4', 'trf5', 'trf6'];

const STATUS_STYLE: Record<ProcessStatus, { bg: string; color: string }> = {
  ATIVO: { bg: '#e8f5e9', color: '#2e7d32' },
  SUSPENSO: { bg: '#fff3e0', color: '#e65100' },
  ARQUIVADO: { bg: '#f0f0f0', color: '#757575' },
  ENCERRADO: { bg: '#e8eaf6', color: '#3949ab' },
};

type Stats = {
  total: number;
  active: number;
  suspended: number;
  closed: number;
};

type Toast = {
  message: string;
  kind: 'success' | 'error';
};

function statusLabel(status: ProcessStatus): string {
  const labels: Record<ProcessStatus, string> = {
    ATIVO: 'Ativo',
    SUSPENSO: 'Suspenso',
    ARQUIVADO: 'Arquivado',
    ENCERRADO: 'Encerrado',
  };
  return labels[status];
}

function initials(name: string | null): string {
  if (!name) return '—';
  return name
    .split(' ')
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? '')
    .join('');
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function errorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) return 'Não foi possível concluir a operação.';
  const messages: Record<string, string> = {
    PROCESS_NUMBER_ALREADY_EXISTS: 'Já existe um processo com este número CNJ.',
    DATAJUD_NOT_CONFIGURED: 'A chave do DataJud ainda não está configurada neste ambiente.',
    DATAJUD_PROCESS_NOT_FOUND: 'O processo não foi encontrado no tribunal informado.',
    DATAJUD_TRIBUNAL_ALIAS_REQUIRED: 'Informe o alias do tribunal antes de sincronizar.',
    DATAJUD_UNAVAILABLE: 'O DataJud está indisponível no momento. Tente novamente.',
  };
  return (error.code && messages[error.code]) || error.message;
}

function StatusBadge({ status }: { status: ProcessStatus }) {
  const style = STATUS_STYLE[status];
  return (
    <span className={styles.statusBadge} style={{ background: style.bg, color: style.color }}>
      {statusLabel(status)}
    </span>
  );
}

function CreateProcessModal({
  clients,
  onCancel,
  onCreated,
}: {
  clients: ClientListItem[];
  onCancel: () => void;
  onCreated: (process: ProcessDetail) => void;
}) {
  const [form, setForm] = useState<ProcessCreate>({
    number: '',
    client_id: null,
    court: '',
    tribunal_alias: '',
    action_type: '',
    opposing_party: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function update<K extends keyof ProcessCreate>(key: K, value: ProcessCreate[K]) {
    setForm(current => ({ ...current, [key]: value }));
    setError('');
  }

  async function handleSave() {
    setSaving(true);
    setError('');
    try {
      const created = await createProcess({
        ...form,
        number: form.number.replace(/\D/g, ''),
        tribunal_alias: form.tribunal_alias?.trim().toLowerCase() || null,
        opposing_party: form.opposing_party?.trim() || null,
      });
      onCreated(created);
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setSaving(false);
    }
  }

  const valid = form.number.replace(/\D/g, '').length === 20
    && form.court.trim()
    && form.action_type.trim();

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modal} onClick={event => event.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>Novo Registro de Processo</h2>
            <p className={styles.modalSub}>Cadastre o processo e prepare a integração com o DataJud.</p>
          </div>
          <button className={styles.modalClose} onClick={onCancel} aria-label="Fechar">
            <X size={18} />
          </button>
        </div>

        <div className={styles.modalBody}>
          {error && <p className={styles.formError}>{error}</p>}
          <div className={styles.mField}>
            <label className={styles.mLabel}>Número do processo (CNJ)</label>
            <input
              className={styles.mInput}
              value={form.number}
              onChange={event => update('number', event.target.value)}
              placeholder="0711598-69.2022.8.07.0000"
            />
            <small className={styles.fieldHint}>Informe os 20 dígitos, com ou sem máscara.</small>
          </div>

          <div className={styles.mRow}>
            <div className={styles.mField}>
              <label className={styles.mLabel}>Cliente</label>
              <select
                className={styles.mSelect}
                value={form.client_id ?? ''}
                onChange={event => update('client_id', event.target.value ? Number(event.target.value) : null)}
              >
                <option value="">Sem cliente vinculado</option>
                {clients.map(client => <option value={client.id} key={client.id}>{client.name}</option>)}
              </select>
            </div>
            <div className={styles.mField}>
              <label className={styles.mLabel}>Tipo / área do direito</label>
              <input
                className={styles.mInput}
                value={form.action_type}
                onChange={event => update('action_type', event.target.value)}
                placeholder="Ex: Ação de cobrança"
              />
            </div>
          </div>

          <div className={styles.mRow}>
            <div className={styles.mField}>
              <label className={styles.mLabel}>Vara / tribunal</label>
              <input
                className={styles.mInput}
                value={form.court}
                onChange={event => update('court', event.target.value)}
                placeholder="Ex: TJDFT"
              />
            </div>
            <div className={styles.mField}>
              <label className={styles.mLabel}>Alias DataJud</label>
              <input
                className={styles.mInput}
                list="tribunal-aliases"
                value={form.tribunal_alias ?? ''}
                onChange={event => update('tribunal_alias', event.target.value)}
                placeholder="Ex: tjdft"
              />
              <datalist id="tribunal-aliases">
                {TRIBUNAL_SUGGESTIONS.map(alias => <option value={alias} key={alias} />)}
              </datalist>
            </div>
          </div>

          <div className={styles.mField}>
            <label className={styles.mLabel}>Parte contrária</label>
            <input
              className={styles.mInput}
              value={form.opposing_party ?? ''}
              onChange={event => update('opposing_party', event.target.value)}
              placeholder="Nome da parte contrária"
            />
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.btnCancel} onClick={onCancel}>Cancelar</button>
          <button
            className={styles.btnSave}
            onClick={() => void handleSave()}
            disabled={!valid || saving}
          >
            {saving ? 'Salvando...' : 'Adicionar Processo'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ProcessDetailsModal({
  processId,
  onCancel,
  onChanged,
}: {
  processId: number;
  onCancel: () => void;
  onChanged: (message: string) => void;
}) {
  const [process, setProcess] = useState<ProcessDetail | null>(null);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [changingStatus, setChangingStatus] = useState(false);
  const [nextStatus, setNextStatus] = useState<ProcessStatus>('ATIVO');
  const [feedback, setFeedback] = useState<{ message: string; kind: 'success' | 'error' } | null>(null);

  async function loadDetails() {
    setLoading(true);
    try {
      const [processResponse, movementsResponse] = await Promise.all([
        getProcess(processId),
        listMovements(processId),
      ]);
      setProcess(processResponse);
      setNextStatus(processResponse.status);
      setMovements(movementsResponse.data);
    } catch (requestError) {
      setFeedback({ message: errorMessage(requestError), kind: 'error' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDetails();
  }, [processId]);

  async function handleSync() {
    setSyncing(true);
    setFeedback(null);
    try {
      const result: DataJudSyncResult = await syncProcessWithDataJud(processId);
      setFeedback({
        kind: 'success',
        message: result.imported_count
          ? `${result.imported_count} movimentação(ões) importada(s) e ${result.skipped_count} ignorada(s).`
          : `Nenhuma novidade. ${result.skipped_count} movimentação(ões) já estava(m) registrada(s).`,
      });
      await loadDetails();
      onChanged('Sincronização DataJud concluída.');
    } catch (requestError) {
      setFeedback({ message: errorMessage(requestError), kind: 'error' });
    } finally {
      setSyncing(false);
    }
  }

  async function handleStatusChange() {
    if (!process || process.status === nextStatus) return;
    setChangingStatus(true);
    setFeedback(null);
    try {
      const updated = await changeProcessStatus(processId, nextStatus);
      setProcess(updated);
      setFeedback({ message: `Status alterado para ${statusLabel(nextStatus)}.`, kind: 'success' });
      const movementsResponse = await listMovements(processId);
      setMovements(movementsResponse.data);
      onChanged('Status do processo atualizado.');
    } catch (requestError) {
      setFeedback({ message: errorMessage(requestError), kind: 'error' });
    } finally {
      setChangingStatus(false);
    }
  }

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={`${styles.modal} ${styles.detailModal}`} onClick={event => event.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <p className={styles.modalEyebrow}>Ficha processual</p>
            <h2 className={styles.modalTitle}>{process?.number ?? 'Carregando processo...'}</h2>
            {process && <p className={styles.modalSub}>{process.action_type} · {process.court}</p>}
          </div>
          <button className={styles.modalClose} onClick={onCancel} aria-label="Fechar">
            <X size={18} />
          </button>
        </div>

        <div className={styles.detailBody}>
          {feedback && (
            <p className={`${styles.detailFeedback} ${feedback.kind === 'error' ? styles.feedbackError : styles.feedbackSuccess}`}>
              {feedback.message}
            </p>
          )}
          {loading && <p className={styles.detailLoading}>Carregando ficha processual...</p>}

          {!loading && process && (
            <>
              <div className={styles.detailToolbar}>
                <div className={styles.statusControl}>
                  <select value={nextStatus} onChange={event => setNextStatus(event.target.value as ProcessStatus)}>
                    {STATUS_OPTIONS.map(status => <option value={status} key={status}>{statusLabel(status)}</option>)}
                  </select>
                  <button
                    onClick={() => void handleStatusChange()}
                    disabled={changingStatus || nextStatus === process.status}
                  >
                    {changingStatus ? 'Atualizando...' : 'Alterar status'}
                  </button>
                </div>
                <button
                  className={styles.syncButton}
                  onClick={() => void handleSync()}
                  disabled={syncing || !process.tribunal_alias}
                  title={process.tribunal_alias ? 'Buscar movimentações no DataJud' : 'Cadastre um alias de tribunal para sincronizar'}
                >
                  <CloudDownload size={17} />
                  {syncing ? 'Sincronizando...' : 'Sincronizar DataJud'}
                </button>
              </div>

              <div className={styles.detailGrid}>
                <Detail label="Cliente" value={process.client_name ?? 'Sem cliente vinculado'} />
                <Detail label="Parte contrária" value={process.opposing_party ?? 'Não informada'} />
                <Detail label="Tribunal" value={process.court} />
                <Detail label="Alias DataJud" value={process.tribunal_alias ?? 'Não configurado'} />
                <Detail label="Status" value={statusLabel(process.status)} />
                <Detail label="Cadastrado em" value={formatDate(process.created_at)} />
              </div>

              <section className={styles.timelineSection}>
                <div className={styles.timelineHeader}>
                  <div>
                    <p className={styles.modalEyebrow}>Histórico</p>
                    <h3>Movimentações processuais</h3>
                  </div>
                  <span>{movements.length} registro(s)</span>
                </div>
                <div className={styles.timeline}>
                  {movements.length === 0 && (
                    <p className={styles.timelineEmpty}>Nenhuma movimentação registrada ainda.</p>
                  )}
                  {movements.map(movement => (
                    <article className={styles.movement} key={movement.id}>
                      <span className={styles.timelineDot} />
                      <div className={styles.movementContent}>
                        <div className={styles.movementTop}>
                          <strong>{movement.title}</strong>
                          <span className={movement.external_id ? styles.externalSource : styles.manualSource}>
                            {movement.external_id ? <><ExternalLink size={12} /> DataJud</> : movement.source === 'SYSTEM' ? 'Sistema' : 'Manual'}
                          </span>
                        </div>
                        {movement.description && <p>{movement.description}</p>}
                        <time>{formatDate(movement.occurred_at)}</time>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.detailItem}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default function Processos() {
  const [processes, setProcesses] = useState<ProcessListItem[]>([]);
  const [clients, setClients] = useState<ClientListItem[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, suspended: 0, closed: 0 });
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const [status, setStatus] = useState<ProcessStatus | ''>('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  function showToast(message: string, kind: Toast['kind'] = 'success') {
    setToast({ message, kind });
    window.setTimeout(() => setToast(null), 4500);
  }

  async function loadProcesses(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const response = await listProcesses({
        page,
        limit: PER_PAGE,
        search: deferredSearch.trim(),
        status,
      });
      setProcesses(response.data);
      setTotal(response.meta.total);
      setPages(response.meta.pages);
    } catch (requestError) {
      showToast(errorMessage(requestError), 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function loadStats() {
    try {
      const [all, active, suspended, archived, ended] = await Promise.all([
        listProcesses({ limit: 1 }),
        listProcesses({ limit: 1, status: 'ATIVO' }),
        listProcesses({ limit: 1, status: 'SUSPENSO' }),
        listProcesses({ limit: 1, status: 'ARQUIVADO' }),
        listProcesses({ limit: 1, status: 'ENCERRADO' }),
      ]);
      setStats({
        total: all.meta.total,
        active: active.meta.total,
        suspended: suspended.meta.total,
        closed: archived.meta.total + ended.meta.total,
      });
    } catch {
      // A lista principal continua útil mesmo se um indicador falhar.
    }
  }

  async function loadClients() {
    try {
      const response = await listClients();
      setClients(response.data);
    } catch {
      setClients([]);
    }
  }

  useEffect(() => {
    void loadProcesses();
  }, [page, deferredSearch, status]);

  useEffect(() => {
    void Promise.all([loadStats(), loadClients()]);
  }, []);

  async function refreshAll(message?: string) {
    await Promise.all([loadProcesses(true), loadStats()]);
    if (message) showToast(message);
  }

  return (
    <div className={styles.page}>
      {toast && (
        <div className={`${styles.toast} ${toast.kind === 'error' ? styles.toastDel : styles.toastAdd}`}>
          {toast.message}
        </div>
      )}

      <div className={styles.pageHeader}>
        <div>
          <p className={styles.pageEyebrow}>Processos e integração jurídica</p>
          <h1 className={styles.pageTitle}>Core Jurídico</h1>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.btnRefresh} onClick={() => void refreshAll()} disabled={refreshing}>
            <RefreshCw size={16} className={refreshing ? styles.spinning : ''} />
            Atualizar
          </button>
          <button className={styles.btnPrimary} onClick={() => setCreateOpen(true)}>
            <Plus size={16} /> Novo Processo
          </button>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <StatCard icon={<Building2 size={20} color="#3949ab" />} iconBg="#e8eaf6" label="Total de processos" value={stats.total} sub="Cadastrados no sistema" />
        <StatCard icon={<Scale size={20} color="#2e7d32" />} iconBg="#e8f5e9" label="Ativos" value={stats.active} sub="Processos em andamento" />
        <StatCard icon={<AlertCircle size={20} color="#e65100" />} iconBg="#fff3e0" label="Suspensos" value={stats.suspended} sub="Aguardando andamento" />
        <StatCard icon={<Archive size={20} color="#757575" />} iconBg="#f5f5f5" label="Encerrados" value={stats.closed} sub="Arquivados ou encerrados" />
      </div>

      <div className={styles.tableCard}>
        <div className={styles.filterBar}>
          <p className={styles.filterLabel}>Buscar processo</p>
          <div className={styles.filterRow}>
            <div className={styles.searchBox}>
              <Search size={15} className={styles.searchIcon} />
              <input
                className={styles.searchInput}
                placeholder="Número CNJ ou tipo de ação"
                value={search}
                onChange={event => { setSearch(event.target.value); setPage(1); }}
              />
            </div>
            <select
              className={styles.filterSelect}
              value={status}
              onChange={event => { setStatus(event.target.value as ProcessStatus | ''); setPage(1); }}
            >
              <option value="">Todos os status</option>
              {STATUS_OPTIONS.map(option => <option value={option} key={option}>{statusLabel(option)}</option>)}
            </select>
          </div>
        </div>

        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nº CNJ</th>
                <th>Tipo de ação</th>
                <th>Cliente</th>
                <th>Tribunal</th>
                <th>DataJud</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={7} className={styles.empty}>Carregando processos...</td></tr>
              )}
              {!loading && processes.map(process => (
                <tr key={process.id}>
                  <td className={styles.cnj}>{process.number}</td>
                  <td>{process.action_type}</td>
                  <td>
                    <div className={styles.clienteCell}>
                      <span className={styles.avatar}>{initials(process.client_name)}</span>
                      <span>{process.client_name ?? 'Sem cliente'}</span>
                    </div>
                  </td>
                  <td>{process.court}</td>
                  <td>
                    <span className={process.tribunal_alias ? styles.datajudReady : styles.datajudMissing}>
                      {process.tribunal_alias ?? 'Não configurado'}
                    </span>
                  </td>
                  <td><StatusBadge status={process.status} /></td>
                  <td>
                    <button className={styles.btnAbrirFicha} onClick={() => setSelectedId(process.id)}>
                      Abrir Ficha
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && processes.length === 0 && (
                <tr><td colSpan={7} className={styles.empty}>Nenhum processo encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className={styles.tableFooter}>
          <span className={styles.pageInfo}>
            Mostrando <strong>{processes.length}</strong> de <strong>{total}</strong> processo(s)
          </span>
          <div className={styles.pagination}>
            <button className={styles.pageArrow} onClick={() => setPage(current => Math.max(1, current - 1))} disabled={page === 1}>
              <ChevronLeft size={15} />
            </button>
            <span className={styles.currentPage}>Página {page} de {pages}</span>
            <button className={styles.pageArrow} onClick={() => setPage(current => Math.min(pages, current + 1))} disabled={page === pages}>
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {createOpen && (
        <CreateProcessModal
          clients={clients}
          onCancel={() => setCreateOpen(false)}
          onCreated={process => {
            setCreateOpen(false);
            setSelectedId(process.id);
            void refreshAll(`Processo ${process.number} cadastrado com sucesso.`);
          }}
        />
      )}

      {selectedId && (
        <ProcessDetailsModal
          processId={selectedId}
          onCancel={() => setSelectedId(null)}
          onChanged={message => void refreshAll(message)}
        />
      )}
    </div>
  );
}

function StatCard({
  icon,
  iconBg,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: number;
  sub: string;
}) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statTop}>
        <span className={styles.statIcon} style={{ background: iconBg }}>{icon}</span>
      </div>
      <p className={styles.statLabel}>{label}</p>
      <p className={styles.statValue}>{String(value).padStart(2, '0')}</p>
      <p className={styles.statSub}>{sub}</p>
    </div>
  );
}
