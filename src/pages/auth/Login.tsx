import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowLeft } from 'lucide-react';
import { ApiError } from '../../services/api';
import { login, requestPasswordReset } from '../../services/auth';
import styles from './Auth.module.css';

type Tela = 'login' | 'esqueci' | 'solicitado';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [tela, setTela] = useState<Tela>('login');

  const [email, setEmail]       = useState('');
  const [senha, setSenha]       = useState('');
  const [erroLogin, setErroLogin] = useState('');
  const [loading, setLoading] = useState(false);

  const [emailRec, setEmailRec]   = useState('');
  const [erroRec, setErroRec]     = useState('');

  async function handleLogin() {
    setLoading(true);
    setErroLogin('');
    try {
      await login(email, senha);
      const from = (location.state as { from?: string } | null)?.from;
      navigate(from ?? '/sistema', { replace: true });
    } catch (error) {
      setErroLogin(
        error instanceof ApiError && error.status >= 500
          ? 'A API está indisponível no momento.'
          : 'E-mail ou senha incorretos.',
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleEsqueci() {
    setLoading(true);
    setErroRec('');
    try {
      await requestPasswordReset(emailRec);
      setTela('solicitado');
    } catch {
      setErroRec('Não foi possível solicitar a redefinição agora.');
    } finally {
      setLoading(false);
    }
  }

  function InputField({
    label, type = 'text', value, onChange, icon, error = false, placeholder,
  }: {
    label: string; type?: string; value: string;
    onChange: (v: string) => void; icon: React.ReactNode;
    error?: boolean; placeholder?: string;
  }) {
    return (
      <div className={styles.fieldWrap}>
        <span className={`${styles.fieldLabel} ${error ? styles.fieldLabelError : ''}`}>{label}</span>
        <div className={`${styles.fieldInner} ${error ? styles.fieldInnerError : ''}`}>
          <span className={styles.fieldIcon}>{icon}</span>
          <input
            className={styles.fieldInput}
            type={type}
            value={value}
            onChange={e => { onChange(e.target.value); }}
            placeholder={placeholder}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.bg}>
      <div className={styles.logo}>
        <img src="/logo-dark.png" alt="Vitor França" className={styles.logoImg} />
      </div>

      <div className={styles.card}>
        <div className={styles.cardBar} />
        <div className={styles.cardBody}>

          {/* ── LOGIN ── */}
          {tela === 'login' && (
            <>
              <h1 className={styles.cardTitle}>Login</h1>

              <InputField
                label="E-MAIL" value={email} onChange={v => { setEmail(v); setErroLogin(''); }}
                icon={<Mail size={16} />} error={Boolean(erroLogin)} placeholder="seu@email.com"
              />

              <div className={styles.forgotRow}>
                <button className={styles.forgotLink} onClick={() => { setTela('esqueci'); setErroLogin(''); }}>
                  Esqueci minha Senha
                </button>
              </div>

              <InputField
                label="SENHA" type="password" value={senha}
                onChange={v => { setSenha(v); setErroLogin(''); }}
                icon={<Lock size={16} />} error={Boolean(erroLogin)} placeholder="••••••••••••"
              />

              <button
                className={styles.btnSubmit}
                onClick={() => void handleLogin()}
                disabled={loading || !email || !senha}
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </button>

              {erroLogin && <p className={styles.errorMsg}>{erroLogin}</p>}
            </>
          )}

          {/* ── ESQUECI SENHA ── */}
          {tela === 'esqueci' && (
            <>
              <h1 className={styles.cardTitle} style={{ textAlign: 'left', fontSize: '1.4rem' }}>
                Esqueci minha senha
              </h1>
              <p className={styles.cardSubtitle}>Informe o e-mail para o qual deseja redefinir sua senha</p>

              <InputField
                label="E-MAIL" value={emailRec}
                onChange={v => { setEmailRec(v); setErroRec(''); }}
                icon={<Mail size={16} />} error={Boolean(erroRec)} placeholder="seu@email.com"
              />

              <button
                className={styles.btnSubmit}
                onClick={() => void handleEsqueci()}
                disabled={loading || !emailRec}
              >
                {loading ? 'Enviando...' : 'Enviar'}
              </button>

              {erroRec && <p className={styles.errorMsg}>{erroRec}</p>}

              <button className={styles.backLink} onClick={() => setTela('login')}>
                <ArrowLeft size={14} /> Voltar para Login
              </button>
            </>
          )}

          {tela === 'solicitado' && (
            <>
              <h1 className={styles.cardTitle} style={{ textAlign: 'left', fontSize: '1.4rem' }}>
                Verifique seu e-mail
              </h1>
              <p className={styles.successMsg}>
                Se o endereço estiver cadastrado, você receberá as instruções para
                redefinir sua senha.
              </p>

              <button className={styles.backLink} onClick={() => { setTela('login'); setEmailRec(''); }}>
                <ArrowLeft size={14} /> Voltar para Login
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
