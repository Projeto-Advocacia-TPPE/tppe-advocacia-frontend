import { useScrollReveal } from '../../hooks/useScrollReveal';
import styles from './Escritorio.module.css';

export default function Escritorio() {
  const imgRef  = useScrollReveal<HTMLDivElement>();
  const textRef = useScrollReveal<HTMLDivElement>();

  return (
    <section id="escritorio" className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.grid}>
          <div ref={imgRef} className={styles.imgBox}>
            <img src="/placeholder.png" alt="" className={styles.placeholder} />
          </div>

          <div ref={textRef} className={styles.text}>
            <p className={styles.tag}>O Escritório</p>
            <div className={styles.divider} />
            <h2 className={styles.title}>Excelência jurídica com foco em resultados</h2>
            <p className={styles.body}>
              O escritório Vitor França — Advocacia e Consultoria Jurídica nasceu com o propósito
              de oferecer soluções jurídicas personalizadas e estratégicas para empresas que buscam
              crescimento sustentável.
            </p>
            <p className={styles.body}>
              Nossa abordagem combina profundo conhecimento técnico com visão de negócios, garantindo
              que cada decisão jurídica esteja alinhada aos objetivos estratégicos dos nossos clientes.
            </p>
            <a href="#sobre" className={styles.linkSaiba}>Saiba Mais →</a>
          </div>
        </div>
      </div>
    </section>
  );
}
