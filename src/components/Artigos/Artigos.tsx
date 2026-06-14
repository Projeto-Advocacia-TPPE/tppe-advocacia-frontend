import { useState, useCallback, useRef, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import type { PaginatedResponse } from '../../services/api';
import { artigos as staticArtigos } from '../../data';
import styles from './Artigos.module.css';

interface ArtigoPublico {
  id: number;
  title: string;
  summary: string | null;
  status: string;
  created_at: string;
  url: string;
}

interface ArtigoItem {
  id: number;
  title: string;
  excerpt: string;
  date: string;
}

function toItem(a: ArtigoPublico): ArtigoItem {
  return {
    id: a.id,
    title: a.title,
    excerpt: a.summary ?? '',
    date: new Date(a.created_at).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }),
  };
}

const PER_PAGE = 3;

export default function Artigos() {
  const [artigos, setArtigos] = useState<ArtigoItem[]>(
    staticArtigos.map(a => ({ id: a.id, title: a.title, excerpt: a.excerpt, date: a.date })),
  );

  const [startIndex, setStartIndex] = useState(0);
  const [nextIndex,  setNextIndex]  = useState(0);
  const [animating,  setAnimating]  = useState(false);
  const [direction,  setDirection]  = useState<'left' | 'right'>('left');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    apiRequest<PaginatedResponse<ArtigoPublico>>('/articles?limit=100', { authenticated: false })
      .then(res => {
        if (res.data.length > 0) setArtigos(res.data.map(toItem));
      })
      .catch(() => {});
  }, []);

  const TOTAL      = artigos.length;
  const totalPages = Math.max(1, Math.ceil(TOTAL / PER_PAGE));

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

  const prevCarousel = useCallback(() => {
    go(Math.max(0, startIndex - 1), 'right');
  }, [startIndex, animating]);

  const nextCarousel = useCallback(() => {
    go(Math.min(TOTAL - PER_PAGE, startIndex + 1), 'left');
  }, [startIndex, animating, TOTAL]);

  const currentPage = Math.floor(startIndex / PER_PAGE);

  const prevPage = useCallback(() => {
    go(Math.max(0, startIndex - PER_PAGE), 'right');
  }, [startIndex, animating]);

  const nextPage = useCallback(() => {
    go(Math.min(TOTAL - PER_PAGE, startIndex + PER_PAGE), 'left');
  }, [startIndex, animating, TOTAL]);

  const goToPage = useCallback((page: number) => {
    const next = page * PER_PAGE;
    go(next, next > startIndex ? 'left' : 'right');
  }, [startIndex, animating]);

  const currentSlice = artigos.slice(startIndex, startIndex + PER_PAGE);
  const nextSlice    = artigos.slice(nextIndex,   nextIndex   + PER_PAGE);

  const from = startIndex + 1;
  const to   = Math.min(startIndex + PER_PAGE, TOTAL);

  const trackStyle: React.CSSProperties = animating
    ? {
        transform:  direction === 'left' ? 'translateX(-50%)' : 'translateX(0%)',
        transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      }
    : {
        transform:  direction === 'right' && animating ? 'translateX(-50%)' : 'translateX(0%)',
        transition: 'none',
      };

  const trackInitialStyle: React.CSSProperties = !animating
    ? { transform: 'translateX(0%)', transition: 'none' }
    : direction === 'left'
    ? { transform: 'translateX(0%)' }
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
