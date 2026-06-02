import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Trash2, Pencil, CalendarDays, Clock, LayoutList, Scale } from 'lucide-react';
import { mockCompromissos, TIPOS_COMPROMISSO, TIPOS_PRAZO, DIAS_UTEIS } from './mockData';
import type { Compromisso, TipoCompromisso } from './types';
import styles from './Agenda.module.css';

// ── Helpers ───────────────────────────────────────────────
const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const DIAS_SEMANA_HEADER = ['DOM','SEG','TER','QUA','QUI','SEX','SÁB'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}
function toYMD(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
}

const TIPO_COLOR: Record<string, string> = {
  'Audiência':            '#e65100',
  'Audiência de Instrução':'#e65100',
  'Reunião':              '#1565c0',
  'Prazo':                '#c62828',
  'Depoimento':           '#e65100',
  'Perícia':              '#4527a0',
  'Outro':                '#37474f',
};

// ── Compromisso Modal (Novo / Editar) ─────────────────────
interface CompromissoModalProps {
  titulo: string;
  initial?: Partial<Compromisso>;
  onCancel: () => void;
  onSave: (c: Omit<Compromisso,'id'>) => void;
}

function CompromissoModal({ titulo, initial = {}, onCancel, onSave }: CompromissoModalProps) {
  const [tipo,    setTipo]    = useState<TipoCompromisso>(initial.tipo    ?? 'Audiência');
  const [data,    setData]    = useState(initial.data    ?? '');
  const [inicio,  setInicio]  = useState(initial.inicio  ?? '');
  const [duracao, setDuracao] = useState(initial.duracao ?? '60 min');
  const [cliente, setCliente] = useState(initial.cliente ?? '');
  const [proc,    setProc]    = useState(initial.processo ?? '');
  const [obs,     setObs]     = useState(initial.observacoes ?? '');

  function handleSave() {
    onSave({ tipo, titulo: `${tipo} - ${cliente || 'Sem cliente'}`, data, inicio, duracao, cliente, processo: proc, observacoes: obs });
  }

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{titulo}</h2>
          <button className={styles.modalClose} onClick={onCancel}><X size={18}/></button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.mField}>
            <label className={styles.mLabel}>TIPO DO COMPROMISSO</label>
            <select className={styles.mSelect} value={tipo} onChange={e => setTipo(e.target.value as TipoCompromisso)}>
              {TIPOS_COMPROMISSO.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className={styles.mRow3}>
            <div className={styles.mField}>
              <label className={styles.mLabel}>DATA</label>
              <input className={styles.mInput} type="date" value={data} onChange={e => setData(e.target.value)} />
            </div>
            <div className={styles.mField}>
              <label className={styles.mLabel}>INÍCIO</label>
              <input className={styles.mInput} type="time" value={inicio} onChange={e => setInicio(e.target.value)} />
            </div>
            <div className={styles.mField}>
              <label className={styles.mLabel}>DURAÇÃO</label>
              <input className={styles.mInput} value={duracao} onChange={e => setDuracao(e.target.value)} placeholder="60 min" />
            </div>
          </div>
          <div className={styles.mField}>
            <label className={styles.mLabel}>VINCULAR CLIENTE (OPCIONAL)</label>
            <div className={styles.mInputIcon}>
              <LayoutList size={14} className={styles.mIcon}/>
              <input className={styles.mInputBare} value={cliente} onChange={e => setCliente(e.target.value)} placeholder="Buscar cliente..." />
            </div>
          </div>
          <div className={styles.mField}>
            <label className={styles.mLabel}>VINCULAR PROCESSO (OPCIONAL)</label>
            <div className={styles.mInputIcon}>
              <Scale size={14} className={styles.mIcon}/>
              <input className={styles.mInputBare} value={proc} onChange={e => setProc(e.target.value)} placeholder="Número do processo ou tag..." />
            </div>
          </div>
          <div className={styles.mField}>
            <label className={styles.mLabel}>OBSERVAÇÕES</label>
            <textarea className={styles.mTextarea} rows={4} value={obs} onChange={e => setObs(e.target.value)} placeholder="Detalhes adicionais..." />
          </div>
        </div>
        <div className={styles.modalFooter}>
          <button className={styles.btnCancel} onClick={onCancel}>Cancelar</button>
          <button className={styles.btnSave} onClick={handleSave}>Salvar Evento</button>
        </div>
      </div>
    </div>
  );
}

