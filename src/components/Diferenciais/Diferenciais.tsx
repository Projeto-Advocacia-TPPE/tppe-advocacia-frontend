import { diferenciais } from '../../data';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import styles from './Diferenciais.module.css';

export default function Diferenciais() {
  return (
    <section id="diferenciais" className={styles.section}>
      <div className={styles.inner}>
        <h2 className={styles.heading}>Nossos Diferenciais</h2>
        <div className={styles.grid}>
          {diferenciais.map(d => (
            <Card key={d.id} title={d.title} description={d.description} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Card({ title, description }: { title: string; description: string }) {
  const ref = useScrollReveal<HTMLDivElement>();
  return (
    <div ref={ref} className={styles.card}>
      <h3 className={styles.cardTitle}>{title}</h3>
      <p className={styles.cardDesc}>{description}</p>
    </div>
  );
}
