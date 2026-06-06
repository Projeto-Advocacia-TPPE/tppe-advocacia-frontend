import { areas } from '../../data';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import styles from './Areas.module.css';

export default function Areas() {
  return (
    <section id="areas" className={styles.section}>
      <div className={styles.inner}>
        <h2 className={styles.heading}>Áreas de Atuação</h2>
        <div className={styles.grid}>
          {areas.map(area => (
            <AreaItem key={area.id} title={area.title} description={area.description} />
          ))}
        </div>
      </div>
    </section>
  );
}

function AreaItem({ title, description }: { title: string; description: string }) {
  const ref = useScrollReveal<HTMLDivElement>();
  return (
    <div ref={ref} className={styles.item}>
      <h3 className={styles.itemTitle}>{title}</h3>
      <p className={styles.itemDesc}>{description}</p>
    </div>
  );
}
