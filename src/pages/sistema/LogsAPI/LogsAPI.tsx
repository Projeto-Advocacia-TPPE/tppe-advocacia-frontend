import { useState, useEffect } from 'react';
import {
  ChevronLeft, ChevronRight, RefreshCw,
  CheckCircle2, XCircle, Zap, Activity,
} from 'lucide-react';
import {
  listExternalApiLogs,
  type ExternalApiLog,
  type ExternalApiLogStatus,
} from '../../../services/notifications';
import { syncActiveProcesses, type BulkSyncResult } from '../../../services/processes';
import styles from './LogsAPI.module.css';

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(value));
}

export default function LogsAPI() {
  const [logs, setLogs]               = useState<ExternalApiLog[]>([]);
  const [statusFilter, setStatusFilter] = useState<ExternalApiLogStatus | ''>('');
  const [page, setPage]               = useState(1);
  const [pages, setPages]             = useState(1);
  const [total, setTotal]             = useState(0);
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const [syncing, setSyncing]         = useState(false);
  const [syncResult, setSyncResult]   = useState<BulkSyncResult | null>(null);
  const [feedback, setFeedback]       = useState<{ message: string; kind: 'success' | 'error' } | null>(null);

  async function loadLogs(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const response = await listExternalApiLogs({
        status: statusFilter || undefined,
        page,
        limit: 15,
      });
      setLogs(response.data);
      setTotal(response.meta.total);
      setPages(response.meta.pages);
    } catch {
      showFeedback('Não foi possível carregar os logs.', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void loadLogs();
  }, [page, statusFilter]);

  function showFeedback(message: string, kind: 'success' | 'error' = 'success') {
    setFeedback({ message, kind });
    window.setTimeout(() => setFeedback(null), 5000);
  }

  async function handleBulkSync() {
    setSyncing(true);
    setSyncResult(null);
    try {
      const result = await syncActiveProcesses();
      setSyncResult(result);
      const kind = result.failure_count > 0 ? 'error' : 'success';
      showFeedback(
        `Sincronização concluída: ${result.success_count} sucesso(s), ${result.failure_count} falha(s), ${result.imported_count} movimentações importadas.`,
        kind,
      );
      void loadLogs(true);
    } catch {
      showFeedback('Falha ao sincronizar processos com o DataJud.', 'error');
    } finally {
      setSyncing(false);
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
          <p className={styles.eyebrow}>Integrações externas</p>
          <h1>Logs de API</h1>
          <p className={styles.subtitle}>Monitore chamadas ao DataJud e identifique falhas de integração.</p>
        </div>
        <div className={styles.headerActions}>
          <button
            className={styles.syncAllButton}
            onClick={() => void handleBulkSync()}
            disabled={syncing}
            title="Sincronizar todos os processos ativos com o DataJud"
          >
            <Zap size={16} />
            {syncing ? 'Sincronizando...' : 'Sync. todos os processos'}
          </button>
          <button
            className={styles.refreshButton}
            onClick={() => void loadLogs(true)}
            disabled={refreshing}
          >
            <RefreshCw size={17} className={refreshing ? styles.spinning : ''} />
            Atualizar
          </button>
        </div>
      </header>

      {syncResult && (
        <div className={styles.syncResultCard}>
          <Activity size={16} className={styles.syncIcon} />
          <span><strong>Último sync em lote:</strong></span>
          <span>{syncResult.total_active_processes} processos ativos</span>
          <span className={styles.syncSuccess}>{syncResult.success_count} sucesso(s)</span>
          {syncResult.failure_count > 0 && (
            <span className={styles.syncFailure}>{syncResult.failure_count} falha(s)</span>
          )}
          <span>{syncResult.imported_count} movimentações importadas</span>
          <span>{syncResult.skipped_count} ignoradas (já existiam)</span>
        </div>
      )}

      <section className={styles.panel}>
        <div className={styles.filters}>
          <select
            value={statusFilter}
            onChange={e => {
              setStatusFilter(e.target.value as ExternalApiLogStatus | '');
              setPage(1);
            }}
          >
            <option value="">Todos os status</option>
            <option value="SUCCESS">Sucesso</option>
            <option value="FAILURE">Falha</option>
          </select>
        </div>

        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Status</th>
                <th>Provedor</th>
                <th>Operação</th>
                <th>Processo</th>
                <th>HTTP</th>
                <th>Erro</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={7} className={styles.empty}>Carregando logs...</td>
                </tr>
              )}
              {!loading && logs.map(log => (
                <tr key={log.id} className={log.status === 'FAILURE' ? styles.rowFailure : ''}>
                  <td>
                    {log.status === 'SUCCESS' ? (
                      <span className={styles.badgeSuccess}>
                        <CheckCircle2 size={13} /> Sucesso
                      </span>
                    ) : (
                      <span className={styles.badgeFailure}>
                        <XCircle size={13} /> Falha
                      </span>
                    )}
                  </td>
                  <td><span className={styles.provider}>{log.provider}</span></td>
                  <td className={styles.operation}>{log.operation}</td>
                  <td>
                    {log.process_id
                      ? <span className={styles.processId}>#{log.process_id}</span>
                      : <span className={styles.dash}>—</span>}
                  </td>
                  <td>
                    {log.http_status ? (
                      <span className={log.http_status >= 400 ? styles.httpError : styles.httpOk}>
                        {log.http_status}
                      </span>
                    ) : <span className={styles.dash}>—</span>}
                  </td>
                  <td>
                    {log.error_code ? (
                      <div>
                        <div className={styles.errorCode}>{log.error_code}</div>
                        {log.error_message && (
                          <div className={styles.errorMsg}>{log.error_message}</div>
                        )}
                      </div>
                    ) : <span className={styles.dash}>—</span>}
                  </td>
                  <td className={styles.dateCell}>{formatDate(log.created_at)}</td>
                </tr>
              ))}
              {!loading && logs.length === 0 && (
                <tr>
                  <td colSpan={7} className={styles.empty}>Nenhum log encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <footer className={styles.footer}>
          <span>
            Mostrando <strong>{logs.length}</strong> de <strong>{total}</strong> log(s)
          </span>
          <div className={styles.pagination}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft size={16} />
            </button>
            <span>Página {page} de {pages}</span>
            <button
              onClick={() => setPage(p => Math.min(pages, p + 1))}
              disabled={page === pages}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}
