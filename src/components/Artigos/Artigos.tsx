import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../../services/api';
import type { PaginatedResponse } from '../../services/api';
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
      day: '2-digit', month: 'long', year: 'numeric',
    }),
  };
}

const PER_PAGE = 3;

export default function Artigos() {
  const [artigos, setArtigos]     = useState<ArtigoItem[]>([]);
  const [loading, setLoading]     = useState(true);
  const [page, setPage]           = useState(0);
  const [animKey, setAnimKey]     = useState(0);
  const [slideDir, setSlideDir]   = useState<'left' | 'right'>('left');
  const [animating, setAnimating] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    apiRequest<PaginatedResponse<ArtigoPublico>>('/articles?limit=100', { authenticated: false })
      .then(res => setArtigos(res.data.map(toItem)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalPages = Math.max(1, Math.ceil(artigos.length / PER_PAGE));
  const slice      = artigos.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  function go(next: number, dir: 'left' | 'right') {
    if (animating || next === page || next < 0 || next >= totalPages) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    setSlideDir(dir);
    setPage(next);
    setAnimKey(k => k + 1);
    setAnimating(true);
    timerRef.current = setTimeout(() => setAnimating(false), 350);
  }

  const animClass = slideDir === 'left' ? styles.slideLeft : styles.slideRight;

  return (
    <section id="artigos" className={styles.section}>
      <div className={styles.inner}>

        <div className={styles.header}>
          <p className={styles.tag}>Publicações</p>
          <h2 className={styles.heading}>Artigos e Notícias</h2>
        </div>

        {loading ? (
          <div className={styles.skeletonRow}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={styles.skeletonCard}>
                <div className={styles.skeletonLine} style={{ width: '40%', marginBottom: 14 }} />
                <div className={styles.skeletonLine} style={{ width: '85%', height: 20, marginBottom: 10 }} />
                <div className={styles.skeletonLine} style={{ width: '60%', height: 20, marginBottom: 14 }} />
                <div className={styles.skeletonLine} style={{ width: '95%', marginBottom: 8 }} />
                <div className={styles.skeletonLine} style={{ width: '80%' }} />
              </div>
            ))}
          </div>
        ) : artigos.length === 0 ? (
          <p style={{ color: 'rgba(255,255,255,.4)', fontSize: '.9rem', marginBottom: 48 }}>
            Nenhum artigo publicado.
          </p>
        ) : (
          <>
            <div className={styles.carouselRow}>
              <button
                className={styles.sideArrow}
                onClick={() => go(page - 1, 'right')}
                disabled={page === 0 || animating}
                aria-label="Anterior"
              >›</button>

              <div className={styles.gridWrap}>
                <div key={animKey} className={`${styles.grid} ${animClass}`}>
                  {slice.map(a => (
                    <article key={a.id} className={styles.card}>
                      <p className={styles.date}>{a.date}</p>
                      <h3 className={styles.cardTitle}>{a.title}</h3>
                      <p className={styles.excerpt}>{a.excerpt}</p>
                      <Link to={`/artigos/${a.id}`} className={styles.leia}>Leia mais →</Link>
                    </article>
                  ))}
                </div>
              </div>

              <button
                className={styles.sideArrow}
                onClick={() => go(page + 1, 'left')}
                disabled={page >= totalPages - 1 || animating}
                aria-label="Próximo"
              >›</button>
            </div>

            <div className={styles.nav}>
              <button className={styles.arrowBtn} onClick={() => go(page - 1, 'right')} disabled={page === 0 || animating}>‹</button>

              {Array.from({ length: totalPages }, (_, i) => {
                if (i > 2 && i < totalPages - 1) {
                  return i === 3 ? <span key="dots" className={styles.dots}>…</span> : null;
                }
                return (
                  <button
                    key={i}
                    className={`${styles.pageBtn} ${page === i ? styles.active : ''}`}
                    onClick={() => go(i, i > page ? 'left' : 'right')}
                  >
                    {i + 1}
                  </button>
                );
              })}

              <button className={styles.arrowBtn} onClick={() => go(page + 1, 'left')} disabled={page >= totalPages - 1 || animating}>›</button>
            </div>

            <p className={styles.showing}>
              Mostrando <strong>{page * PER_PAGE + 1}–{Math.min((page + 1) * PER_PAGE, artigos.length)}</strong> de {artigos.length} artigos
            </p>
          </>
        )}

      </div>
    </section>
  );
}
