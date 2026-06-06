import { useState, useCallback, useRef } from 'react';
import { artigos } from '../../data';
import styles from './Artigos.module.css';

const PER_PAGE   = 3;
const TOTAL      = artigos.length;
const totalPages = Math.ceil(TOTAL / PER_PAGE);

export default function Artigos() {
  const [startIndex, setStartIndex]   = useState(0);
  const [nextIndex, setNextIndex]     = useState(0);
  const [animating, setAnimating]     = useState(false);
  const [direction, setDirection]     = useState<'left' | 'right'>('left');
  const timeoutRef                    = useRef<ReturnType<typeof setTimeout> | null>(null);

  function go(next: number, dir: 'left' | 'right') {
    if (animating || next === startIndex) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setNextIndex(next);
    setDirection(dir);
    setAnimating(true);
    timeoutRef.current = setTimeout(() => {
      setStartIndex(next);
      setAnimating(false);
    }, 400);
  }

  // Setas laterais: 1 artigo por vez
  const prevCarousel = useCallback(() => {
    go(Math.max(0, startIndex - 1), 'right');
  }, [startIndex, animating]);

  const nextCarousel = useCallback(() => {
    go(Math.min(TOTAL - PER_PAGE, startIndex + 1), 'left');
  }, [startIndex, animating]);

  // Paginação: 3 artigos por vez
  const currentPage = Math.floor(startIndex / PER_PAGE);

  const prevPage = useCallback(() => {
    go(Math.max(0, startIndex - PER_PAGE), 'right');
  }, [startIndex, animating]);

  const nextPage = useCallback(() => {
    go(Math.min(TOTAL - PER_PAGE, startIndex + PER_PAGE), 'left');
  }, [startIndex, animating]);

  const goToPage = useCallback((page: number) => {
    const next = page * PER_PAGE;
    go(next, next > startIndex ? 'left' : 'right');
  }, [startIndex, animating]);

  // Fatia atual e próxima (para o slide duplo)
  const currentSlice = artigos.slice(startIndex, startIndex + PER_PAGE);
  const nextSlice    = artigos.slice(nextIndex,   nextIndex   + PER_PAGE);

  const from = startIndex + 1;
  const to   = Math.min(startIndex + PER_PAGE, TOTAL);

  // O track tem largura dupla e desliza
  // Se dir=left:  [current | next]  → desliza para -50%
  // Se dir=right: [next | current]  → começa em -50%, desliza para 0
  const trackStyle: React.CSSProperties = animating
    ? {
        transform:  direction === 'left' ? 'translateX(-50%)' : 'translateX(0%)',
        transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      }
    : {
        transform:  direction === 'right' && animating ? 'translateX(-50%)' : 'translateX(0%)',
        transition: 'none',
      };

  // Posição inicial do track (sem transição) antes de animar
  const trackInitialStyle: React.CSSProperties = !animating
    ? { transform: 'translateX(0%)', transition: 'none' }
    : direction === 'left'
    ? { transform: 'translateX(0%)'  }
    : { transform: 'translateX(-50%)' };

  const firstGrid  = direction === 'left' ? currentSlice : nextSlice;
  const secondGrid = direction === 'left' ? nextSlice    : currentSlice;

  return (
    <section id="artigos" className={styles.section}>
      <div className={styles.inner}>

        <div className={styles.header}>
          <p className={styles.tag}>Publicações</p>
          <h2 className={styles.heading}>Artigos e Notícias</h2>
        </div>

        <div className={styles.carouselRow}>
          <button
            className={styles.sideArrow}
            onClick={prevCarousel}
            disabled={startIndex === 0 || animating}
            aria-label="Anterior"
          >›</button>

          <div className={styles.gridWrap}>
            <div className={styles.track} style={animating ? trackStyle : trackInitialStyle}>
              <div className={styles.grid}>
                {firstGrid.map(a => (
                  <article key={a.id} className={styles.card}>
                    <p className={styles.date}>{a.date}</p>
                    <h3 className={styles.cardTitle}>{a.title}</h3>
                    <p className={styles.excerpt}>{a.excerpt}</p>
                    <a href="#" className={styles.leia}>Leia mais →</a>
                  </article>
                ))}
              </div>
              <div className={styles.grid}>
                {secondGrid.map(a => (
                  <article key={a.id} className={styles.card}>
                    <p className={styles.date}>{a.date}</p>
                    <h3 className={styles.cardTitle}>{a.title}</h3>
                    <p className={styles.excerpt}>{a.excerpt}</p>
                    <a href="#" className={styles.leia}>Leia mais →</a>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <button
            className={styles.sideArrow}
            onClick={nextCarousel}
            disabled={startIndex >= TOTAL - PER_PAGE || animating}
            aria-label="Próximo"
          >›</button>
        </div>

        <div className={styles.nav}>
          <button className={styles.arrowBtn} onClick={prevPage} disabled={startIndex === 0 || animating}>‹</button>

          {Array.from({ length: totalPages }, (_, i) => {
            if (i > 2 && i < totalPages - 1) {
              return i === 3 ? <span key="dots" className={styles.dots}>…</span> : null;
            }
            return (
              <button
                key={i}
                className={`${styles.pageBtn} ${currentPage === i ? styles.active : ''}`}
                onClick={() => goToPage(i)}
              >
                {i + 1}
              </button>
            );
          })}

          <button className={styles.arrowBtn} onClick={nextPage} disabled={startIndex >= TOTAL - PER_PAGE || animating}>›</button>
        </div>

        <p className={styles.showing}>
          Mostrando <strong>{from}–{to}</strong> de {TOTAL} artigos
        </p>

      </div>
    </section>
  );
}