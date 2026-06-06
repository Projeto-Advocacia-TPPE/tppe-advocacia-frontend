import { useState, useMemo } from 'react';
import { Plus, Search, X, Trash2, Pencil, ChevronLeft, ChevronRight } from 'lucide-react';
import { Building2, Scale, AlertCircle, Archive } from 'lucide-react';
import { mockProcessos, TIPOS_ACAO, ADVOGADOS } from './mockData';
import type { Processo, StatusProcesso } from './types';
import styles from './Processos.module.css';

// ── helpers ──────────────────────────────────────────────
const STATUS_STYLE: Record<StatusProcesso, { bg: string; color: string }> = {
  'ATIVO':         { bg: '#e8f5e9', color: '#2e7d32' },
  'PRAZO CRÍTICO': { bg: '#fdecea', color: '#c62828' },
  'SUSPENSO':      { bg: '#fff3e0', color: '#e65100' },
  'ARQUIVADO':     { bg: '#f0f0f0', color: '#757575' },
  'ENCERRADO':     { bg: '#e8eaf6', color: '#3949ab' },
};

const PER_PAGE = 5;

function Avatar({ iniciais }: { iniciais: string }) {
  return <span className={styles.avatar}>{iniciais}</span>;
}

function StatusBadge({ status }: { status: StatusProcesso }) {
  const s = STATUS_STYLE[status];
  return (
    <span className={styles.statusBadge} style={{ background: s.bg, color: s.color }}>
      {status}
    </span>
  );
}

// ── Modal Novo / Editar ───────────────────────────────────
interface ProcessoFormProps {
  titulo: string;
  initial?: Partial<Processo>;
  onCancel: () => void;
  onSave: (data: Omit<Processo, 'id'>) => void;
  onDelete?: () => void;
}

