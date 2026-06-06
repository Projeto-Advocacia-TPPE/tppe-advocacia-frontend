import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowLeft } from 'lucide-react';
import styles from './Auth.module.css';

// E-mails válidos mockados
const USUARIOS_VALIDOS = [
  { email: 'vitor.f@gmail.com',   senha: '123456' },
  { email: 'beatriz.c@gmail.com', senha: '123456' },
  { email: 'eduardo.c@gmail.com', senha: '123456' },
];

type Tela = 'login' | 'esqueci' | 'nova-senha' | 'sucesso';

export default function Login() {
  const navigate = useNavigate();

  const [tela, setTela] = useState<Tela>('login');

  // Login
  const [email, setEmail]       = useState('');
  const [senha, setSenha]       = useState('');
  const [erroLogin, setErroLogin] = useState(false);

  // Esqueci senha
  const [emailRec, setEmailRec]   = useState('');
  const [erroRec, setErroRec]     = useState(false);

  // Nova senha
  const [novaSenha, setNovaSenha]         = useState('');
  const [confirmSenha, setConfirmSenha]   = useState('');
  const [erroSenhas, setErroSenhas]       = useState(false);

  // ── Handlers ──────────────────────────────────────────
  function handleLogin() {
    const valido = USUARIOS_VALIDOS.some(u => u.email === email && u.senha === senha);
    if (valido) {
      navigate('/sistema');
    } else {
      setErroLogin(true);
    }
  }

  function handleEsqueci() {
    const existe = USUARIOS_VALIDOS.some(u => u.email === emailRec);
    if (existe) {
      setErroRec(false);
      setTela('nova-senha');
    } else {
      setErroRec(true);
    }
  }

  function handleRedefinir() {
    if (novaSenha !== confirmSenha || novaSenha.length < 4) {
      setErroSenhas(true);
    } else {
      setErroSenhas(false);
      setTela('sucesso');
    }
  }

  // ── Shared components ─────────────────────────────────
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

  // ── Render ────────────────────────────────────────────
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
                label="E-MAIL" value={email} onChange={v => { setEmail(v); setErroLogin(false); }}
                icon={<Mail size={16} />} error={erroLogin} placeholder="justice@sovereign.law"
              />

              <div className={styles.forgotRow}>
                <button className={styles.forgotLink} onClick={() => { setTela('esqueci'); setErroLogin(false); }}>
                  Esqueci minha Senha
                </button>
              </div>

              <InputField
                label="SENHA" type="password" value={senha}
                onChange={v => { setSenha(v); setErroLogin(false); }}
                icon={<Lock size={16} />} error={erroLogin} placeholder="••••••••••••"
              />

              <button className={styles.btnSubmit} onClick={handleLogin}>Entrar</button>

              {erroLogin && <p className={styles.errorMsg}>E-mail ou senha incorretos</p>}
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
                onChange={v => { setEmailRec(v); setErroRec(false); }}
                icon={<Mail size={16} />} error={erroRec} placeholder="justice@sovereign.law"
              />

              <button className={styles.btnSubmit} onClick={handleEsqueci}>Enviar</button>

              {erroRec && <p className={styles.errorMsg}>E-mail não registrado</p>}

              <button className={styles.backLink} onClick={() => setTela('login')}>
                <ArrowLeft size={14} /> Voltar para Login
              </button>
            </>
          )}

          {/* ── NOVA SENHA ── */}
          {tela === 'nova-senha' && (
            <>
              <h1 className={styles.cardTitle} style={{ textAlign: 'left', fontSize: '1.4rem' }}>
                Redefinir senha
              </h1>
              <p className={styles.cardSubtitle}>Informe a nova senha</p>

              <InputField
                label="SENHA" type="password" value={novaSenha}
                onChange={v => { setNovaSenha(v); setErroSenhas(false); }}
                icon={<Lock size={16} />} error={erroSenhas} placeholder="••••••••••••"
              />

              <InputField
                label="CONFIRME A SENHA" type="password" value={confirmSenha}
                onChange={v => { setConfirmSenha(v); setErroSenhas(false); }}
                icon={<Lock size={16} />} error={erroSenhas} placeholder="••••••••••••"
              />

              <button className={styles.btnSubmit} onClick={handleRedefinir}>Redefinir Senha</button>

              {erroSenhas && <p className={styles.errorMsg}>As senhas não coincidem</p>}

              <button className={styles.backLink} onClick={() => setTela('login')}>
                <ArrowLeft size={14} /> Voltar para Login
              </button>
            </>
          )}

          {/* ── SUCESSO ── */}
          {tela === 'sucesso' && (
            <>
              <h1 className={styles.cardTitle} style={{ textAlign: 'left', fontSize: '1.4rem' }}>
                Redefinir senha
              </h1>
              <p className={styles.successMsg}>Senha alterada com sucesso!</p>

              <button className={styles.backLink} onClick={() => { setTela('login'); setNovaSenha(''); setConfirmSenha(''); setEmail(''); setSenha(''); }}>
                <ArrowLeft size={14} /> Voltar para Login
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
