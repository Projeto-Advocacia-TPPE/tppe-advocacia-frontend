import styles from './Hero.module.css';

export default function Hero() {
  return (
   <section id="hero" className={styles.hero}>
     <div className={styles.content}>
       <div className={styles.left}>
          <div className={styles.textGroup}>
            <p className={styles.tag}>Advocacia Empresarial</p>
           <h1 className={styles.title}>
              Soluções jurídicas para empresas que querem crescer com segurança
           </h1>
            <p className={styles.subtitle}>
              Assessoria jurídica especializada com foco em resultados práticos
             e estratégias personalizadas para o seu negócio.
            </p>
           <div className={styles.actions}>
             <a href="#contato"    className={styles.btnPrimary}>Fale Conosco</a>
             <a href="#escritorio" className={styles.btnOutline}>Conheça o Escritório</a>
            </div>
         </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.visual} aria-hidden="true">
          <img src="/placeholder.png" alt="" className={styles.placeholder} />
       </div>
     </div>
    </section>
  );
}
