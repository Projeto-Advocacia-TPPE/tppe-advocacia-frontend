import { useState, useEffect, useMemo } from 'react';
import { Plus, Eye, Pencil, EyeOff, Globe, ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import CriarArtigo from './CriarArtigo';
import VisualizarArtigo from './VisualizarArtigo';
import {
  listarArtigos,
  buscarArtigo,
  criarArtigo,
  atualizarArtigo,
  listItemToArtigo,
  detailToArtigo,
  buildCreatePayload,
  buildUpdatePayload,
} from './artigosService';
import type { Artigo } from './types';
import styles from '../Usuarios/Usuarios.module.css';
import filterStyles from './ArtigosFilter.module.css';

type View = 'lista' | 'criar' | 'editar' | 'ver';

const STATUS_BADGE: Record<string, { bg: string; color: string }> = {
  'RASCUNHO':  { bg: '#e8eaf6', color: '#3949ab' },
  'PUBLICADO': { bg: '#e8f5e9', color: '#2e7d32' },
};

const CATEGORIAS = [
  'Jurisprudência',
  'Direito Digital',
  'Direito de Família',
  'Direito Tributário',
  'Direito Empresarial',
  'Direito Penal',
];

export default function Artigos() {
  const [view, setView]             = useState<View>('lista');
  const [artigos, setArtigos]       = useState<Artigo[]>([]);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [erro, setErro]             = useState<string | null>(null);
  const [selected, setSelected]     = useState<(Artigo & { conteudo?: string }) | null>(null);
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]           = useState(0);
  const LIMIT = 20;

  /* ── Filtros ── */
  const [filtroAutor,     setFiltroAutor]     = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroStatus,    setFiltroStatus]    = useState('');
  const [filtroDataDe,    setFiltroDataDe]    = useState('');
  const [filtroDataAte,   setFiltroDataAte]   = useState('');

  const filtrosAtivos = filtroAutor || filtroCategoria || filtroStatus || filtroDataDe || filtroDataAte;

  function limparFiltros() {
    setFiltroAutor('');
    setFiltroCategoria('');
    setFiltroStatus('');
    setFiltroDataDe('');
    setFiltroDataAte('');
  }

  /* ── Artigos filtrados (client-side) ── */
  const artigosFiltrados = useMemo(() => {
    return artigos.filter(a => {
      if (filtroAutor && !a.autor.toLowerCase().includes(filtroAutor.toLowerCase()) && !a.titulo.toLowerCase().includes(filtroAutor.toLowerCase())) return false;
      if (filtroCategoria && a.categoria !== filtroCategoria) return false;
      if (filtroStatus && a.status !== filtroStatus) return false;
      if (filtroDataDe || filtroDataAte) {
        const dataArtigo = new Date(a.data).getTime();
        if (filtroDataDe && dataArtigo < new Date(filtroDataDe).getTime()) return false;
        if (filtroDataAte && dataArtigo > new Date(filtroDataAte + 'T23:59:59').getTime()) return false;
      }
      return true;
    });
  }, [artigos, filtroAutor, filtroCategoria, filtroStatus, filtroDataDe, filtroDataAte]);

  /* ── Carregar lista ── */
  async function fetchArtigos(p = 1) {
    setLoading(true);
    setErro(null);
    try {
      const res = await listarArtigos(p, LIMIT);
      setArtigos((res.data ?? []).map(listItemToArtigo));
      setTotal(res.meta?.total ?? 0);
      setTotalPages(res.meta?.pages ?? 1);
      setPage(p);
    } catch (e: any) {
      setErro(e.message ?? 'Erro ao carregar artigos.');
      setArtigos([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchArtigos(); }, []);

  /* ── Abrir visualizar / editar ── */
  async function openVer(a: Artigo) {
    try {
      const detail = await buscarArtigo(a.id);
      setSelected(detailToArtigo(detail));
      setView('ver');
    } catch (e: any) {
      setErro(e.message ?? 'Não foi possível carregar o artigo.');
    }
  }

  async function openEditar(a: Artigo) {
    try {
      const detail = await buscarArtigo(a.id);
      setSelected(detailToArtigo(detail));
      setView('editar');
    } catch (e: any) {
      setErro(e.message ?? 'Não foi possível carregar o artigo para edição.');
    }
  }

  /* ── Alterar Status (Toggle Rápido) ── */
  async function toggleStatus(a: Artigo) {
    const novoStatus = a.status === 'PUBLICADO' ? 'RASCUNHO' : 'PUBLICADO';
    try {
      const atualizado = await atualizarArtigo(a.id, buildUpdatePayload({ status: novoStatus }));
      setArtigos(prev => prev.map(x => x.id === a.id ? detailToArtigo(atualizado) : x));
    } catch (e: any) {
      setErro(e.message ?? 'Erro ao alterar status.');
    }
  }

  /* ── Salvar novo (Ação Manual) ── */
  async function salvarNovo(dados: Omit<Artigo, 'id' | 'data' | 'ultimaEdicao'> & { conteudo?: string }) {
    setSaving(true);
    try {
      await criarArtigo(buildCreatePayload({
        titulo:    dados.titulo,
        conteudo:  dados.conteudo ?? '',
        categoria: dados.categoria ?? '',
        resumo:    dados.resumo ?? '',
        imagem:    dados.imagem,
        status:    dados.status,
      }));
      setView('lista');
      await fetchArtigos(1);
    } catch (e: any) {
      setErro(e.message ?? 'Erro ao criar artigo.');
    } finally {
      setSaving(false);
    }
  }

  /* ── Salvar edição (Ação Manual) ── */
  async function salvarEdicao(dados: Omit<Artigo, 'id' | 'data' | 'ultimaEdicao'> & { conteudo?: string }) {
    if (!selected) return;
    setSaving(true);
    try {
      await atualizarArtigo(selected.id, buildUpdatePayload({
        titulo:    dados.titulo,
        conteudo:  dados.conteudo ?? '',
        categoria: dados.categoria ?? '',
        resumo:    dados.resumo ?? '',
        imagem:    dados.imagem,
        status:    dados.status,
      }));
      setView('lista');
      await fetchArtigos(page);
    } catch (e: any) {
      setErro(e.message ?? 'Erro ao salvar edição.');
    } finally {
      setSaving(false);
    }
  }

  /* ── Auto salvar (Sem Navegar) ── */
  async function autoSalvarNovo(dados: Omit<Artigo, 'id' | 'data' | 'ultimaEdicao'> & { conteudo?: string }) {
    try {
      const criado = await criarArtigo(buildCreatePayload({
        titulo:    dados.titulo,
        conteudo:  dados.conteudo ?? '',
        categoria: dados.categoria ?? '',
        resumo:    dados.resumo ?? '',
        imagem:    dados.imagem,
        status:    dados.status,
      }));
      
      const artigoFormatado = detailToArtigo(criado);
      setArtigos(prev => [artigoFormatado, ...prev]);
      setTotal(t => t + 1);
      
      // Muda silenciosamente para o modo "editar" para evitar duplicação no próximo autosave
      setSelected(artigoFormatado);
      setView('editar');
    } catch (e: any) {
      console.error("Erro no auto-salvar novo:", e);
    }
  }

  async function autoSalvarEdicao(dados: Omit<Artigo, 'id' | 'data' | 'ultimaEdicao'> & { conteudo?: string }) {
    if (!selected) return;
    try {
      const atualizado = await atualizarArtigo(selected.id, buildUpdatePayload({
        titulo:    dados.titulo,
        conteudo:  dados.conteudo ?? '',
        categoria: dados.categoria ?? '',
        resumo:    dados.resumo ?? '',
        imagem:    dados.imagem,
        status:    dados.status,
      }));
      setArtigos(prev => prev.map(a => a.id === selected.id ? detailToArtigo(atualizado) : a));
    } catch (e: any) {
      console.error("Erro no auto-salvar edição:", e);
    }
  }

  /* ── Views full-page ── */
  if (view === 'criar') {
    return (
      <CriarArtigo 
        onVoltar={() => { setView('lista'); setErro(null); }} 
        onSalvar={salvarNovo} 
        onAutoSalvar={autoSalvarNovo} 
        saving={saving} 
        modo="criar" 
        erro={erro}
        onClearErro={() => setErro(null)}
      />
    );
  }
  if (view === 'editar' && selected) {
    return (
      <CriarArtigo 
        onVoltar={() => { setView('lista'); setErro(null); }} 
        onSalvar={salvarEdicao} 
        onAutoSalvar={autoSalvarEdicao} 
        inicial={selected} 
        saving={saving} 
        modo="editar" 
        erro={erro}
        onClearErro={() => setErro(null)}
      />
    );
  }
  if (view === 'ver' && selected) {
    return <VisualizarArtigo artigo={selected} onVoltar={() => { setView('lista'); setSelected(null); }} />;
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

      {/* ── Filtros ── */}
      <div className={filterStyles.filterBar}>
        <div className={filterStyles.filterField}>
          <Search size={13} className={filterStyles.filterIcon} />
          <input
            className={filterStyles.filterInput}
            placeholder="Buscar por título ou autor..."
            value={filtroAutor}
            onChange={e => setFiltroAutor(e.target.value)}
          />
        </div>

        <select
          className={filterStyles.filterSelect}
          value={filtroCategoria}
          onChange={e => setFiltroCategoria(e.target.value)}
        >
          <option value="">Todas as categorias</option>
          {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <select
          className={filterStyles.filterSelect}
          value={filtroStatus}
          onChange={e => setFiltroStatus(e.target.value)}
        >
          <option value="">Todos os status</option>
          <option value="PUBLICADO">Publicado</option>
          <option value="RASCUNHO">Rascunho</option>
        </select>

        <div className={filterStyles.filterDateWrap}>
          <label className={filterStyles.filterDateLabel}>De</label>
          <input
            type="date"
            className={filterStyles.filterDate}
            value={filtroDataDe}
            onChange={e => setFiltroDataDe(e.target.value)}
          />
        </div>

        <div className={filterStyles.filterDateWrap}>
          <label className={filterStyles.filterDateLabel}>Até</label>
          <input
            type="date"
            className={filterStyles.filterDate}
            value={filtroDataAte}
            onChange={e => setFiltroDataAte(e.target.value)}
          />
        </div>

        {filtrosAtivos && (
          <button className={filterStyles.filterClear} onClick={limparFiltros} type="button">
            <X size={13} /> Limpar
          </button>
        )}
      </div>

      {filtrosAtivos && (
        <p className={filterStyles.filterCount}>
          {artigosFiltrados.length} resultado{artigosFiltrados.length !== 1 ? 's' : ''} encontrado{artigosFiltrados.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* Banner de erro */}
      {erro && (
        <div style={{
          background: '#fff0f0', border: '1px solid #ffcccc', borderRadius: 8,
          padding: '12px 16px', color: '#c0392b', fontSize: '.88rem', marginBottom: 16,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          {erro}
          <button onClick={() => setErro(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c0392b', fontWeight: 700 }}>✕</button>
        </div>
      )}

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Título</th>
              <th>Autor / Categoria</th>
              <th>Status</th>
              <th>Data</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j}>
                      <div style={{ height: 14, borderRadius: 4, background: '#f0f0f0', width: j === 0 ? '75%' : '55%' }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : artigosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', color: 'var(--gray)', padding: '40px 0', fontSize: '.9rem' }}>
                  {filtrosAtivos ? 'Nenhum artigo corresponde aos filtros.' : 'Nenhum artigo encontrado.'}
                </td>
              </tr>
            ) : (
              artigosFiltrados.map(a => (
                <tr key={a.id}>
                  <td>
                    <div className={styles.userName}>{a.titulo}</div>
                    <div className={styles.userSub}>• {a.categoria || '—'}</div>
                  </td>
                  <td className={styles.email}>{a.autor || '—'}</td>
                  <td>
                    <div className={styles.badges}>
                      <span className={styles.cargoBadge} style={{
                        background: STATUS_BADGE[a.status]?.bg ?? '#eee',
                        color:      STATUS_BADGE[a.status]?.color ?? '#333',
                      }}>
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
                      <button
                        className={styles.iconBtn}
                        onClick={() => toggleStatus(a)}
                        title={a.status === 'PUBLICADO' ? 'Despublicar' : 'Publicar'}
                      >
                        {a.status === 'PUBLICADO' ? <EyeOff size={16} /> : <Globe size={16} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      <div className={styles.pagination}>
        <span className={styles.pageInfo}>
          Mostrando <strong>{artigosFiltrados.length}</strong> de <strong>{total}</strong> Artigos
        </span>
        <div className={styles.pageControls}>
          <button className={styles.pageArrow} disabled={page <= 1} onClick={() => fetchArtigos(page - 1)}>
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p}
              className={`${styles.pageNum} ${p === page ? styles.pageActive : ''}`}
              onClick={() => fetchArtigos(p)}
            >{p}</button>
          ))}
          <button className={styles.pageArrow} disabled={page >= totalPages} onClick={() => fetchArtigos(page + 1)}>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

    </div>
  );
}