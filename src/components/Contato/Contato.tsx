import { useState, useEffect, useCallback } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { X } from 'lucide-react';
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
  const [showTermo, setShowTermo] = useState(false);

  const closeTermo = useCallback(() => setShowTermo(false), []);

  useEffect(() => {
    if (!showTermo) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeTermo(); };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [showTermo, closeTermo]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target instanceof HTMLInputElement && e.target.type === 'checkbox'
      ? e.target.checked
      : e.target.value;
    setForm(prev => ({ ...prev, [e.target.name]: value }));
    setError('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.nome.trim()) {
      setError('Por favor, informe seu nome.');
      return;
    }
    if (!form.email.trim()) {
      setError('Por favor, informe seu e-mail.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError('Informe um e-mail válido.');
      return;
    }
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
                    Li e concordo com o{' '}
                    <button
                      type="button"
                      className={styles.termoLink}
                      onClick={() => setShowTermo(true)}
                    >
                      Termo de Consentimento
                    </button>
                    , autorizando o uso dos meus dados para contato sobre esta solicitação.
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

      {showTermo && (
        <div className={styles.termoOverlay} onClick={closeTermo} role="dialog" aria-modal="true" aria-label="Termo de Consentimento LGPD">
          <div className={styles.termoModal} onClick={e => e.stopPropagation()}>
            <div className={styles.termoHeader}>
              <h3>Termo de Consentimento para Tratamento de Dados Pessoais</h3>
              <button className={styles.termoClose} onClick={closeTermo} aria-label="Fechar termo">
                <X size={18} />
              </button>
            </div>
            <div className={styles.termoBody}>
              <p className={styles.termoIntro}>
                Em conformidade com a Lei nº 13.709/2018 (Lei Geral de Proteção de Dados — LGPD),
                informamos como tratamos os dados pessoais coletados neste formulário.
              </p>

              <div className={styles.termoSection}>
                <h4>1. Controlador dos dados</h4>
                <p>
                  <strong>{config?.office_name ?? 'Este escritório de advocacia'}</strong>
                  {config?.email ? `, contactável pelo e-mail ${config.email}` : ''}, é o responsável
                  pelo tratamento dos seus dados pessoais coletados por meio deste formulário.
                </p>
              </div>

              <div className={styles.termoSection}>
                <h4>2. Dados coletados</h4>
                <ul>
                  <li><strong>Nome completo</strong> — obrigatório</li>
                  <li><strong>E-mail</strong> — obrigatório</li>
                  <li><strong>Telefone</strong> — opcional</li>
                  <li><strong>Mensagem</strong> — opcional</li>
                </ul>
              </div>

              <div className={styles.termoSection}>
                <h4>3. Finalidade do tratamento</h4>
                <p>
                  Os dados coletados são utilizados exclusivamente para responder à sua solicitação
                  de contato e prestar as informações jurídicas solicitadas. Não são utilizados
                  para fins de marketing, compartilhados com terceiros ou vendidos.
                </p>
              </div>

              <div className={styles.termoSection}>
                <h4>4. Base legal</h4>
                <p>
                  O tratamento é baseado no seu <strong>consentimento livre e informado</strong>
                  {' '}(art. 7º, inciso I, da LGPD). Você pode revogar esse consentimento a qualquer
                  momento por meio dos canais de contato do escritório.
                </p>
              </div>

              <div className={styles.termoSection}>
                <h4>5. Prazo de retenção</h4>
                <p>
                  Seus dados serão mantidos pelo período necessário ao atendimento da solicitação
                  ou pelo prazo mínimo exigido por obrigações legais. Após o término do prazo, os
                  dados são eliminados de forma segura.
                </p>
              </div>

              <div className={styles.termoSection}>
                <h4>6. Seus direitos como titular</h4>
                <p>Nos termos dos arts. 17 a 22 da LGPD, você tem direito a:</p>
                <ul>
                  <li>Confirmar a existência de tratamento dos seus dados;</li>
                  <li>Acessar os dados que temos sobre você;</li>
                  <li>Corrigir dados incompletos, inexatos ou desatualizados;</li>
                  <li>Solicitar a eliminação dos dados tratados com base no seu consentimento;</li>
                  <li>Revogar o consentimento a qualquer momento;</li>
                  <li>Obter informações sobre com quem compartilhamos seus dados.</li>
                </ul>
                <p>
                  Para exercer esses direitos, entre em contato pelo e-mail{' '}
                  <strong>{config?.email ?? 'indicado no site do escritório'}</strong>.
                </p>
              </div>

              <button className={styles.termoCta} onClick={() => { setShowTermo(false); if (!form.consentimento) setForm(prev => ({ ...prev, consentimento: true })); }}>
                Entendi e aceito os termos
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
