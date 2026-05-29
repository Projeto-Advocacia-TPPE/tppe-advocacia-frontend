import styles from './Footer.module.css';

const LINKS = [
  { label: 'Escritório',   href: '#escritorio'  },
  { label: 'Diferenciais', href: '#diferenciais' },
  { label: 'Áreas',        href: '#areas'        },
  { label: 'Sobre',        href: '#sobre'        },
  { label: 'Artigos',      href: '#artigos'      },
  { label: 'Contato',      href: '#contato'      },
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <a href="#" className={styles.logo}>
          <img src="/logo.png" alt="Vitor França" className={styles.logoImg} />
        </a>

        <ul className={styles.links}>
          {LINKS.map(({ label, href }) => (
            <li key={href}>
              <a href={href} className={styles.link}>{label}</a>
            </li>
          ))}
        </ul>

        <div className={styles.social}>
          <a href="#" className={styles.link}>LinkedIn</a>
          <a href="#" className={styles.link}>Instagram</a>
        </div>
      </div>

      <div className={styles.bottom}>
        <span>OAB/SP 123.456</span>
        <span>© 2026 Vitor França. Todos os direitos reservados.</span>
      </div>
    </footer>
  );
}