// ── Detalhes Modal ────────────────────────────────────────
interface DetalhesModalProps {
  compromisso: Compromisso;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function DetalhesModal({ compromisso: c, onClose, onEdit, onDelete }: DetalhesModalProps) {
  const dataFmt = new Date(c.data + 'T12:00:00').toLocaleDateString('pt-BR',{ day:'2-digit', month:'long', year:'numeric' });
  const color   = TIPO_COLOR[c.tipo] ?? '#555';

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.detalhesModal} onClick={e => e.stopPropagation()}>
        <button className={styles.detalhesClose} onClick={onClose}><X size={16}/></button>
        <span className={styles.detalhesTipoBadge} style={{ background: `${color}18`, color }}>{c.tipo.toUpperCase()}</span>
        <h2 className={styles.detalhesTitulo}>{c.titulo}</h2>

        <div className={styles.detalhesRow}>
          <div className={styles.detalhesItem}>
            <CalendarDays size={16} className={styles.detalhesIcon}/>
            <div>
              <p className={styles.detalhesLabel}>DATA</p>
              <p className={styles.detalhesVal}>{dataFmt}</p>
            </div>
          </div>
          <div className={styles.detalhesItem}>
            <Clock size={16} className={styles.detalhesIcon}/>
            <div>
              <p className={styles.detalhesLabel}>HORÁRIO</p>
              <p className={styles.detalhesVal}>{c.inicio}</p>
            </div>
          </div>
        </div>

