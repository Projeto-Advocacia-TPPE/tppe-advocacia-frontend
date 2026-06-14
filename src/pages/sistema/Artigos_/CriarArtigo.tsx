import { useState, useRef, useEffect, useCallback } from 'react';
import {
  ArrowLeft, Bold, Italic, Underline, List, ListOrdered,
  AlignLeft, AlignCenter, Quote, Link, Image as ImageIcon,
  Code, Save, Eye, ChevronDown
} from 'lucide-react';
import VisualizarArtigo from './VisualizarArtigo';
import { uploadMedia } from '../../../services/officeConfigService';
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
  saving?: boolean;
  modo?: 'criar' | 'editar';
}

export default function CriarArtigo({ onVoltar, onSalvar, inicial, saving = false, modo = 'criar' }: Props) {
  const [titulo, setTitulo]             = useState(inicial?.titulo   ?? '');
  const [categoria, setCategoria]       = useState(inicial?.categoria ?? CATEGORIAS[0]);
  const [status, setStatus]             = useState<Status>(inicial?.status ?? 'RASCUNHO');
  const [resumo, setResumo]             = useState(inicial?.resumo   ?? '');
  const [capa, setCapa]                 = useState<string | undefined>(inicial?.imagem);
  const [catOpen, setCatOpen]           = useState(false);
  const [wordCount, setWordCount]       = useState(0);
  const [preview, setPreview]           = useState(false);
  const [autoSaveMsg, setAutoSaveMsg]   = useState<'saving' | 'saved' | null>(null);

  // conteudo em ref para sempre ter o valor mais recente sem problema de closure
  const conteudoRef = useRef<string>(inicial?.conteudo ?? '');

  const [capaPos, setCapaPos] = useState({ x: 50, y: 50 });
  const dragRef    = useRef<{ startX: number; startY: number; posX: number; posY: number } | null>(null);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const editorRef  = useRef<HTMLDivElement>(null);
  const capaRef    = useRef<HTMLInputElement>(null);
  const capaImgRef = useRef<HTMLDivElement>(null);

  /* ── Restaura o editor sempre que preview fecha ── */
  useEffect(() => {
    if (preview) return; // editor não existe enquanto preview está aberto
    if (!editorRef.current) return;
    const html = conteudoRef.current;
    if (html) {
      editorRef.current.innerHTML = html;
      editorRef.current.classList.remove(styles.editorPlaceholder);
    } else {
      editorRef.current.innerText = PLACEHOLDER;
      editorRef.current.classList.add(styles.editorPlaceholder);
    }
  }, [preview]); // roda quando preview muda (abre/fecha)

  /* ── Autosave com debounce de 2s ── */
  function scheduleAutoSave() {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    setAutoSaveMsg('saving');
    autoSaveTimer.current = setTimeout(() => {
      onSalvar({
        titulo,
        autor: inicial?.autor ?? '',
        categoria,
        status,
        resumo,
        imagem: capa,
        conteudo: conteudoRef.current,
      });
      setAutoSaveMsg('saved');
      setTimeout(() => setAutoSaveMsg(null), 2000);
    }, 2000);
  }

  /* ── Word count + salva ref + dispara autosave ── */
  const updateWordCount = useCallback(() => {
    const html = editorRef.current?.innerHTML ?? '';
    const text = editorRef.current?.innerText ?? '';
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    conteudoRef.current = html; // sempre atualiza a ref
    setWordCount(words);
    scheduleAutoSave();
  }, [titulo, categoria, status, resumo, capa, inicial?.autor, onSalvar]);

  /* ── Toolbar commands ── */
  function cmd(command: string, value?: string) {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    updateWordCount();
  }

  /* ── Capa ── */
  async function handleCapaChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadMedia(file);
      setCapa(url);
      scheduleAutoSave();
    } catch {
      // silently keep existing capa
    }
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

  /* ── Salvar manual ── */
  function handleSalvar() {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    onSalvar({
      titulo,
      autor: inicial?.autor ?? '',
      categoria,
      status,
      resumo,
      imagem: capa,
      conteudo: conteudoRef.current,
    });
  }

  /* ── Placeholder ── */
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

  /* ── Autosave ao mudar título, resumo, categoria, status ── */
  useEffect(() => {
    if (!titulo && !resumo) return;
    scheduleAutoSave();
  }, [titulo, resumo, categoria, status]);

  /* ── Snapshot para preview ── */
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
      conteudo: conteudoRef.current,
    };
  }

  /* ── Preview ── */
  if (preview) {
    return (
      <VisualizarArtigo
        artigo={buildSnapshot()}
        onVoltar={() => setPreview(false)}
        onPublicar={() => {
          onSalvar({
            titulo,
            autor: inicial?.autor ?? '',
            categoria,
            status: 'PUBLICADO',
            resumo,
            imagem: capa,
            conteudo: conteudoRef.current,
          });
        }}
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
            <div className={styles.selectWrap}>
              <button className={styles.selectBtn} onClick={() => setCatOpen(o => !o)} type="button">
                {categoria} <ChevronDown size={14} />
              </button>
              {catOpen && (
                <ul className={styles.selectMenu}>
                  {CATEGORIAS.map(c => (
                    <li key={c}
                      className={`${styles.selectOption} ${c === categoria ? styles.selectOptionActive : ''}`}
                      onClick={() => { setCategoria(c); setCatOpen(false); }}
                    >
                      {c}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <button
              className={`${styles.toggleBtn} ${status === 'PUBLICADO' ? styles.toggleOn : ''}`}
              onClick={() => setStatus(s => s === 'PUBLICADO' ? 'RASCUNHO' : 'PUBLICADO')}
              type="button"
            >
              <span className={styles.toggleThumb} />
              <span className={styles.toggleLabel}>
                {status === 'PUBLICADO' ? 'Publicado' : 'Rascunho'}
              </span>
            </button>
          </div>
        </div>

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
          <input ref={capaRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleCapaChange} />
        </div>
      ) : (
        <div className={styles.capaPreview} ref={capaImgRef}>
          <img
            src={capa} alt="Capa" className={styles.capaImg}
            style={{ objectPosition: `${capaPos.x}% ${capaPos.y}%` }}
            onMouseDown={handleCapaMouseDown} draggable={false}
          />
          <div className={styles.capaHint}>
            <span className={styles.capaHintIcon}>↕ ↔</span> Arraste para reposicionar
          </div>
          <div className={styles.capaActions}>
            <button className={styles.capaActionBtn} type="button" onClick={() => capaRef.current?.click()}>Trocar</button>
            <button className={`${styles.capaActionBtn} ${styles.capaActionDanger}`} type="button"
              onClick={() => { setCapa(undefined); setCapaPos({ x: 50, y: 50 }); }}>
              Remover
            </button>
          </div>
          <input ref={capaRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleCapaChange} />
        </div>
      )}

      {/* ── Editor ── */}
      <div className={styles.editorCard}>
        <div className={styles.toolbar}>
          <div className={styles.toolbarGroup}>
            <ToolBtn title="Parágrafo" onClick={() => cmd('formatBlock', 'p')}><span className={styles.headingBtn}>¶</span></ToolBtn>
            <ToolBtn title="Título (H1)" onClick={() => cmd('formatBlock', 'h1')}><span className={styles.headingBtn}>H1</span></ToolBtn>
            <ToolBtn title="Subtítulo (H2)" onClick={() => cmd('formatBlock', 'h2')}><span className={styles.headingBtn}>H2</span></ToolBtn>
            <ToolBtn title="Subtítulo menor (H3)" onClick={() => cmd('formatBlock', 'h3')}><span className={styles.headingBtn}>H3</span></ToolBtn>
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
          {autoSaveMsg === 'saving' && (
            <span className={styles.unsaved}><span className={styles.dot} /> Salvando automaticamente...</span>
          )}
          {autoSaveMsg === 'saved' && (
            <span className={styles.unsaved} style={{ color: '#2ecc71' }}><span className={styles.dot} style={{ background: '#2ecc71' }} /> Salvo automaticamente</span>
          )}
          {!autoSaveMsg && saving && (
            <span className={styles.unsaved}><span className={styles.dot} /> Salvando...</span>
          )}
        </div>
        <div className={styles.actionRight}>
          <button className={styles.btnPreview} type="button" onClick={() => setPreview(true)}>
            <Eye size={15} /> Visualizar Preview
          </button>
          <button className={styles.btnSalvar} type="button" onClick={handleSalvar} disabled={saving}>
            <Save size={15} /> {saving ? 'Salvando...' : 'Salvar Artigo'}
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