import { useState } from 'react';
import {
  LayoutDashboard, CalendarDays,
  AlertTriangle, FileText, CheckSquare, UserPlus, Clock,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import { mockNotificacoes } from './mockData';
import type { FiltroNotificacao, TipoNotificacao } from './types';
import styles from './Notificacoes.module.css';

// ── Toggle switch ──────────────────────────────────────────
function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      className={`${styles.toggle} ${value ? styles.toggleOn : ''}`}
      onClick={() => onChange(!value)}
      aria-pressed={value}
    >
      <span className={styles.toggleThumb} />
    </button>
  );
}

// ── Ícone por tipo ─────────────────────────────────────────
function TipoIcon({ tipo }: { tipo: TipoNotificacao }) {
  const map: Record<TipoNotificacao, { icon: React.ReactNode; color: string }> = {
    prazo:        { icon: <AlertTriangle size={18} />, color: '#ef5350' },
    movimentacao: { icon: <FileText      size={18} />, color: '#5c6bc0' },
    sistema:      { icon: <CheckSquare  size={18} />, color: '#43a047' },
    lead:         { icon: <UserPlus     size={18} />, color: '#fb8c00' },
  };
  const { icon, color } = map[tipo];
  return (
    <span className={styles.tipoIcon} style={{ background: `${color}18`, color }}>
      {icon}
    </span>
  );
}

// ── Filtro por tipo ────────────────────────────────────────
const FILTROS: FiltroNotificacao[] = ['Todas', 'Não lidas', 'Prazos', 'Movimentações', 'Sistema'];

function matchFiltro(tipo: TipoNotificacao, lida: boolean, filtro: FiltroNotificacao) {
  if (filtro === 'Todas')         return true;
  if (filtro === 'Não lidas')     return !lida;
  if (filtro === 'Prazos')        return tipo === 'prazo';
  if (filtro === 'Movimentações') return tipo === 'movimentacao';
  if (filtro === 'Sistema')       return tipo === 'sistema';
  return true;
}

const PER_PAGE = 5;

// ── Main ───────────────────────────────────────────────────
export default function Notificacoes() {
  // Canais
  const [painelOn, setPainelOn] = useState(true);
  const [emailOn,  setEmailOn]  = useState(true);

  // Tipos de evento
  const [movOn,   setMovOn]   = useState(true);
  const [prazoOn, setPrazoOn] = useState(true);
  const [leadOn,  setLeadOn]  = useState(true);
  const [apiOn,   setApiOn]   = useState(false);

  // Central de alertas
  const [filtro, setFiltro] = useState<FiltroNotificacao>('Todas');
  const [page,   setPage]   = useState(1);

  const filtered = mockNotificacoes.filter(n => matchFiltro(n.tipo, n.lida, filtro));
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const visible = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const changeFiltro = (f: FiltroNotificacao) => { setFiltro(f); setPage(1); };

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>Central de Notificações</h1>

      {/* ── Configurações ── */}
      <div className={styles.configRow}>

        {/* Canais de Entrega */}
        <div className={styles.configCard}>
          <div className={styles.configCardHeader}>
            <span className={styles.configIcon}><LayoutDashboard size={18} /></span>
            <span className={styles.configTitle}>Canais de Entrega</span>
          </div>
          <div className={styles.configItem}>
            <span>Painel (in-app)</span>
            <Toggle value={painelOn} onChange={setPainelOn} />
          </div>
          <div className={styles.configItem}>
            <span>E-mail</span>
            <Toggle value={emailOn} onChange={setEmailOn} />
          </div>
        </div>

        {/* Tipos de Evento */}
        <div className={styles.configCard}>
          <div className={styles.configCardHeader}>
            <span className={styles.configIcon}><CalendarDays size={18} /></span>
            <span className={styles.configTitle}>Tipos de Evento</span>
          </div>
          <div className={styles.configItem}>
            <span>Nova movimentação processual</span>
            <Toggle value={movOn} onChange={setMovOn} />
          </div>
          <div className={styles.configItem}>
            <span>Prazo próximo ao vencimento</span>
            <Toggle value={prazoOn} onChange={setPrazoOn} />
          </div>
          <div className={styles.configItem}>
            <span>Novo lead recebido</span>
            <Toggle value={leadOn} onChange={setLeadOn} />
          </div>
          <div className={styles.configItem}>
            <span>Falha na integração com API</span>
            <Toggle value={apiOn} onChange={setApiOn} />
          </div>
        </div>

      </div>

      {/* ── Central de Alertas ── */}
      <div className={styles.alertCard}>
        <div className={styles.alertHeader}>
          <h2 className={styles.alertTitle}>Central de Alertas</h2>
          <div className={styles.filtros}>
            {FILTROS.map(f => (
              <button
                key={f}
                className={`${styles.filtroBtn} ${filtro === f ? styles.filtroBtnActive : ''}`}
                onClick={() => changeFiltro(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th />
              <th>EVENTO</th>
              <th>PROCESSO</th>
              <th>DATA E HORA</th>
            </tr>
          </thead>
          <tbody>
            {visible.map(n => (
              <tr key={n.id} className={!n.lida ? styles.rowUnread : ''}>
                <td><TipoIcon tipo={n.tipo} /></td>
                <td>
                  <div className={styles.eventoTitle}>{n.evento}</div>
                  <div className={styles.eventoDesc}>{n.descricao}</div>
                </td>
                <td>
                  {n.processo.includes('-') && !n.processo.includes('/') ? (
                    <span className={styles.processoBadge}>{n.processo}</span>
                  ) : (
                    <span className={styles.processoText}>{n.processo}</span>
                  )}
                </td>
                <td>
                  <div className={styles.dataHora}>
                    <Clock size={13} className={styles.clockIcon} />
                    {n.dataHora}
                  </div>
                </td>
              </tr>
            ))}

            {visible.length === 0 && (
              <tr>
                <td colSpan={4} className={styles.empty}>Nenhuma notificação encontrada.</td>
              </tr>
            )}
          </tbody>
        </table>

        <div className={styles.tableFooter}>
          <span className={styles.exibindo}>
            Exibindo <strong>{Math.min((page - 1) * PER_PAGE + 1, filtered.length)}–{Math.min(page * PER_PAGE, filtered.length)}</strong> de <strong>{filtered.length}</strong> notificações
          </span>
          <div className={styles.pagination}>
            <button className={styles.pageArrow} onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
              <ChevronLeft size={15} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                className={`${styles.pageNum} ${page === p ? styles.pageActive : ''}`}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            ))}
            <button className={styles.pageArrow} onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
