import { useRef } from 'react';
import { User, Camera } from 'lucide-react';
import styles from './FotoUpload.module.css';

interface FotoUploadProps {
  foto?: string;
  onChange?: (url: string) => void;
  readOnly?: boolean;
}

export default function FotoUpload({ foto, onChange, readOnly = false }: FotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!onChange) return;
    const url = URL.createObjectURL(file);
    onChange(url);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (readOnly) return;
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className={styles.wrapper}>
      <div
        className={`${styles.avatar} ${!readOnly ? styles.clickable : ''}`}
        onClick={() => !readOnly && inputRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={handleDrop}
      >
        {foto ? (
          <img src={foto} alt="Foto" className={styles.foto} />
        ) : (
          <User size={40} strokeWidth={1.2} className={styles.placeholder} />
        )}
        {!readOnly && (
          <div className={styles.cameraBtn}>
            <Camera size={14} />
          </div>
        )}
      </div>
      {!readOnly && <p className={styles.label}>ADICIONAR FOTO</p>}
      {!readOnly && (
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg"
          style={{ display: 'none' }}
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
      )}
    </div>
  );
}
