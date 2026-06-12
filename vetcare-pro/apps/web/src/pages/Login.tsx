import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { Icon } from '../components/icons';

const FEATURES = [
  { title: 'Prontuário digital', desc: 'Histórico clínico completo por paciente' },
  { title: 'Agenda inteligente', desc: 'Horários livres e detecção de conflitos' },
  { title: 'Diagnóstico IA', desc: 'Hipóteses clínicas com motor de regras' },
  { title: 'Gestão financeira', desc: 'Faturamento, cobranças e relatórios' },
];

export default function Login() {
  const { login, register } = useAuth();
  const nav = useNavigate();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({ name: '', email: 'admin@vetcare.pro', password: 'admin123', crmv: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(''); setBusy(true);
    try {
      if (mode === 'login') await login(form.email, form.password);
      else await register(form);
      nav('/');
    } catch (e: any) {
      setErr(e.response?.data?.message || 'Não foi possível entrar. Verifique os dados.');
    } finally { setBusy(false); }
  };

  return (
    <div className="login-page">
      <div className="login-brand">
        <div className="login-brand-grid" />
        <div className="login-brand-content animate-in">
          <div className="sidebar-brand" style={{ padding: 0, marginBottom: 36 }}>
            <div className="sidebar-brand-icon">
              <Icon name="logo" size={22} />
            </div>
            <div>
              <div className="sidebar-brand-text" style={{ fontSize: 20 }}>VETCARE<span>-PRO</span></div>
              <div className="sidebar-brand-sub">Plataforma veterinária</div>
            </div>
          </div>

          <h1 style={{ fontSize: 36, fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.03em', maxWidth: 440 }}>
            Gestão clínica moderna para quem cuida de vidas.
          </h1>
          <p style={{ marginTop: 20, fontSize: 15, color: 'rgba(255,255,255,0.6)', maxWidth: 400, lineHeight: 1.65 }}>
            Centralize prontuários, agenda, diagnósticos assistidos e operações administrativas em uma única plataforma.
          </p>

          <div className="login-features">
            {FEATURES.map((f, i) => (
              <div key={f.title} className={`login-feature animate-in animate-in-delay-${i + 1}`}>
                <strong>{f.title}</strong>
                <span>{f.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="login-form-side">
        <form onSubmit={submit} className="login-form-card animate-in">
          <div className="login-tabs">
            <button type="button" className={`login-tab${mode === 'login' ? ' active' : ''}`} onClick={() => { setMode('login'); setErr(''); }}>
              Entrar
            </button>
            <button type="button" className={`login-tab${mode === 'register' ? ' active' : ''}`} onClick={() => { setMode('register'); setErr(''); }}>
              Criar conta
            </button>
          </div>

          <p className="sub" style={{ marginBottom: 24 }}>
            {mode === 'login' ? 'Acesse o painel da sua clínica.' : 'O primeiro cadastro vira administrador.'}
          </p>

          {mode === 'register' && (
            <div className="field">
              <label>Nome completo</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Dr(a). Nome Sobrenome" />
            </div>
          )}
          <div className="field">
            <label>E-mail</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="field">
            <label>Senha</label>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
          </div>
          {mode === 'register' && (
            <div className="field">
              <label>CRMV (opcional)</label>
              <input value={form.crmv} onChange={(e) => setForm({ ...form, crmv: e.target.value })} placeholder="CRMV-SP 00000" />
            </div>
          )}

          {err && <div className="badge red" style={{ width: '100%', marginBottom: 16, padding: '10px 14px', fontSize: 12 }}>{err}</div>}

          <button className="btn lg" style={{ width: '100%' }} disabled={busy}>
            {busy ? 'Aguarde…' : mode === 'login' ? 'Entrar na plataforma' : 'Criar conta'}
          </button>

          {mode === 'login' && (
            <div className="demo-hint">
              <strong>Demo:</strong> admin@vetcare.pro · senha <strong>admin123</strong>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