function ProcessoModal({ titulo, initial = {}, onCancel, onSave, onDelete }: ProcessoFormProps) {
  const [cnj,      setCnj]      = useState(initial.cnj      ?? '');
  const [cliente,  setCliente]  = useState(initial.cliente  ?? '');
  const [tipo,     setTipo]     = useState(initial.tipoAcao ?? 'Direito Civil');
  const [vara,     setVara]     = useState(initial.varaComarca ?? '');
  const [data,     setData]     = useState(initial.dataDistribuicao ?? '');
  const [adv,      setAdv]      = useState(initial.advogado ?? ADVOGADOS[0]);
  const [desc,     setDesc]     = useState(initial.descricao ?? '');

  function handleSave() {
    const iniciais = cliente.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('');
    onSave({ cnj, cliente, clienteIniciais: iniciais, tipoAcao: tipo, varaComarca: vara, dataDistribuicao: data, advogado: adv, descricao: desc, status: initial.status ?? 'ATIVO' });
  }

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>{titulo}</h2>
            {titulo === 'Novo Registro de Processo' && (
              <p className={styles.modalSub}>Preencha os detalhes para organizar o novo processo</p>
            )}
          </div>
          <button className={styles.modalClose} onClick={onCancel}><X size={18} /></button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.mField}>
            <label className={styles.mLabel}>NÚMERO DO PROCESSO (CNJ)</label>
            <input className={styles.mInput} value={cnj} onChange={e => setCnj(e.target.value)} placeholder="00.000.000/0000-00" />
          </div>

          <div className={styles.mRow}>
            <div className={styles.mField}>
              <label className={styles.mLabel}>CLIENTE</label>
              <div className={styles.mInputIcon}>
                <Search size={14} className={styles.mIcon} />
                <input className={styles.mInputBare} value={cliente} onChange={e => setCliente(e.target.value)} placeholder="Buscar cliente..." />
              </div>
            </div>
            <div className={styles.mField}>
              <label className={styles.mLabel}>TIPO / ÁREA DO DIREITO</label>
              <select className={styles.mSelect} value={tipo} onChange={e => setTipo(e.target.value)}>
                {TIPOS_ACAO.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className={styles.mRow}>
            <div className={styles.mField}>
              <label className={styles.mLabel}>VARA / COMARCA</label>
              <input className={styles.mInput} value={vara} onChange={e => setVara(e.target.value)} placeholder="Ex: 2ª Vara Cível de São Paulo" />
            </div>
            <div className={styles.mField}>
              <label className={styles.mLabel}>DATA DE DISTRIBUIÇÃO</label>
              <input className={styles.mInput} type="date" value={data} onChange={e => setData(e.target.value)} />
            </div>
          </div>

          <div className={styles.mField}>
            <label className={styles.mLabel}>ADVOGADO RESPONSÁVEL</label>
            <select className={styles.mSelect} value={adv} onChange={e => setAdv(e.target.value)}>
              {ADVOGADOS.map(a => <option key={a}>{a}</option>)}
            </select>
          </div>

          <div className={styles.mField}>
            <label className={styles.mLabel}>DESCRIÇÃO / OBJETO DA AÇÃO</label>
            <textarea className={styles.mTextarea} rows={4} value={desc} onChange={e => setDesc(e.target.value)} placeholder="Descreva os detalhes e objetivos do processo..." />
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.btnCancel} onClick={onCancel}>Cancelar</button>
          <div className={styles.modalFooterRight}>
            {onDelete && (
              <button className={styles.btnDelete} onClick={onDelete}>
                <Trash2 size={15} /> Excluir
              </button>
            )}
            <button className={styles.btnSave} onClick={handleSave}>
              {onDelete ? <><Pencil size={15} /> Salvar Edições</> : 'Adicionar Processo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────
export default function Processos() {
  const [processos, setProcessos] = useState<Processo[]>(mockProcessos);
  const [modal, setModal]         = useState<'novo' | 'editar' | null>(null);
  const [selected, setSelected]   = useState<Processo | null>(null);
  const [toast, setToast]         = useState<{ msg: string; tipo: 'add' | 'del' } | null>(null);

  // Filtros
  const [busca,      setBusca]      = useState('');
  const [filtStatus, setFiltStatus] = useState('');
  const [filtAcao,   setFiltAcao]   = useState('');
  const [filtAdv,    setFiltAdv]    = useState('');
  const [page,       setPage]       = useState(1);

  // Stats
  const total        = processos.length;
  const ativos       = processos.filter(p => p.status === 'ATIVO').length;
  const prazoCritico = processos.filter(p => p.status === 'PRAZO CRÍTICO').length;
  const encerrados   = processos.filter(p => p.status === 'ENCERRADO' || p.status === 'ARQUIVADO').length;

  // Filtered list
  const filtered = useMemo(() => processos.filter(p => {
    const q = busca.toLowerCase();
    const matchBusca  = !busca      || p.cnj.includes(q) || p.cliente.toLowerCase().includes(q);
    const matchStatus = !filtStatus || p.status === filtStatus;
    const matchAcao   = !filtAcao   || p.tipoAcao === filtAcao;
    const matchAdv    = !filtAdv    || p.advogado === filtAdv;
    return matchBusca && matchStatus && matchAcao && matchAdv;
  }), [processos, busca, filtStatus, filtAcao, filtAdv]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const visible    = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function showToast(msg: string, tipo: 'add' | 'del') {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 4000);
  }

  function handleAdd(data: Omit<Processo, 'id'>) {
    const novo = { ...data, id: Date.now() };
    setProcessos(p => [...p, novo]);
    setModal(null);
    showToast(`UM PROCESSO FOI ADICIONADO/SALVO: n º ${data.cnj}!`, 'add');
  }

  function handleEdit(data: Omit<Processo, 'id'>) {
    if (!selected) return;
    setProcessos(p => p.map(x => x.id === selected.id ? { ...x, ...data } : x));
    setModal(null);
    setSelected(null);
  }

  function handleDelete() {
    if (!selected) return;
    const cnj = selected.cnj;
    setProcessos(p => p.filter(x => x.id !== selected.id));
    setModal(null);
    setSelected(null);
    showToast(`UM PROCESSO FOI EXCLUÍDO: n º ${cnj}!`, 'del');
  }

  return (
    <div className={styles.page}>

      {/* Toast */}
      {toast && (
        <div className={`${styles.toast} ${toast.tipo === 'del' ? styles.toastDel : styles.toastAdd}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Core Jurídico</h1>
        <button className={styles.btnPrimary} onClick={() => setModal('novo')}>
          <Plus size={16} /> Novo Processo
        </button>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statTop}>
            <span className={styles.statIcon} style={{ background: '#e8eaf6' }}><Building2 size={20} color="#3949ab" /></span>
            <span className={styles.statBadge}>+3 este mês</span>
          </div>
          <p className={styles.statLabel}>TOTAL DE PROCESSOS</p>
          <p className={styles.statValue}>{String(total).padStart(2, '0')}</p>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statTop}>
            <span className={styles.statIcon} style={{ background: '#e8f5e9' }}><Scale size={20} color="#2e7d32" /></span>
          </div>
          <p className={styles.statLabel}>ATIVOS</p>
          <p className={styles.statValue}>{String(ativos).padStart(2, '0')}</p>
          <p className={styles.statSub}>Processos em andamento</p>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statTop}>
            <span className={styles.statIcon} style={{ background: '#fdecea' }}><AlertCircle size={20} color="#c62828" /></span>
          </div>
          <p className={styles.statLabel}>PRAZOS CRÍTICOS</p>
          <p className={`${styles.statValue} ${styles.statValueRed}`}>{String(prazoCritico).padStart(2, '0')}</p>
          <p className={styles.statSub}>Nos próximos 7 dias</p>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statTop}>
            <span className={styles.statIcon} style={{ background: '#f5f5f5' }}><Archive size={20} color="#757575" /></span>
          </div>
          <p className={styles.statLabel}>ENCERRADOS</p>
          <p className={styles.statValue}>{String(encerrados).padStart(2, '0')}</p>
          <p className={styles.statSub}>Total este semestre</p>
        </div>
      </div>

      {/* Tabela */}
      <div className={styles.tableCard}>
        {/* Filtros */}
        <div className={styles.filterBar}>
          <p className={styles.filterLabel}>BUSCAR PROCESSO</p>
          <div className={styles.filterRow}>
            <div className={styles.searchBox}>
              <Search size={15} className={styles.searchIcon} />
              <input
                className={styles.searchInput}
                placeholder="CNJ ou nome do cliente"
                value={busca}
                onChange={e => { setBusca(e.target.value); setPage(1); }}
              />
            </div>
            <select className={styles.filterSelect} value={filtStatus} onChange={e => { setFiltStatus(e.target.value); setPage(1); }}>
              <option value="">Status</option>
              {['ATIVO','PRAZO CRÍTICO','SUSPENSO','ARQUIVADO','ENCERRADO'].map(s => <option key={s}>{s}</option>)}
            </select>
            <select className={styles.filterSelect} value={filtAcao} onChange={e => { setFiltAcao(e.target.value); setPage(1); }}>
              <option value="">Ação</option>
              {TIPOS_ACAO.map(t => <option key={t}>{t}</option>)}
            </select>
            <select className={styles.filterSelect} value={filtAdv} onChange={e => { setFiltAdv(e.target.value); setPage(1); }}>
              <option value="">Advogado</option>
              {ADVOGADOS.map(a => <option key={a}>{a}</option>)}
            </select>
          </div>
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nº CNJ</th>
              <th>TIPO DE AÇÃO</th>
              <th>CLIENTE</th>
              <th>VARA/COMARCA</th>
              <th>ADVOGADO</th>
              <th>STATUS</th>
              <th>AÇÕES</th>
            </tr>
          </thead>
          <tbody>
            {visible.map(p => (
              <tr key={p.id}>
                <td className={styles.cnj}>{p.cnj}</td>
                <td>{p.tipoAcao}</td>
                <td>
                  <div className={styles.clienteCell}>
                    <Avatar iniciais={p.clienteIniciais} />
                    <span>{p.cliente}</span>
                  </div>
                </td>
                <td>{p.varaComarca}</td>
                <td>{p.advogado}</td>
                <td><StatusBadge status={p.status} /></td>
                <td>
                  <button
                    className={styles.btnAbrirFicha}
                    onClick={() => { setSelected(p); setModal('editar'); }}
                  >
                    Abrir Ficha
                  </button>
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr><td colSpan={7} className={styles.empty}>Nenhum processo encontrado.</td></tr>
            )}
          </tbody>
        </table>

        {/* Paginação */}
        <div className={styles.tableFooter}>
          <span className={styles.pageInfo}>
            Mostrando <strong>{Math.min((page-1)*PER_PAGE+1, filtered.length)}-{Math.min(page*PER_PAGE, filtered.length)}</strong> de <strong>{filtered.length}</strong> processos
          </span>
          <div className={styles.pagination}>
            <button className={styles.pageArrow} onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}><ChevronLeft size={15}/></button>
            {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => i+1).map(p => (
              <button key={p} className={`${styles.pageNum} ${page===p ? styles.pageActive : ''}`} onClick={() => setPage(p)}>{p}</button>
            ))}
            {totalPages > 4 && <span className={styles.pageDots}>...</span>}
            {totalPages > 3 && (
              <button className={`${styles.pageNum} ${page===totalPages ? styles.pageActive : ''}`} onClick={() => setPage(totalPages)}>{totalPages}</button>
            )}
            <button className={styles.pageArrow} onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages}><ChevronRight size={15}/></button>
          </div>
        </div>
      </div>

      {/* Modal Novo */}
      {modal === 'novo' && (
        <ProcessoModal titulo="Novo Registro de Processo" onCancel={() => setModal(null)} onSave={handleAdd} />
      )}

      {/* Modal Editar */}
      {modal === 'editar' && selected && (
        <ProcessoModal
          titulo="Informações do Processo"
          initial={selected}
          onCancel={() => { setModal(null); setSelected(null); }}
          onSave={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
