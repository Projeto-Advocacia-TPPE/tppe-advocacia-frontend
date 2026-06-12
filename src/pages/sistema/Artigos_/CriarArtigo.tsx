import { useState, useRef, useEffect, useCallback } from 'react';
import {
  ArrowLeft, Bold, Italic, Underline, List, ListOrdered,
  AlignLeft, AlignCenter, Quote, Link, Image as ImageIcon,
  Code, Save, Eye, ChevronDown
} from 'lucide-react';
import VisualizarArtigo from './VisualizarArtigo';
import styles from './CriarArtigo.module.css';

/* ─── Types ─── */
export type Status = 'RASCUNHO' | 'PUBLICADO';
export interface Artigo {
  id: number;
  titulo: string;
  autor: string;
  categoria?: string;
  status: Status;
  resumo?: string;
  data: string;
  ultimaEdicao?: string;
  imagem?: string;
  conteudo?: string;
}

const CATEGORIAS = [
  'Jurisprudência',
  'Direito Digital',
  'Direito de Família',
  'Direito Tributário',
  'Direito Empresarial',
  'Direito Penal',
];

interface Props {
  onVoltar: () => void;
  onSalvar: (artigo: Omit<Artigo, 'id' | 'data' | 'ultimaEdicao'>) => void;
  inicial?: Partial<Artigo>;
  modo?: 'criar' | 'editar';
}