        {(c.cliente || c.processo) && (
          <div className={styles.detalhesInfoCard}>
            {c.cliente && (
              <div className={styles.detalhesInfoItem}>
                <LayoutList size={15} className={styles.detalhesInfoIcon}/>
                <div>
                  <p className={styles.detalhesLabel}>CLIENTE</p>
                  <p className={styles.detalhesInfoVal}>{c.cliente}</p>
                </div>
              </div>
            )}
            {c.processo && (
              <div className={styles.detalhesInfoItem}>
                <Scale size={15} className={styles.detalhesInfoIcon}/>
                <div>
                  <p className={styles.detalhesLabel}>PROCESSO VINCULADO</p>
                  <p className={styles.detalhesInfoVal}>{c.processo}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {c.observacoes && (
          <div className={styles.detalhesObs}>
            <p className={styles.detalhesObsLabel}><LayoutList size={13}/> NOTAS E OBSERVAÇÕES</p>
            <blockquote className={styles.detalhesObsText}>"{c.observacoes}"</blockquote>
          </div>
        )}

        <div className={styles.detalhesActions}>
          <button className={styles.btnExcluir} onClick={onDelete}><Trash2 size={15}/> Excluir</button>
          <button className={styles.btnEditar}  onClick={onEdit}><Pencil size={15}/> Editar</button>
        </div>
      </div>
    </div>
  );
}

// ── Calculadora Modal ─────────────────────────────────────
interface CalcModalProps {
  onClose: () => void;
  onSalvarAgenda: (c: Omit<Compromisso,'id'>) => void;
}

function CalcModal({ onClose, onSalvarAgenda }: CalcModalProps) {
  const [dataInt, setDataInt] = useState('');
  const [tipoPrazo, setTipoPrazo] = useState(TIPOS_PRAZO[0]);
  const [comarca, setComarca] = useState('');
  const [resultado, setResultado] = useState<{ dataLimite: string; diasRestantes: number } | null>(null);

  function calcular() {
    if (!dataInt) return;
    const dias = DIAS_UTEIS[tipoPrazo] ?? 15;
    const base = new Date(dataInt + 'T12:00:00');
    let count = 0;
    let cur = new Date(base);
    while (count < dias) {
      cur.setDate(cur.getDate() + 1);
      const dow = cur.getDay();
      if (dow !== 0 && dow !== 6) count++;
    }
    const hoje = new Date();
    const diff = Math.max(0, Math.ceil((cur.getTime() - hoje.getTime()) / 86400000));
    setResultado({
      dataLimite: cur.toLocaleDateString('pt-BR', { day:'2-digit', month:'short', year:'numeric' }).toUpperCase(),
      diasRestantes: diff,
    });
  }

  function salvar() {
    if (!resultado) return;
    onSalvarAgenda({
      tipo: 'Prazo', titulo: `Prazo: ${tipoPrazo}`,
      data: dataInt, inicio: '00:00', duracao: '—',
      cliente: '', processo: '', observacoes: `Comarca: ${comarca}`,
    });
    onClose();
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.calcWrapper} onClick={e => e.stopPropagation()}>
        {/* Formulário */}
        <div className={styles.calcForm}>
          <div className={styles.calcHeader}>
            <CalendarDays size={20} className={styles.calcHeaderIcon}/>
            <h2 className={styles.calcTitle}>Calcular Prazo Processual</h2>
          </div>
          <div className={styles.mField}>
            <label className={styles.mLabel}>DATA DE INTIMAÇÃO</label>
            <input className={styles.mInput} type="date" value={dataInt} onChange={e => setDataInt(e.target.value)}/>
          </div>
          <div className={styles.mField}>
            <label className={styles.mLabel}>TIPO DE PRAZO</label>
            <select className={styles.mSelect} value={tipoPrazo} onChange={e => setTipoPrazo(e.target.value)}>
              {TIPOS_PRAZO.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className={styles.mField}>
            <label className={styles.mLabel}>COMARCA/TRIBUNAL</label>
            <input className={styles.mInput} value={comarca} onChange={e => setComarca(e.target.value)} placeholder="Ex: TJSP - Capital"/>
          </div>
          <button className={styles.btnSave} style={{ width:'100%', marginTop:8 }} onClick={calcular}>Calcular Agora</button>
        </div>

        {/* Resultado */}
        <div className={styles.calcResultado}>
          <button className={styles.calcClose} onClick={onClose}><X size={16}/></button>
          {resultado ? (
            <>
              <p className={styles.calcResultLabel}>RESULTADO ESTIMADO</p>
              <p className={styles.calcResultSubLabel}>DATA-LIMITE ESTIMADA</p>
              <p className={styles.calcResultDate}>{resultado.dataLimite}</p>
              <p className={styles.calcResultSubLabel}>DIAS ÚTEIS RESTANTES</p>
              <div className={styles.calcResultDias}>
                <span className={styles.calcResultNum}>{String(resultado.diasRestantes).padStart(2,'0')}</span>
                <span className={styles.calcResultDiasLabel}>DIAS</span>
              </div>
              <button className={styles.btnSalvarAgenda} onClick={salvar}>
                <CalendarDays size={15}/> Salvar na Agenda
              </button>
            </>
          ) : (
            <>
              <p className={styles.calcResultLabel}>RESULTADO ESTIMADO</p>
              <p className={styles.calcResultEmpty}>Preencha os campos e clique em Calcular Agora.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────
export default function Agenda() {
  const today = new Date();
  const [year,  setYear]  = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [compromissos, setCompromissos] = useState<Compromisso[]>(mockCompromissos);

  const [modal,     setModal]     = useState<'novo' | 'editar' | 'detalhes' | 'calc' | null>(null);
  const [selected,  setSelected]  = useState<Compromisso | null>(null);
  const [clickDate, setClickDate] = useState('');

  function prevMonth() { if (month === 0) { setMonth(11); setYear(y => y-1); } else setMonth(m => m-1); }
  function nextMonth() { if (month === 11) { setMonth(0);  setYear(y => y+1); } else setMonth(m => m+1); }

  function handleAdd(data: Omit<Compromisso,'id'>) {
    setCompromissos(cs => [...cs, { ...data, id: Date.now() }]);
    setModal(null);
  }

  function handleEdit(data: Omit<Compromisso,'id'>) {
    if (!selected) return;
    setCompromissos(cs => cs.map(c => c.id === selected.id ? { ...c, ...data } : c));
    setModal(null); setSelected(null);
  }

  function handleDelete() {
    if (!selected) return;
    setCompromissos(cs => cs.filter(c => c.id !== selected.id));
    setModal(null); setSelected(null);
  }

  // Build calendar grid
  const daysInMonth  = getDaysInMonth(year, month);
  const firstDayOfWeek = getFirstDayOfWeek(year, month);
  const totalCells   = Math.ceil((daysInMonth + firstDayOfWeek) / 7) * 7;

  const todayYMD = toYMD(today.getFullYear(), today.getMonth(), today.getDate());

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Agenda Jurídica</h1>
        <div className={styles.headerRight}>
          <div className={styles.monthNav}>
            <button className={styles.monthBtn} onClick={prevMonth}><ChevronLeft size={16}/></button>
            <span className={styles.monthLabel}>{MESES[month]} {year}</span>
            <button className={styles.monthBtn} onClick={nextMonth}><ChevronRight size={16}/></button>
          </div>
          <button className={styles.btnCalc} onClick={() => setModal('calc')}>
            <CalendarDays size={16}/> Calcular Prazo
          </button>
          <button className={styles.btnPrimary} onClick={() => { setClickDate(''); setModal('novo'); }}>
            <Plus size={16}/> Novo Compromisso
          </button>
        </div>
      </div>

      {/* Calendar */}
      <div className={styles.calendar}>
        {/* Day headers */}
        <div className={styles.calHeader}>
          {DIAS_SEMANA_HEADER.map(d => (
            <div key={d} className={styles.calHeaderCell}>{d}</div>
          ))}
        </div>

        {/* Cells */}
        <div className={styles.calGrid}>
          {Array.from({ length: totalCells }, (_, i) => {
            const dayNum  = i - firstDayOfWeek + 1;
            const isValid = dayNum >= 1 && dayNum <= daysInMonth;
            const ymd     = isValid ? toYMD(year, month, dayNum) : '';
            const isToday = ymd === todayYMD;
            const events  = isValid ? compromissos.filter(c => c.data === ymd) : [];

            return (
              <div
                key={i}
                className={`${styles.calCell} ${isToday ? styles.calCellToday : ''} ${!isValid ? styles.calCellEmpty : ''}`}
                onClick={() => { if (isValid) { setClickDate(ymd); setModal('novo'); } }}
              >
                {isValid && <span className={`${styles.dayNum} ${isToday ? styles.dayNumToday : ''}`}>{dayNum}</span>}
                {events.map(ev => {
                  const color = TIPO_COLOR[ev.tipo] ?? '#555';
                  const isPrazo = ev.tipo === 'Prazo';
                  return (
                    <div
                      key={ev.id}
                      className={`${styles.eventChip} ${isPrazo ? styles.eventChipPrazo : ''}`}
                      style={isPrazo ? { color, background: `${color}12`, borderLeft: `3px solid ${color}` } : { background: color }}
                      onClick={e => { e.stopPropagation(); setSelected(ev); setModal('detalhes'); }}
                    >
                      {!isPrazo && <span className={styles.eventTime}>{ev.inicio} </span>}
                      {ev.titulo}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modais */}
      {modal === 'novo' && (
        <CompromissoModal titulo="Novo Compromisso" initial={{ data: clickDate }} onCancel={() => setModal(null)} onSave={handleAdd} />
      )}

      {modal === 'detalhes' && selected && (
        <DetalhesModal
          compromisso={selected}
          onClose={() => { setModal(null); setSelected(null); }}
          onEdit={() => setModal('editar')}
          onDelete={handleDelete}
        />
      )}

      {modal === 'editar' && selected && (
        <CompromissoModal titulo="Editar Compromisso" initial={selected} onCancel={() => setModal('detalhes')} onSave={handleEdit} />
      )}

      {modal === 'calc' && (
        <CalcModal onClose={() => setModal(null)} onSalvarAgenda={handleAdd} />
      )}
    </div>
  );
}
