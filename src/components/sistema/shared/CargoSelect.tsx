import { useState, useRef, useEffect } from 'react';
import { Briefcase, X, ChevronDown } from 'lucide-react';
import { CARGOS_OPCOES } from '../../../pages/sistema/Usuarios/mockData';
import type { Cargo } from '../../../pages/sistema/Usuarios/types';
import styles from './CargoSelect.module.css';

interface CargoSelectProps {
  value: Cargo[];
  onChange: (cargos: Cargo[]) => void;
  readOnly?: boolean;
}

export default function CargoSelect({ value, onChange, readOnly = false }: CargoSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggle = (cargo: Cargo) => {
    if (readOnly) return;
    onChange(value.includes(cargo) ? value.filter(c => c !== cargo) : [...value, cargo]);
  };

  const remove = (cargo: Cargo, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!readOnly) onChange(value.filter(c => c !== cargo));
  };

  return (
    <div className={styles.wrapper} ref={ref}>
      <div
        className={`${styles.box} ${readOnly ? styles.readOnly : ''}`}
        onClick={() => !readOnly && setOpen(o => !o)}
      >
        <Briefcase size={16} className={styles.icon} />
        <div className={styles.tags}>
          {value.map(c => (
            <span key={c} className={styles.tag}>
              {c}
              {!readOnly && (
                <button className={styles.removeTag} onClick={e => remove(c, e)}>
                  <X size={10} />
                </button>
              )}
            </span>
          ))}
          {!readOnly && (
            <span className={styles.placeholder}>
              {value.length === 0 ? 'Selecione...' : 'Adicionar cargo...'}
            </span>
          )}
        </div>
        {!readOnly && <ChevronDown size={14} className={styles.chevron} />}
      </div>

      {open && !readOnly && (
        <ul className={styles.dropdown}>
          {CARGOS_OPCOES.map(c => (
            <li
              key={c}
              className={`${styles.option} ${value.includes(c) ? styles.selected : ''}`}
              onClick={() => toggle(c)}
            >
              {c}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
