import { useState } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { ApiError } from '../../services/api';
import { createLead } from '../../services/leads';
import { useOfficeConfig } from '../../contexts/OfficeConfigContext';
import styles from './Contato.module.css';

interface FormState {
  nome: string;
  email: string;
  telefone: string;
  mensagem: string;
  consentimento: boolean;
}

export default function Contato() {
  const { config } = useOfficeConfig();

  const endereco   = config?.address      ?? 'Av. Paulista, 1.500 - 10º andar\nBela Vista, São Paulo - SP\nCEP 01310-100';
  const email      = config?.email        ?? 'contato@vitorfranca.adv.br';
  const telefone   = config?.phone        ?? '(11) 3456-7890';
  const whatsappUrl = config?.whatsapp_url ?? 'https://wa.me/5511000000000';

  const [form, setForm] = useState<FormState>({
    nome: '',
    email: '',
    telefone: '',
    mensagem: '',
    consentimento: false,
  });
  const [sent, setSent]           = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState('');

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target instanceof HTMLInputElement && e.target.type === 'checkbox'
      ? e.target.checked
      : e.target.value;
    setForm(prev => ({ ...prev, [e.target.name]: value }));
    setError('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await createLead({
        name: form.nome.trim(),
        email: form.email.trim(),
        phone: form.telefone.trim() || null,
        message: form.mensagem.trim() || null,
      });
      setSent(true);
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 409) {
        setError('Já recebemos uma mensagem recente deste e-mail. Entraremos em contato em breve.');
      } else {
        setError('Não foi possível enviar sua mensagem agora. Tente novamente em instantes.');
      }
    } finally {
      setSubmitting(false);
    }
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
              <p style={{ whiteSpace: 'pre-line' }}>{endereco}</p>
            </div>
            <div className={styles.infoGroup}>
              <p className={styles.infoLabel}>E-mail</p>
              <p>{email}</p>
            </div>
            <div className={styles.infoGroup}>
              <p className={styles.infoLabel}>Telefone</p>
              <p>{telefone}</p>
            </div>

            <a
              href={whatsappUrl}
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
                  <label htmlFor="telefone">Telefone</label>
                  <input
                    id="telefone"
                    name="telefone"
                    type="tel"
                    value={form.telefone}
                    onChange={handleChange}
                    placeholder="(61) 99999-9999"
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
                <label className={styles.consent}>
                  <input
                    name="consentimento"
                    type="checkbox"
                    checked={form.consentimento}
                    onChange={handleChange}
                    required
                  />
                  <span>
                    Autorizo o uso dos meus dados para que o escritório entre em contato
                    sobre esta solicitação.
                  </span>
                </label>
                {error && <p className={styles.formError}>{error}</p>}
                <button
                  type="submit"
                  className={styles.btnEnviar}
                  disabled={submitting || !form.consentimento}
                >
                  {submitting ? 'Enviando...' : 'Enviar Mensagem'}
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
