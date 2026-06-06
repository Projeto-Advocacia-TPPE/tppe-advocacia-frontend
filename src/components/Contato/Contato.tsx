import { useState } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import styles from './Contato.module.css';

interface FormState {
  nome: string;
  email: string;
  mensagem: string;
}

export default function Contato() {
  const [form, setForm] = useState<FormState>({ nome: '', email: '', mensagem: '' });
  const [sent, setSent] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <section id="contato" className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.grid}>

          {/* Info */}
          <div className={styles.info}>
            <h2 className={styles.heading}>Entre em Contato</h2>

            <div className={styles.infoGroup}>
              <p className={styles.infoLabel}>Endereço</p>
              <p>Av. Paulista, 1.500 - 10º andar<br />Bela Vista, São Paulo - SP<br />CEP 01310-100</p>
            </div>
            <div className={styles.infoGroup}>
              <p className={styles.infoLabel}>E-mail</p>
              <p>contato@vitorfranca.adv.br</p>
            </div>
            <div className={styles.infoGroup}>
              <p className={styles.infoLabel}>Telefone</p>
              <p>(11) 3456-7890</p>
            </div>

            <a
              href="https://wa.me/5511000000000"
              className={styles.btnWpp}
              target="_blank"
              rel="noopener noreferrer"
            >
              Falar no WhatsApp
            </a>
          </div>

          {/* Form */}
          <div className={styles.formWrap}>
            {sent ? (
              <div className={styles.success}>
                <p>✓ Mensagem enviada! Entraremos em contato em breve.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <div className={styles.field}>
                  <label htmlFor="nome">Nome</label>
                  <input
                    id="nome"
                    name="nome"
                    type="text"
                    value={form.nome}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="email">E-mail</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="mensagem">Mensagem</label>
                  <textarea
                    id="mensagem"
                    name="mensagem"
                    value={form.mensagem}
                    onChange={handleChange}
                    required
                  />
                </div>
                <button type="submit" className={styles.btnEnviar}>Enviar Mensagem</button>
              </form>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
