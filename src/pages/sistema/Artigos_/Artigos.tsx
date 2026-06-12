import { useState } from 'react';
import { Plus, Eye, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import Modal from '../../../components/sistema/Modal/Modal';
import CriarArtigo from './CriarArtigo';
import VisualizarArtigo from './VisualizarArtigo';
import { mockArtigos } from './mockData';
import type { Artigo, Status } from './types';
import styles from '../Usuarios/Usuarios.module.css';

type View = 'lista' | 'criar' | 'editar' | 'ver';
type ModalType = 'excluir' | null;

const STATUS_BADGE: Record<string, { bg: string; color: string }> = {
  'RASCUNHO':   { bg: '#e8eaf6', color: '#3949ab' },
  'PUBLICADO':  { bg: '#e8f5e9', color: '#2e7d32' },
};

export default function Artigos() {
  const [view, setView]           = useState<View>('lista');
  const [artigos, setArtigos]     = useState<Artigo[]>(mockArtigos);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selected, setSelected]   = useState<Artigo | null>(null);

  /* ── open helpers ── */
  function openVer(a: Artigo)     { setSelected(a); setView('ver'); }
  function openEditar(a: Artigo)  { setSelected(a); setView('editar'); }
  function openExcluir(a: Artigo) { setSelected(a); setModalType('excluir'); }
  function closeModal()           { setModalType(null); setSelected(null); }

  /* ── save from editor ── */
  function salvarNovo(dados: Omit<Artigo, 'id' | 'data' | 'ultimaEdicao'>) {
    const novo: Artigo = {
      id: Date.now(),
      ...dados,
      data: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
      ultimaEdicao: 'Recém criado',
    };
    setArtigos(a => [novo, ...a]);
    setView('lista');
  }

  function salvarEdicao(dados: Omit<Artigo, 'id' | 'data' | 'ultimaEdicao'>) {
    if (!selected) return;
    setArtigos(a => a.map(x =>
      x.id === selected.id ? { ...x, ...dados, ultimaEdicao: 'Editado agora' } : x
    ));
    setView('lista');
  }

  function confirmarExclusao() {
    if (!selected) return;
    setArtigos(a => a.filter(x => x.id !== selected.id));
    closeModal();
  }

  /* ── Full-page editor views ── */
  if (view === 'criar') {
    return (
      <CriarArtigo
        onVoltar={() => setView('lista')}
        onSalvar={salvarNovo}
        modo="criar"
      />
    );
  }

  if (view === 'editar' && selected) {
    return (
      <CriarArtigo
        onVoltar={() => setView('lista')}
        onSalvar={salvarEdicao}
        inicial={selected}
        modo="editar"
      />
    );
  }

  if (view === 'ver' && selected) {
    return (
      <VisualizarArtigo
        artigo={selected}
        onVoltar={() => { setView('lista'); setSelected(null); }}
      />
    );
  }

  /* ── LISTA ── */
  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Gerenciar Artigos</h1>
        <div className={styles.headerActions}>
          <button className={styles.btnPrimary} onClick={() => setView('criar')}>
            <Plus size={16} /> Novo Artigo
          </button>
        </div>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Título</th>
              <th>Autor</th>
              <th>Status</th>
              <th>Data</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {artigos.map(a => (
              <tr key={a.id}>
                <td>
                  <div className={styles.userName}>{a.titulo}</div>
                  <div className={styles.userSub}>• {a.categoria || ''}</div>
                </td>
                <td className={styles.email}>{a.autor}</td>
                <td>
                  <div className={styles.badges}>
                    <span
                      className={styles.cargoBadge}
                      style={{
                        background: STATUS_BADGE[a.status].bg,
                        color: STATUS_BADGE[a.status].color,
                      }}
                    >
                      {a.status}
                    </span>
                  </div>
                </td>
                <td>
                  <div className={styles.date}>{a.data}</div>
                  <div className={styles.dateSub}>{a.ultimaEdicao}</div>
                </td>
                <td>
                  <div className={styles.acoes}>
                    <button className={styles.iconBtn} onClick={() => openVer(a)} title="Visualizar">
                      <Eye size={16} />
                    </button>
                    <button className={styles.iconBtn} onClick={() => openEditar(a)} title="Editar">
                      <Pencil size={16} />
                    </button>
                    <button className={`${styles.iconBtn} ${styles.danger}`} onClick={() => openExcluir(a)} title="Excluir">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.pagination}>
        <span className={styles.pageInfo}>
          Mostrando <strong>{artigos.length}</strong> de <strong>{artigos.length}</strong> Artigos
        </span>
        <div className={styles.pageControls}>
          <button className={styles.pageArrow} disabled><ChevronLeft size={16} /></button>
          <button className={`${styles.pageNum} ${styles.pageActive}`}>1</button>
          <button className={styles.pageArrow} disabled><ChevronRight size={16} /></button>
        </div>
      </div>


      {/* ── MODAL EXCLUIR ── */}
      {modalType === 'excluir' && selected && (
        <Modal title="Excluir Artigo" onClose={closeModal} width={420}>
          <p className={styles.deleteText}>
            Tem certeza que deseja excluir o artigo <strong>{selected.titulo}</strong>? Esta ação não pode ser desfeita.
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