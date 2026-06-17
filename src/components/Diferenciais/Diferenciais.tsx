import { diferenciais as staticDiferenciais } from '../../data';
import { useOfficeConfig } from '../../contexts/OfficeConfigContext';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import styles from './Diferenciais.module.css';

export default function Diferenciais() {
  const { config } = useOfficeConfig();

  const items = config?.differentials?.length
    ? config.differentials
    : staticDiferenciais.map(d => ({ title: d.title, description: d.description }));

  return (
    <section id="diferenciais" className={styles.section}>
      <div className={styles.inner}>
        <h2 className={styles.heading}>Nossos Diferenciais</h2>
        <div className={styles.grid}>
          {items.map((d, i) => (
            <Card key={i} title={d.title} description={d.description} />
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
