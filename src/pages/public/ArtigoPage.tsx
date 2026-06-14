import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiRequest } from '../../services/api';
import type { SuccessResponse } from '../../services/api';
import styles from './ArtigoPage.module.css';

interface ArticleDetail {
  id: number;
  title: string;
  content: string;
  category: string;
  summary: string | null;
  cover_image_url: string | null;
  status: string;
  author_name: string;
  created_at: string;
}

export default function ArtigoPage() {
  const { id } = useParams<{ id: string }>();
  const [artigo, setArtigo] = useState<ArticleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    apiRequest<SuccessResponse<ArticleDetail>>(`/articles/${id}`, { authenticated: false })
      .then(res => setArtigo(res.data))
      .catch(() => setErro('Artigo não encontrado.'))
      .finally(() => setLoading(false));
  }, [id]);

  const data = artigo
    ? new Date(artigo.created_at).toLocaleDateString('pt-BR', {
        day: '2-digit', month: 'long', year: 'numeric',
      })
    : '';

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.skeleton} style={{ height: 20, width: '30%', marginBottom: 40 }} />
          <div className={styles.skeleton} style={{ height: 40, width: '80%', marginBottom: 16 }} />
          <div className={styles.skeleton} style={{ height: 20, width: '40%', marginBottom: 40 }} />
          <div className={styles.skeleton} style={{ height: 320, marginBottom: 40 }} />
          {[90, 100, 85, 95, 70].map((w, i) => (
            <div key={i} className={styles.skeleton} style={{ height: 16, width: `${w}%`, marginBottom: 12 }} />
          ))}
        </div>
      </div>
    );
  }

  if (erro || !artigo) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <Link to="/#artigos" className={styles.back}>← Voltar aos artigos</Link>
          <p className={styles.erro}>{erro ?? 'Artigo não encontrado.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <Link to="/#artigos" className={styles.back}>← Voltar aos artigos</Link>

        {artigo.category && (
          <span className={styles.category}>{artigo.category}</span>
        )}

        <h1 className={styles.title}>{artigo.title}</h1>

        <div className={styles.meta}>
          <span className={styles.author}>{artigo.author_name}</span>
          <span className={styles.dot}>·</span>
          <span className={styles.date}>{data}</span>
        </div>

        {artigo.cover_image_url && (
          <img src={artigo.cover_image_url} alt={artigo.title} className={styles.cover} />
        )}

        {artigo.content ? (
          <div
            className={styles.content}
            dangerouslySetInnerHTML={{ __html: artigo.content }}
          />
        ) : artigo.summary ? (
          <p className={styles.summary}>{artigo.summary}</p>
        ) : null}
      </div>
    </div>
  );
}
