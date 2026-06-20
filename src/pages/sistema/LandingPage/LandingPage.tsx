import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Building2, Link2, Star, BookOpen, UserRound,
  Shield, MapPin, ImageIcon, Pencil, Check, X, Loader2,
} from 'lucide-react';
import { getOfficeConfigUI, updateOfficeConfig, uploadMedia } from '../../../services/officeConfigService';
import type { LandingPageData, Diferencial, AreaAtuacao } from './types';

const EMPTY_DIFERENCIAIS: Diferencial[] = [
  { id: 1, titulo: '', descricao: '' },
  { id: 2, titulo: '', descricao: '' },
  { id: 3, titulo: '', descricao: '' },
];

const EMPTY_AREAS: AreaAtuacao[] = [
  { id: 1, titulo: '', descricao: '' },
  { id: 2, titulo: '', descricao: '' },
  { id: 3, titulo: '', descricao: '' },
  { id: 4, titulo: '', descricao: '' },
  { id: 5, titulo: '', descricao: '' },
  { id: 6, titulo: '', descricao: '' },
];

const EMPTY_DATA: LandingPageData = {
  email: '', endereco: '', telefone: '',
  linkedin: '', instagram: '',
  heroTitulo: '', heroSubtexto: '', heroImagem: '',
  escritorioTitulo: '', escritorioConteudo: '', escritorioImagem: '',
  advogadoTitulo: '', advogadoOab: '', advogadoConteudo: '', advogadoImagem: '',
  diferenciais: EMPTY_DIFERENCIAIS,
  areas: EMPTY_AREAS,
};
import styles from './LandingPage.module.css';

// ── helpers ──────────────────────────────────────────────
function deepEqual(a: unknown, b: unknown) {
  return JSON.stringify(a) === JSON.stringify(b);
}

// ── sub-components ───────────────────────────────────────
interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  hint: string;
  size: string;
}
function ImageUpload({ value, onChange, hint, size }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    try {
      const url = await uploadMedia(file);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha no upload. Tente novamente.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div
      className={styles.imgBox}
      onDragOver={e => e.preventDefault()}
      onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
    >
      {value ? (
        <img src={value} alt="preview" className={styles.imgPreview} />
      ) : (
        <>
          {uploading
            ? <Loader2 size={32} className={styles.imgIcon} style={{ animation: 'spin 1s linear infinite' }} />
            : <ImageIcon size={32} className={styles.imgIcon} />
          }
          <p className={styles.imgHint}>{hint}</p>
          <p className={styles.imgSize}>A imagem deve ser {size}.</p>
        </>
      )}
      {error && <p style={{ color: '#e74c3c', fontSize: 12, marginTop: 4 }}>{error}</p>}
      <button className={styles.imgBtn} disabled={uploading} onClick={() => inputRef.current?.click()}>
        {uploading ? 'Enviando...' : value ? 'Trocar Imagem' : 'Carregar Imagem'}
      </button>
      <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }}
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
    </div>
  );
}

interface SectionCardProps { icon: React.ReactNode; title: string; children: React.ReactNode; }
function SectionCard({ icon, title, children }: SectionCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.cardIcon}>{icon}</span>
        <h2 className={styles.cardTitle}>{title}</h2>
      </div>
      <div className={styles.cardBody}>{children}</div>
    </div>
  );
}

interface FieldProps { label: string; children: React.ReactNode; }
function Field({ label, children }: FieldProps) {
  return (
    <div className={styles.field}>
      <label className={styles.fieldLabel}>{label}</label>
      {children}
    </div>
  );
}

