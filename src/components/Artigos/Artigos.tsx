import { useState, useCallback } from 'react';
import { artigos } from '../../data';
import type { Artigo } from '../../types';
import styles from './Artigos.module.css';

const PER_PAGE = 3;
const totalPages = Math.ceil(artigos.length / PER_PAGE);

const PAGE_LABELS: number[] = [0, 1, 2, artigos.length / PER_PAGE - 1];

export default function Artigos() {
  const [page, setPage] = useState(0);

  const prev = useCallback(() => setPage(p => Math.max(0, p - 1)), []);
  const next = useCallback(() => setPage(p => Math.min(totalPages - 1, p + 1)), []);

  const visible: Artigo[] = artigos.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);
  const from = page * PER_PAGE + 1;
  const to   = Math.min(page * PER_PAGE + PER_PAGE, artigos.length);

  return (
    <section id="artigos" className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <p className={styles.tag}>Publicações</p>
          <h2 className={styles.heading}>Artigos e Notícias</h2>
        </div>

        <div className={styles.grid}>
          {visible.map(a => (
            <article key={a.id} className={styles.card}>
              <p className={styles.date}>{a.date}</p>
              <h3 className={styles.cardTitle}>{a.title}</h3>
              <p className={styles.excerpt}>{a.excerpt}</p>
              <a href="#" className={styles.leia}>Leia mais →</a>
            </article>
          ))}
        </div>

        <div className={styles.nav}>
          <button className={styles.arrowBtn} onClick={prev} disabled={page === 0} aria-label="Anterior">←</button>

          {Array.from({ length: totalPages }, (_, i) => {
            if (i > 2 && i < totalPages - 1) {
              return i === 3 ? <span key="dots" className={styles.dots}>…</span> : null;
            }
            return (
              <button
                key={i}
                className={`${styles.pageBtn} ${page === i ? styles.active : ''}`}
                onClick={() => setPage(i)}
              >
                {i + 1}
              </button>
            );
          })}

          <button className={styles.arrowBtn} onClick={next} disabled={page === totalPages - 1} aria-label="Próximo">→</button>
        </div>

        <p className={styles.showing}>
          Mostrando <strong>{from}–{to}</strong> de {artigos.length} artigos
        </p>
      </div>
    </section>
  );
}
