import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Modal from '../../../components/sistema/Modal/Modal';
import {
  listForensicHolidays,
  createForensicHoliday,
  updateForensicHoliday,
  deleteForensicHoliday,
} from '../../../services/forensicHolidays';
import type { ForensicHoliday, HolidayScope, HolidayCreate } from '../../../services/forensicHolidays';
import { ApiError } from '../../../services/api';
import styles from './Feriados.module.css';

type ModalType = 'novo' | 'editar' | 'excluir' | null;

const SCOPE_LABEL: Record<HolidayScope, string> = {
  NATIONAL: 'Nacional',
  COURT:    'Tribunal',
  COMARCA:  'Comarca',
};

const SCOPE_STYLE: Record<HolidayScope, React.CSSProperties> = {
  NATIONAL: { background: '#e8eaf6', color: '#3949ab' },
  COURT:    { background: '#fff3e0', color: '#e65100' },
  COMARCA:  { background: '#e8f5e9', color: '#2e7d32' },
};

const LIMIT = 20;

function formatDate(d: string) {
  const [y, m, day] = d.split('-');
  return new Date(`${y}-${m}-${day}T12:00:00`).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

export default function Feriados() {
  const [items, setItems]   = useState<ForensicHoliday[]>([]);
  const [total, setTotal]   = useState(0);
  const [page, setPage]     = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  const [filterYear,    setFilterYear]    = useState(String(new Date().getFullYear()));
  const [filterCourt,   setFilterCourt]   = useState('');
  const [filterComarca, setFilterComarca] = useState('');

  const [modalType,  setModalType]  = useState<ModalType>(null);
  const [selected,   setSelected]   = useState<ForensicHoliday | null>(null);
  const [formDate,   setFormDate]   = useState('');
  const [formDesc,   setFormDesc]   = useState('');
  const [formScope,  setFormScope]  = useState<HolidayScope>('NATIONAL');
  const [formCourt,  setFormCourt]  = useState('');
  const [formComarca, setFormComarca] = useState('');
  const [formError,  setFormError]  = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchItems = useCallback(async (
    p: number, year: string, court: string, comarca: string,
  ) => {
    setLoading(true);
    setError('');
    try {
      const res = await listForensicHolidays({
        year:    year    ? Number(year) : undefined,
        court:   court   || undefined,
        comarca: comarca || undefined,
        page:    p,
        limit:   LIMIT,
      });
      setItems(res.data);
      setTotal(res.meta.total);
    } catch {
      setError('Não foi possível carregar os feriados.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchItems(page, filterYear, filterCourt, filterComarca);
  }, [fetchItems, page, filterYear, filterCourt, filterComarca]);

  function openNovo() {
    setFormDate(''); setFormDesc(''); setFormScope('NATIONAL');
    setFormCourt(''); setFormComarca(''); setFormError('');
    setModalType('novo');
  }

  function openEditar(h: ForensicHoliday) {
    setSelected(h);
    setFormDate(h.date); setFormDesc(h.description); setFormScope(h.scope);
    setFormCourt(h.court ?? ''); setFormComarca(h.comarca ?? '');
    setFormError('');
    setModalType('editar');
  }

  function openExcluir(h: ForensicHoliday) {
    setSelected(h); setFormError('');
    setModalType('excluir');
  }

  function closeModal() { setModalType(null); setSelected(null); setFormError(''); }

  function buildPayload(): HolidayCreate {
    return {
      date:        formDate,
      description: formDesc.trim(),
      scope:       formScope,
      court:       formScope === 'COURT'   ? (formCourt.trim()   || null) : null,
      comarca:     formScope === 'COMARCA' ? (formComarca.trim() || null) : null,
    };
  }

  function validateForm(): string {
    if (!formDate)        return 'Data é obrigatória.';
    if (!formDesc.trim()) return 'Descrição é obrigatória.';
    if (formScope === 'COURT'   && !formCourt.trim())   return 'Tribunal é obrigatório para escopo Tribunal.';
    if (formScope === 'COMARCA' && !formComarca.trim()) return 'Comarca é obrigatória para escopo Comarca.';
    return '';
  }

  async function salvarNovo() {
    const err = validateForm();
    if (err) { setFormError(err); return; }
    setSubmitting(true); setFormError('');
    try {
      const created = await createForensicHoliday(buildPayload());
      setItems(prev => [created, ...prev]);
      setTotal(prev => prev + 1);
      closeModal();
    } catch (e) {
      setFormError(e instanceof ApiError ? e.message : 'Não foi possível criar o feriado.');
    } finally {
      setSubmitting(false);
    }
  }

  async function salvarEdicao() {
    if (!selected) return;
    const err = validateForm();
    if (err) { setFormError(err); return; }
    setSubmitting(true); setFormError('');
    try {
      const updated = await updateForensicHoliday(selected.id, buildPayload());
      setItems(prev => prev.map(h => h.id === selected.id ? updated : h));
      closeModal();
    } catch (e) {
      setFormError(e instanceof ApiError ? e.message : 'Não foi possível atualizar o feriado.');
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmarExcluir() {
    if (!selected) return;
    setSubmitting(true); setFormError('');
    try {
      await deleteForensicHoliday(selected.id);
      setItems(prev => prev.filter(h => h.id !== selected.id));
      setTotal(prev => prev - 1);
      closeModal();
    } catch {
      setFormError('Não foi possível excluir o feriado.');
    } finally {
      setSubmitting(false);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));
  const hasFilters = !!(filterYear || filterCourt || filterComarca);

  return (
    <div className={styles.page}>

      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Feriados Forenses</h1>
        <button className={styles.btnPrimary} onClick={openNovo}>
          <Plus size={16} /> Novo Feriado
        </button>
      </div>

      {/* Filtros */}
      <div className={styles.filterBar}>
        <div className={styles.filterDateGroup}>
          <span className={styles.filterLabel}>Ano</span>
          <input
            type="number"
            className={styles.filterInput}
            value={filterYear}
            min={1900} max={2100}
            placeholder="Todos"
            style={{ width: 90 }}
            onChange={e => { setFilterYear(e.target.value); setPage(1); }}
          />
        </div>
        <div className={styles.filterDateGroup}>
          <span className={styles.filterLabel}>Tribunal</span>
          <input
            className={styles.filterInput}
            value={filterCourt}
            placeholder="Ex: TJSP"
            onChange={e => { setFilterCourt(e.target.value); setPage(1); }}
          />
        </div>
        <div className={styles.filterDateGroup}>
          <span className={styles.filterLabel}>Comarca</span>
          <input
            className={styles.filterInput}
            value={filterComarca}
            placeholder="Ex: São Paulo"
            onChange={e => { setFilterComarca(e.target.value); setPage(1); }}
          />
        </div>
        {hasFilters && (
          <button
            className={styles.btnBack}
            onClick={() => { setFilterYear(''); setFilterCourt(''); setFilterComarca(''); setPage(1); }}
          >
            <X size={14} /> Limpar
          </button>
        )}
      </div>

      {loading && <p className={styles.statusMsg}>Carregando...</p>}
      {error   && <p className={styles.errorMsg}>{error}</p>}

      {!loading && !error && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Data</th>
                <th>Descrição</th>
                <th>Escopo</th>
                <th>Tribunal</th>
                <th>Comarca</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <p className={styles.statusMsg}>Nenhum feriado encontrado.</p>
                  </td>
                </tr>
              )}
              {items.map(h => (
                <tr key={h.id}>
                  <td className={styles.dateCell}>{formatDate(h.date)}</td>
                  <td className={styles.descCell}>{h.description}</td>
                  <td>
                    <span className={styles.badge} style={SCOPE_STYLE[h.scope]}>
                      {SCOPE_LABEL[h.scope]}
                    </span>
                  </td>
                  <td className={styles.subCell}>{h.court   ?? '—'}</td>
                  <td className={styles.subCell}>{h.comarca ?? '—'}</td>
                  <td>
                    <div className={styles.acoes}>
                      <button
                        className={styles.iconBtn}
                        onClick={() => openEditar(h)}
                        title="Editar"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        className={`${styles.iconBtn} ${styles.danger}`}
                        onClick={() => openExcluir(h)}
                        title="Excluir"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className={styles.pagination}>
        <span className={styles.pageInfo}>
          Mostrando <strong>{items.length}</strong> de <strong>{total}</strong> feriados
        </span>
        <div className={styles.pageControls}>
          <button className={styles.pageArrow} disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              className={`${styles.pageNum} ${page === i + 1 ? styles.pageActive : ''}`}
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button className={styles.pageArrow} disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Modal Novo */}
      {modalType === 'novo' && (
        <Modal title="Novo Feriado Forense" onClose={closeModal}>
          <HolidayFormFields
            formDate={formDate}       setFormDate={setFormDate}
            formDesc={formDesc}       setFormDesc={setFormDesc}
            formScope={formScope}     setFormScope={setFormScope}
            formCourt={formCourt}     setFormCourt={setFormCourt}
            formComarca={formComarca} setFormComarca={setFormComarca}
          />
          {formError && <p className={styles.errorMsg}>{formError}</p>}
          <div className={styles.modalFooter}>
            <button className={styles.btnCancel} onClick={closeModal}>Cancelar</button>
            <button className={styles.btnPrimary} onClick={() => void salvarNovo()} disabled={submitting}>
              <Plus size={16} /> {submitting ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </Modal>
      )}

      {/* Modal Editar */}
      {modalType === 'editar' && selected && (
        <Modal title="Editar Feriado Forense" onClose={closeModal}>
          <HolidayFormFields
            formDate={formDate}       setFormDate={setFormDate}
            formDesc={formDesc}       setFormDesc={setFormDesc}
            formScope={formScope}     setFormScope={setFormScope}
            formCourt={formCourt}     setFormCourt={setFormCourt}
            formComarca={formComarca} setFormComarca={setFormComarca}
          />
          {formError && <p className={styles.errorMsg}>{formError}</p>}
          <div className={styles.modalFooter}>
            <button className={styles.btnCancel} onClick={closeModal}>Cancelar</button>
            <button className={styles.btnPrimary} onClick={() => void salvarEdicao()} disabled={submitting}>
              {submitting ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </Modal>
      )}

      {/* Modal Excluir */}
      {modalType === 'excluir' && selected && (
        <Modal title="Excluir Feriado" onClose={closeModal} width={420}>
          <p className={styles.deleteText}>
            Tem certeza que deseja excluir <strong>{selected.description}</strong>{' '}
            ({formatDate(selected.date)})? Esta ação não pode ser desfeita.
          </p>
          {formError && <p className={styles.errorMsg}>{formError}</p>}
          <div className={styles.modalFooter}>
            <button className={styles.btnCancel} onClick={closeModal}>Cancelar</button>
            <button className={styles.btnDanger} onClick={() => void confirmarExcluir()} disabled={submitting}>
              {submitting ? 'Excluindo...' : 'Excluir'}
            </button>
          </div>
        </Modal>
      )}

    </div>
  );
}

interface FormProps {
  formDate: string;    setFormDate:    (v: string) => void;
  formDesc: string;    setFormDesc:    (v: string) => void;
  formScope: HolidayScope; setFormScope: (v: HolidayScope) => void;
  formCourt: string;   setFormCourt:   (v: string) => void;
  formComarca: string; setFormComarca: (v: string) => void;
}

function HolidayFormFields({
  formDate, setFormDate,
  formDesc, setFormDesc,
  formScope, setFormScope,
  formCourt, setFormCourt,
  formComarca, setFormComarca,
}: FormProps) {
  return (
    <>
      <div className={styles.fieldRow}>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Data</label>
          <input
            type="date"
            className={styles.fieldInput}
            value={formDate}
            onChange={e => setFormDate(e.target.value)}
          />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Escopo</label>
          <select
            className={styles.fieldInput}
            value={formScope}
            onChange={e => {
              setFormScope(e.target.value as HolidayScope);
              setFormCourt('');
              setFormComarca('');
            }}
          >
            <option value="NATIONAL">Nacional</option>
            <option value="COURT">Tribunal</option>
            <option value="COMARCA">Comarca</option>
          </select>
        </div>
      </div>
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>Descrição</label>
        <input
          className={styles.fieldInput}
          value={formDesc}
          onChange={e => setFormDesc(e.target.value)}
          placeholder="Ex: Feriado Nacional do Trabalho"
          maxLength={255}
        />
      </div>
      {formScope === 'COURT' && (
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Tribunal</label>
          <input
            className={styles.fieldInput}
            value={formCourt}
            onChange={e => setFormCourt(e.target.value)}
            placeholder="Ex: TJSP"
            maxLength={50}
          />
        </div>
      )}
      {formScope === 'COMARCA' && (
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Comarca</label>
          <input
            className={styles.fieldInput}
            value={formComarca}
            onChange={e => setFormComarca(e.target.value)}
            placeholder="Ex: São Paulo"
            maxLength={120}
          />
        </div>
      )}
    </>
  );
}