// ── main page ────────────────────────────────────────────
export default function LandingPageConfig() {
  const [saved,   setSaved]   = useState<LandingPageData>(EMPTY_DATA);
  const [data,    setData]    = useState<LandingPageData>(EMPTY_DATA);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const isDirty = !deepEqual(data, saved);

  useEffect(() => {
    getOfficeConfigUI()
      .then(cfg => {
        const merged: LandingPageData = {
          ...cfg,
          diferenciais: cfg.diferenciais.length > 0 ? cfg.diferenciais : EMPTY_DIFERENCIAIS,
          areas:        cfg.areas.length        > 0 ? cfg.areas        : EMPTY_AREAS,
        };
        setSaved(merged);
        setData(merged);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const set = useCallback(<K extends keyof LandingPageData>(key: K, value: LandingPageData[K]) => {
    setData(d => ({ ...d, [key]: value }));
  }, []);

  const discard = () => setData(saved);

  const save = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const updated = await updateOfficeConfig(data);
      setSaved(updated);
      setData(updated);
    } catch {
      setSaveError('Erro ao salvar. Verifique sua conexão e tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  // Diferencial inline edit
  const [editingDif, setEditingDif] = useState<number | null>(null);
  const updateDif = (id: number, field: keyof Diferencial, value: string) =>
    set('diferenciais', data.diferenciais.map(d => d.id === id ? { ...d, [field]: value } : d));

  // Área inline edit
  const [editingArea, setEditingArea] = useState<number | null>(null);
  const updateArea = (id: number, field: keyof AreaAtuacao, value: string) =>
    set('areas', data.areas.map(a => a.id === id ? { ...a, [field]: value } : a));

  if (loading) {
    return (
      <div className={styles.page} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: '#666' }} />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>Configuração da Landing Page</h1>

      {/* ── Dados Institucionais ── */}
      <SectionCard icon={<Building2 size={20} />} title="Dados Institucionais">
        <div className={styles.row2}>
          <div>
            <Field label="E-MAIL DE CONTATO">
              <input className={styles.input} value={data.email} onChange={e => set('email', e.target.value)} />
            </Field>
            <Field label="TELEFONE">
              <input className={styles.input} value={data.telefone} onChange={e => set('telefone', e.target.value)} />
            </Field>
          </div>
          <Field label="ENDEREÇO">
            <textarea className={styles.textarea} rows={5} value={data.endereco} onChange={e => set('endereco', e.target.value)} />
          </Field>
        </div>
      </SectionCard>

      {/* ── Links ── */}
      <SectionCard icon={<Link2 size={20} />} title="Links">
        <Field label="LINKEDIN">
          <input className={styles.input} value={data.linkedin} onChange={e => set('linkedin', e.target.value)} />
        </Field>
        <Field label="INSTAGRAM">
          <input className={styles.input} value={data.instagram} onChange={e => set('instagram', e.target.value)} />
        </Field>
      </SectionCard>

      {/* ── Hero ── */}
      <SectionCard icon={<Star size={20} />} title="Hero (Destaque Principal)">
        <div className={styles.row2}>
          <div>
            <Field label="TÍTULO DO IMPACTO">
              <input className={styles.input} value={data.heroTitulo} onChange={e => set('heroTitulo', e.target.value)} />
            </Field>
            <Field label="SUBTEXTO DE APOIO">
              <textarea className={styles.textarea} rows={3} value={data.heroSubtexto} onChange={e => set('heroSubtexto', e.target.value)} />
            </Field>
          </div>
          <Field label="IMAGEM (HERO)">
            <ImageUpload
              value={data.heroImagem} onChange={v => set('heroImagem', v)}
              hint="Adicione uma imagem profissional que será principal da Landing Page."
              size="420px por 600px"
            />
          </Field>
        </div>
      </SectionCard>

      {/* ── Sobre Escritório ── */}
      <SectionCard icon={<BookOpen size={20} />} title="Sobre Escritório">
        <div className={styles.row2}>
          <div>
            <Field label="TÍTULO DA SEÇÃO">
              <input className={styles.input} value={data.escritorioTitulo} onChange={e => set('escritorioTitulo', e.target.value)} />
            </Field>
            <Field label="CONTEÚDO DESCRITIVO">
              <textarea className={styles.textarea} rows={5} value={data.escritorioConteudo} onChange={e => set('escritorioConteudo', e.target.value)} />
            </Field>
          </div>
          <Field label="IMAGEM DO ESCRITÓRIO">
            <ImageUpload
              value={data.escritorioImagem} onChange={v => set('escritorioImagem', v)}
              hint="Adicione uma imagem profissional que ficará no sobre da Landing Page."
              size="500px por 575px"
            />
          </Field>
        </div>
      </SectionCard>

      {/* ── Sobre Advogado ── */}
      <SectionCard icon={<UserRound size={20} />} title="Sobre Advogado">
        <div className={styles.row2}>
          <div>
            <Field label="TÍTULO DA SEÇÃO">
              <input className={styles.input} value={data.advogadoTitulo} onChange={e => set('advogadoTitulo', e.target.value)} />
            </Field>
            <Field label="OAB">
              <input className={styles.input} value={data.advogadoOab} onChange={e => set('advogadoOab', e.target.value)} />
            </Field>
            <Field label="CONTEÚDO DESCRITIVO">
              <textarea className={styles.textarea} rows={4} value={data.advogadoConteudo} onChange={e => set('advogadoConteudo', e.target.value)} />
            </Field>
          </div>
          <Field label="IMAGEM DO ADVOGADO">
            <ImageUpload
              value={data.advogadoImagem} onChange={v => set('advogadoImagem', v)}
              hint="Adicione uma imagem profissional do advogado que ficará no sobre da Landing Page."
              size="475px por 600px"
            />
          </Field>
        </div>
      </SectionCard>

      {/* ── Diferenciais ── */}
      <SectionCard icon={<Shield size={20} />} title="Diferenciais">
        <div className={styles.grid3}>
          {data.diferenciais.map(d => (
            <div key={d.id} className={`${styles.listCard} ${editingDif === d.id ? styles.listCardEditing : ''}`}>
              {editingDif === d.id ? (
                <>
                  <input className={styles.inlineInput} value={d.titulo} onChange={e => updateDif(d.id, 'titulo', e.target.value)} />
                  <textarea className={styles.inlineTextarea} rows={3} value={d.descricao} onChange={e => updateDif(d.id, 'descricao', e.target.value)} />
                  <button className={styles.iconBtnGreen} onClick={() => setEditingDif(null)}><Check size={14} /></button>
                </>
              ) : (
                <>
                  <p className={styles.listCardTitle}>{d.titulo}</p>
                  <p className={styles.listCardDesc}>{d.descricao}</p>
                  <div className={styles.listCardActions}>
                    <button className={styles.iconBtnGray} onClick={() => setEditingDif(d.id)}><Pencil size={13} /></button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ── Áreas de Atuação ── */}
      <SectionCard icon={<MapPin size={20} />} title="Áreas de Atuação">
        <div className={styles.grid3}>
          {data.areas.map(a => (
            <div key={a.id} className={`${styles.listCard} ${editingArea === a.id ? styles.listCardEditing : ''}`}>
              {editingArea === a.id ? (
                <>
                  <input className={styles.inlineInput} value={a.titulo} onChange={e => updateArea(a.id, 'titulo', e.target.value)} />
                  <textarea className={styles.inlineTextarea} rows={3} value={a.descricao} onChange={e => updateArea(a.id, 'descricao', e.target.value)} />
                  <button className={styles.iconBtnGreen} onClick={() => setEditingArea(null)}><Check size={14} /></button>
                </>
              ) : (
                <>
                  <p className={styles.listCardTitle}>{a.titulo}</p>
                  <p className={styles.listCardDesc}>{a.descricao}</p>
                  <div className={styles.listCardActions}>
                    <button className={styles.iconBtnGray} onClick={() => setEditingArea(a.id)}><Pencil size={13} /></button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ── Bottom bar ── */}
      <div className={`${styles.bottomBar} ${isDirty || saveError ? styles.bottomBarVisible : ''}`}>
        {saveError && (
          <span style={{ color: '#e74c3c', fontSize: 13, marginRight: 'auto' }}>{saveError}</span>
        )}
        {!saveError && (
          <span className={styles.bottomMsg}>
            <span className={styles.dot} /> Alterações não salvas detectadas...
          </span>
        )}
        <div className={styles.bottomActions}>
          <button className={styles.btnDiscard} onClick={discard} disabled={saving}>
            <X size={15} /> Descartar
          </button>
          <button className={styles.btnSave} onClick={save} disabled={saving}>
            {saving
              ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Salvando...</>
              : <><Check size={15} /> Salvar alterações</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}
