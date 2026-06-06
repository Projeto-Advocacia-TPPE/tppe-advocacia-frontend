import { useScrollReveal } from '../../hooks/useScrollReveal';
import styles from './Sobre.module.css';

const bullets = [
  'Graduado pela Faculdade de Direito da USP',
  'Pós-graduado em Direito Empresarial pela FGV',
  'MBA em Gestão Empresarial pela Fundação Dom Cabral',
  'Membro do IBGC (Instituto Brasileiro de Governança Corporativa)',
];

export default function Sobre() {
  const imgRef  = useScrollReveal<HTMLDivElement>();
  const textRef = useScrollReveal<HTMLDivElement>();

  return (
    <section id="sobre" className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.grid}>

          <div className={styles.imgGroup}>
            <div ref={imgRef} className={styles.imgBox}>
              <img src="vitor.png" alt="" className={styles.placeholder} />
            </div>
            <div className={styles.divider} />
          </div>

          <div ref={textRef} className={styles.text}>
            <h2 className={styles.name}>Vitor França</h2>
            <p className={styles.oab}>OAB/SP 123.456</p>
            <p className={styles.body}>
              Advogado especializado em Direito Empresarial, com mais de 15 anos de experiência
              em assessoria jurídica estratégica para empresas de médio e grande porte.
            </p>
            <p className={styles.body}>
              Sua atuação é marcada pela combinação entre rigor técnico e visão de negócios,
              oferecendo soluções práticas e eficientes para os desafios jurídicos enfrentados
              por empreendedores e gestores.
            </p>
            <ul className={styles.bullets}>
              {bullets.map(b => <li key={b}>{b}</li>)}
            </ul>
            <a href="#contato" className={styles.linkSaiba}>Ver currículo completo →</a>
          </div>

        </div>
      </div>
    </section>
  );
}