export default function CriarArtigo({ onVoltar, onSalvar, inicial, modo = 'criar' }: Props) {
  const [titulo, setTitulo]           = useState(inicial?.titulo   ?? '');
  const [categoria, setCategoria]     = useState(inicial?.categoria ?? CATEGORIAS[0]);
  const [status, setStatus]           = useState<Status>(inicial?.status ?? 'RASCUNHO');
  const [resumo, setResumo]           = useState(inicial?.resumo   ?? '');
  const [capa, setCapa]               = useState<string | undefined>(inicial?.imagem);
  const [alterado, setAlterado]       = useState(false);
  const [catOpen, setCatOpen]         = useState(false);
  const [wordCount, setWordCount]     = useState(0);
  const [preview, setPreview]         = useState(false);

  const [capaPos, setCapaPos]         = useState({ x: 50, y: 50 }); // percent
  const dragRef   = useRef<{ startX: number; startY: number; posX: number; posY: number } | null>(null);

  const editorRef  = useRef<HTMLDivElement>(null);
  const capaRef    = useRef<HTMLInputElement>(null);
  const capaImgRef = useRef<HTMLDivElement>(null);

  /* word count */
  const updateWordCount = useCallback(() => {
    const text = editorRef.current?.innerText ?? '';
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    setWordCount(words);
    setAlterado(true);
  }, []);

  /* toolbar commands */
  function cmd(command: string, value?: string) {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    updateWordCount();
  }

  function handleCapaChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => { setCapa(ev.target?.result as string); setAlterado(true); };
    reader.readAsDataURL(file);
  }

  function handleCapaMouseDown(e: React.MouseEvent) {
    e.preventDefault();
    dragRef.current = { startX: e.clientX, startY: e.clientY, posX: capaPos.x, posY: capaPos.y };
    window.addEventListener('mousemove', handleCapaDrag);
    window.addEventListener('mouseup', handleCapaDragEnd);
  }

  function handleCapaDrag(e: MouseEvent) {
    if (!dragRef.current || !capaImgRef.current) return;
    const container = capaImgRef.current.getBoundingClientRect();
    const dx = ((e.clientX - dragRef.current.startX) / container.width)  * -100;
    const dy = ((e.clientY - dragRef.current.startY) / container.height) * -100;
    setCapaPos({
      x: Math.min(100, Math.max(0, dragRef.current.posX + dx)),
      y: Math.min(100, Math.max(0, dragRef.current.posY + dy)),
    });
  }

  function handleCapaDragEnd() {
    dragRef.current = null;
    window.removeEventListener('mousemove', handleCapaDrag);
    window.removeEventListener('mouseup', handleCapaDragEnd);
  }

  function handleSalvar() {
    onSalvar({
      titulo,
      autor: '',
      categoria,
      status,
      resumo,
      imagem: capa,
      conteudo: editorRef.current?.innerHTML ?? '',
    });
    setAlterado(false);
  }

  /* placeholder behaviour */
  const PLACEHOLDER = 'Comece escrevendo o seu artigo aqui...';
  function handleEditorFocus() {
    if (editorRef.current?.innerText === PLACEHOLDER) {
      editorRef.current.innerText = '';
      editorRef.current.classList.remove(styles.editorPlaceholder);
    }
  }
  function handleEditorBlur() {
    if (!editorRef.current?.innerText.trim()) {
      editorRef.current!.innerText = PLACEHOLDER;
      editorRef.current!.classList.add(styles.editorPlaceholder);
    }
  }
  useEffect(() => {
    if (editorRef.current && !inicial?.conteudo) {
      editorRef.current.innerText = PLACEHOLDER;
      editorRef.current.classList.add(styles.editorPlaceholder);
    } else if (editorRef.current && inicial?.conteudo) {
      editorRef.current.innerHTML = inicial.conteudo;
    }
  }, []);

  /* mark dirty on title / resumo changes */
  useEffect(() => { if (titulo || resumo) setAlterado(true); }, [titulo, resumo]);

  /* ── Build artigo snapshot for preview ── */
  function buildSnapshot() {
    return {
      id: 0,
      titulo,
      autor: inicial?.autor ?? '',
      categoria,
      status,
      resumo,
      imagem: capa,
      imagemPos: capaPos,
      data: inicial?.data ?? new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }),
      ultimaEdicao: 'Agora',
      conteudo: editorRef.current?.innerHTML ?? '',
    };
  }

  if (preview) {
    return (
      <VisualizarArtigo
        artigo={buildSnapshot()}
        onVoltar={() => setPreview(false)}
        onPublicar={() => { setStatus('PUBLICADO'); setPreview(false); }}
      />
    );
  }

  return (
    <div className={styles.page}>

      {/* ── Top bar ── */}
      <div className={styles.topBar}>
        <button className={styles.btnVoltar} onClick={onVoltar}>
          <ArrowLeft size={16} /> Voltar
        </button>
        <h1 className={styles.pageTitle}>
          {modo === 'editar' ? 'Editar Artigo' : 'Criar Artigo'}
        </h1>
      </div>

      {/* ── Meta row ── */}
      <div className={styles.metaRow}>
        {/* Left: título + categoria + status */}
        <div className={styles.metaLeft}>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>TÍTULO DO ARTIGO</label>
            <input
              className={styles.fieldInput}
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
              placeholder="Insira o título impactante do artigo..."
            />
          </div>
          <div className={styles.metaControls}>
            {/* Categoria dropdown */}
            <div className={styles.selectWrap}>
              <button
                className={styles.selectBtn}
                onClick={() => setCatOpen(o => !o)}
                type="button"
              >
                {categoria} <ChevronDown size={14} />
              </button>
              {catOpen && (
                <ul className={styles.selectMenu}>
                  {CATEGORIAS.map(c => (
                    <li key={c}
                      className={`${styles.selectOption} ${c === categoria ? styles.selectOptionActive : ''}`}
                      onClick={() => { setCategoria(c); setCatOpen(false); setAlterado(true); }}
                    >
                      {c}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Status toggle */}
            <button
              className={`${styles.toggleBtn} ${status === 'PUBLICADO' ? styles.toggleOn : ''}`}
              onClick={() => { setStatus(s => s === 'PUBLICADO' ? 'RASCUNHO' : 'PUBLICADO'); setAlterado(true); }}
              type="button"
            >
              <span className={styles.toggleThumb} />
              <span className={styles.toggleLabel}>
                {status === 'PUBLICADO' ? 'Publicado' : 'Rascunho'}
              </span>
            </button>
          </div>
        </div>

        {/* Right: resumo */}
        <div className={styles.metaRight}>
          <label className={styles.fieldLabel}>RESUMO DO ARTIGO</label>
          <textarea
            className={styles.fieldTextarea}
            value={resumo}
            onChange={e => setResumo(e.target.value)}
            placeholder="Insira o resumo que será mostrado na Landing Page..."
          />
        </div>
      </div>

      {/* ── Capa upload ── */}
      {!capa ? (
        <div className={styles.capaArea} onClick={() => capaRef.current?.click()}>
          <div className={styles.capaEmpty}>
            <ImageIcon size={32} strokeWidth={1.5} className={styles.capaIcon} />
            <p className={styles.capaTitle}>Adicione uma capa para o Artigo.</p>
            <p className={styles.capaSubtitle}>Tamanho indicado: 1375px por 520px</p>
            <button className={styles.btnCarregar} type="button"
              onClick={e => { e.stopPropagation(); capaRef.current?.click(); }}>
              Carregar Imagem
            </button>
          </div>
          <input ref={capaRef} type="file" accept="image/*"
            style={{ display: 'none' }} onChange={handleCapaChange} />
        </div>
      ) : (
        <div className={styles.capaPreview} ref={capaImgRef}>
          <img
            src={capa}
            alt="Capa"
            className={styles.capaImg}
            style={{ objectPosition: `${capaPos.x}% ${capaPos.y}%` }}
            onMouseDown={handleCapaMouseDown}
            draggable={false}
          />
          <div className={styles.capaHint}>
            <span className={styles.capaHintIcon}>↕ ↔</span> Arraste para reposicionar
          </div>
          <div className={styles.capaActions}>
            <button className={styles.capaActionBtn} type="button"
              onClick={() => capaRef.current?.click()} title="Trocar imagem">
              Trocar
            </button>
            <button className={styles.capaActionBtn + ' ' + styles.capaActionDanger} type="button"
              onClick={() => { setCapa(undefined); setCapaPos({ x: 50, y: 50 }); setAlterado(true); }} title="Remover imagem">
              Remover
            </button>
          </div>
          <input ref={capaRef} type="file" accept="image/*"
            style={{ display: 'none' }} onChange={handleCapaChange} />
        </div>
      )}

      {/* ── Editor ── */}
      <div className={styles.editorCard}>
        {/* Toolbar */}
        <div className={styles.toolbar}>
          {/* Headings */}
          <div className={styles.toolbarGroup}>
            <ToolBtn title="Parágrafo" onClick={() => cmd('formatBlock', 'p')}>
              <span className={styles.headingBtn}>¶</span>
            </ToolBtn>
            <ToolBtn title="Título (H1)" onClick={() => cmd('formatBlock', 'h1')}>
              <span className={styles.headingBtn}>H1</span>
            </ToolBtn>
            <ToolBtn title="Subtítulo (H2)" onClick={() => cmd('formatBlock', 'h2')}>
              <span className={styles.headingBtn}>H2</span>
            </ToolBtn>
            <ToolBtn title="Subtítulo menor (H3)" onClick={() => cmd('formatBlock', 'h3')}>
              <span className={styles.headingBtn}>H3</span>
            </ToolBtn>
          </div>
          <div className={styles.toolbarDivider} />
          <div className={styles.toolbarGroup}>
            <ToolBtn title="Negrito" onClick={() => cmd('bold')}><Bold size={15} /></ToolBtn>
            <ToolBtn title="Itálico" onClick={() => cmd('italic')}><Italic size={15} /></ToolBtn>
            <ToolBtn title="Sublinhado" onClick={() => cmd('underline')}><Underline size={15} /></ToolBtn>
          </div>
          <div className={styles.toolbarDivider} />
          <div className={styles.toolbarGroup}>
            <ToolBtn title="Lista" onClick={() => cmd('insertUnorderedList')}><List size={15} /></ToolBtn>
            <ToolBtn title="Lista numerada" onClick={() => cmd('insertOrderedList')}><ListOrdered size={15} /></ToolBtn>
          </div>
          <div className={styles.toolbarDivider} />
          <div className={styles.toolbarGroup}>
            <ToolBtn title="Alinhar à esquerda" onClick={() => cmd('justifyLeft')}><AlignLeft size={15} /></ToolBtn>
            <ToolBtn title="Centralizar" onClick={() => cmd('justifyCenter')}><AlignCenter size={15} /></ToolBtn>
            <ToolBtn title="Citação" onClick={() => cmd('formatBlock', 'blockquote')}><Quote size={15} /></ToolBtn>
          </div>
          <div className={styles.toolbarDivider} />
          <div className={styles.toolbarGroup}>
            <ToolBtn title="Link" onClick={() => {
              const url = window.prompt('URL do link:');
              if (url) cmd('createLink', url);
            }}><Link size={15} /></ToolBtn>
            <ToolBtn title="Bloco de código" onClick={() => cmd('formatBlock', 'pre')}><Code size={15} /></ToolBtn>
          </div>
          <span className={styles.wordCount}>{wordCount} PALAVRAS</span>
        </div>

        {/* Contenteditable area */}
        <div
          ref={editorRef}
          className={styles.editor}
          contentEditable
          suppressContentEditableWarning
          onInput={updateWordCount}
          onFocus={handleEditorFocus}
          onBlur={handleEditorBlur}
        />
      </div>

      {/* ── Bottom action bar ── */}
      <div className={styles.actionBar}>
        <div className={styles.actionLeft}>
          {alterado && (
            <span className={styles.unsaved}>
              <span className={styles.dot} /> Alterações não salvas detectadas...
            </span>
          )}
        </div>
        <div className={styles.actionRight}>
          <button className={styles.btnPreview} type="button" onClick={() => setPreview(true)}>
            <Eye size={15} /> Visualizar Preview
          </button>
          <button className={styles.btnSalvar} type="button" onClick={handleSalvar}>
            <Save size={15} /> Salvar Artigo
          </button>
        </div>
      </div>
    </div>
  );
}

function ToolBtn({ children, onClick, title }: { children: React.ReactNode; onClick: () => void; title: string }) {
  return (
    <button className={styles.toolBtn} onClick={onClick} title={title} type="button">
      {children}
    </button>
  );
}