import { areas as staticAreas } from '../../data';
import { useOfficeConfig } from '../../contexts/OfficeConfigContext';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import styles from './Areas.module.css';

export default function Areas() {
  const { config } = useOfficeConfig();

  const validAreas = (config?.areas_of_practice ?? []).filter(a => a.title || a.description);
  const items = validAreas.length
    ? validAreas
    : staticAreas.map(a => ({ title: a.title, description: a.description }));

  return (
    <section id="areas" className={styles.section}>
      <div className={styles.inner}>
        <h2 className={styles.heading}>Áreas de Atuação</h2>
        <div className={styles.grid}>
          {items.map((area, i) => (
            <AreaItem key={i} title={area.title} description={area.description} />
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
