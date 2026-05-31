import { useState } from 'react';
import { Plus, Eye, Pencil, Trash2, ArrowLeft, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import Modal from '../../../components/sistema/Modal/Modal';
import CargoSelect from '../../../components/sistema/shared/CargoSelect';
import FotoUpload from '../../../components/sistema/shared/FotoUpload';
import { mockUsuarios, mockLogs } from './mockData';
import type { Usuario, Cargo } from './types';
import styles from './Usuarios.module.css';

type View = 'lista' | 'registros';
type ModalType = 'novo' | 'ver' | 'editar' | 'excluir' | null;

const BADGE_COLORS: Record<string, string> = {
  'CRIAÇÃO':  '#4caf50',
  'EDIÇÃO':   '#2196f3',
  'EXCLUSÃO': '#ef5350',
};

const CARGO_BADGE: Record<string, { bg: string; color: string }> = {
  'ADMINISTRADOR': { bg: '#fff3e0', color: '#e65100' },
  'ADVOGADO':      { bg: '#e8eaf6', color: '#3949ab' },
  'ESTAGIÁRIO':    { bg: '#e8f5e9', color: '#2e7d32' },
  'SECRETÁRIO':    { bg: '#fce4ec', color: '#c62828' },
};

export default function Usuarios() {
  const [view, setView] = useState<View>('lista');
  const [usuarios, setUsuarios] = useState<Usuario[]>(mockUsuarios);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);

  // Form state
  const [formNome, setFormNome]               = useState('');
  const [formEmail, setFormEmail]             = useState('');
  const [formCargos, setFormCargos]           = useState<Cargo[]>([]);
  const [formEspec, setFormEspec]             = useState('');
  const [formFoto, setFormFoto]               = useState<string | undefined>();

  function openNovo() {
    setFormNome(''); setFormEmail(''); setFormCargos([]); setFormEspec(''); setFormFoto(undefined);
    setModalType('novo');
  }

  function openVer(u: Usuario) { setSelectedUser(u); setModalType('ver'); }

  function openEditar(u: Usuario) {
    setSelectedUser(u);
    setFormNome(u.nome); setFormEmail(u.email);
    setFormCargos(u.cargos); setFormEspec(u.especializacao); setFormFoto(u.foto);
    setModalType('editar');
  }

  function openExcluir(u: Usuario) { setSelectedUser(u); setModalType('excluir'); }

  function closeModal() { setModalType(null); setSelectedUser(null); }

  function salvarNovo() {
    const novo: Usuario = {
      id: Date.now(), nome: formNome, email: formEmail,
      cargos: formCargos, especializacao: formEspec,
      data: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
      ultimaEdicao: 'Recém criado', foto: formFoto,
    };
    setUsuarios(u => [novo, ...u]);
    closeModal();
  }

  function salvarEdicao() {
    if (!selectedUser) return;
    setUsuarios(u => u.map(x => x.id === selectedUser.id
      ? { ...x, nome: formNome, email: formEmail, cargos: formCargos, especializacao: formEspec, foto: formFoto }
      : x
    ));
    closeModal();
  }

  function confirmarExclusao() {
    if (!selectedUser) return;
    setUsuarios(u => u.filter(x => x.id !== selectedUser.id));
    closeModal();
  }

  return (
    <div className={styles.page}>

      {/* ── LISTA ── */}
      {view === 'lista' && (
        <>
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>Gerenciar Usuários</h1>
            <div className={styles.headerActions}>
              <button className={styles.btnSecondary} onClick={() => setView('registros')}>Registros</button>
              <button className={styles.btnPrimary} onClick={openNovo}>
                <Plus size={16} /> Novo Usuário
              </button>
            </div>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Nome Completo</th>
                  <th>E-mail</th>
                  <th>Cargo</th>
                  <th>Data</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div className={styles.userName}>{u.nome}</div>
                      <div className={styles.userSub}>Especialização:</div>
                      <div className={styles.userSub}>• {u.especializacao}</div>
                    </td>
                    <td className={styles.email}>{u.email}</td>
                    <td>
                      <div className={styles.badges}>
                        {u.cargos.map(c => {
                          const style = CARGO_BADGE[c.toUpperCase()] ?? { bg: '#eee', color: '#333' };
                          return (
                            <span key={c} className={styles.cargoBadge} style={{ background: style.bg, color: style.color }}>
                              {c.toUpperCase()}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td>
                      <div className={styles.date}>{u.data}</div>
                      <div className={styles.dateSub}>{u.ultimaEdicao}</div>
                    </td>
                    <td>
                      <div className={styles.acoes}>
                        <button className={styles.iconBtn} onClick={() => openVer(u)} title="Visualizar"><Eye size={16} /></button>
                        <button className={styles.iconBtn} onClick={() => openEditar(u)} title="Editar"><Pencil size={16} /></button>
                        <button className={`${styles.iconBtn} ${styles.danger}`} onClick={() => openExcluir(u)} title="Excluir"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.pagination}>
            <span className={styles.pageInfo}>Mostrando <strong>{usuarios.length}</strong> de <strong>{usuarios.length}</strong> Usuários</span>
            <div className={styles.pageControls}>
              <button className={styles.pageArrow} disabled><ChevronLeft size={16} /></button>
              <button className={`${styles.pageNum} ${styles.pageActive}`}>1</button>
              <button className={styles.pageArrow} disabled><ChevronRight size={16} /></button>
            </div>
          </div>
        </>
      )}

      {/* ── REGISTROS ── */}
      {view === 'registros' && (
        <>
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>Registros</h1>
            <button className={styles.btnBack} onClick={() => setView('lista')}>
              <ArrowLeft size={16} /> Voltar aos Usuários
            </button>
          </div>

          <div className={styles.logList}>
            {mockLogs.map(log => (
              <div key={log.id} className={styles.logItem}>
                <div className={styles.logDate}>
                  <span className={styles.logDay}>{log.dia}</span>
                  <span className={styles.logHour}>{log.hora}</span>
                </div>
                <div className={styles.logDivider} />
                <div className={styles.logContent}>
                  <div className={styles.logDesc}>{log.descricao}</div>
                  <div className={styles.logSub}>Usuário Afetado: {log.usuarioAfetado}</div>
                </div>
                <span className={styles.logBadge} style={{ background: BADGE_COLORS[log.tipo] }}>
                  {log.tipo}
                </span>
                <div className={styles.logExecutor}>
                  <span className={styles.logExecutorLabel}>Executor</span>
                  <span className={styles.logExecutorName}>{log.executor}</span>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.pagination}>
            <span className={styles.pageInfo}>Mostrando <strong>{mockLogs.length}</strong> de <strong>{mockLogs.length}</strong> Logs</span>
            <div className={styles.pageControls}>
              <button className={styles.pageArrow} disabled><ChevronLeft size={16} /></button>
              <button className={`${styles.pageNum} ${styles.pageActive}`}>1</button>
              <button className={styles.pageArrow} disabled><ChevronRight size={16} /></button>
            </div>
          </div>
        </>
      )}

      {/* ── MODAL NOVO ── */}
      {modalType === 'novo' && (
        <Modal title="Novo Usuário" onClose={closeModal}>
          <FotoUpload foto={formFoto} onChange={setFormFoto} />
          <FormFields
            nome={formNome} setNome={setFormNome}
            email={formEmail} setEmail={setFormEmail}
            cargos={formCargos} setCargos={setFormCargos}
            espec={formEspec} setEspec={setFormEspec}
          />
          <div className={styles.infoBox}>
            <Info size={16} className={styles.infoIcon} />
            <p>O novo usuário receberá um convite por e-mail para definir sua senha de acesso.</p>
          </div>
          <div className={styles.modalFooter}>
            <button className={styles.btnCancel} onClick={closeModal}>Cancelar</button>
            <button className={styles.btnPrimary} onClick={salvarNovo}>
              <Plus size={16} /> Salvar
            </button>
          </div>
        </Modal>
      )}

      {/* ── MODAL VER ── */}
      {modalType === 'ver' && selectedUser && (
        <Modal title="Visualizar Usuário" onClose={closeModal}>
          <FotoUpload foto={selectedUser.foto} readOnly />
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Nome Completo</label>
            <div className={styles.fieldReadonly}>{selectedUser.nome}</div>
          </div>
          <div className={styles.fieldRow}>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>E-mail</label>
              <div className={styles.fieldReadonly}>{selectedUser.email}</div>
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Cargo</label>
              <CargoSelect value={selectedUser.cargos} onChange={() => {}} readOnly />
            </div>
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Especialização</label>
            <div className={styles.fieldReadonly}>{selectedUser.especializacao}</div>
          </div>
        </Modal>
      )}

      {/* ── MODAL EDITAR ── */}
      {modalType === 'editar' && selectedUser && (
        <Modal title="Editar Usuário" onClose={closeModal}>
          <FotoUpload foto={formFoto} onChange={setFormFoto} />
          <FormFields
            nome={formNome} setNome={setFormNome}
            email={formEmail} setEmail={setFormEmail}
            cargos={formCargos} setCargos={setFormCargos}
            espec={formEspec} setEspec={setFormEspec}
          />
          <div className={styles.modalFooter}>
            <button className={styles.btnCancel} onClick={closeModal}>Cancelar</button>
            <button className={styles.btnPrimary} onClick={salvarEdicao}>
              <Plus size={16} /> Salvar
            </button>
          </div>
        </Modal>
      )}

      {/* ── MODAL EXCLUIR ── */}
      {modalType === 'excluir' && selectedUser && (
        <Modal title="Excluir Usuário" onClose={closeModal} width={420}>
          <p className={styles.deleteText}>
            Tem certeza que deseja excluir o usuário <strong>{selectedUser.nome}</strong>?
            Esta ação não pode ser desfeita.
          </p>
          <div className={styles.modalFooter}>
            <button className={styles.btnCancel} onClick={closeModal}>Cancelar</button>
            <button className={styles.btnDanger} onClick={confirmarExclusao}>Confirmar</button>
          </div>
        </Modal>
      )}

    </div>
  );
}

/* ── Form fields reutilizável ── */
interface FormFieldsProps {
  nome: string; setNome: (v: string) => void;
  email: string; setEmail: (v: string) => void;
  cargos: Cargo[]; setCargos: (v: Cargo[]) => void;
  espec: string; setEspec: (v: string) => void;
}

function FormFields({ nome, setNome, email, setEmail, cargos, setCargos, espec, setEspec }: FormFieldsProps) {
  return (
    <>
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>Nome Completo</label>
        <input className={styles.fieldInput} value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Rodrigo Pereira Silva" />
      </div>
      <div className={styles.fieldRow}>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>E-mail</label>
          <input className={styles.fieldInput} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="exemplo@lexconsult.com" />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Cargo</label>
          <CargoSelect value={cargos} onChange={setCargos} />
        </div>
      </div>
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>Especialização</label>
        <input className={styles.fieldInput} value={espec} onChange={e => setEspec(e.target.value)} placeholder="Ex: Direito Processual Civil, Tributário, etc." />
      </div>
    </>
  );
}
