import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';

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
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr' }} className="vc-login">
      {/* Lado da marca */}
      <div style={{ background: 'linear-gradient(155deg, var(--teal-700), var(--teal-900))',
        color: '#fff', padding: 48, display: 'flex', flexDirection: 'column', justifyContent: 'center' }} className="vc-brand">
        <div className="flex gap" style={{ marginBottom: 28 }}>
          <div style={{ width: 46, height: 46, borderRadius: 12, background: 'var(--teal-500)', display: 'grid', placeItems: 'center', fontSize: 24 }}>🐾</div>
          <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-.02em' }}>VETCARE<span style={{ color: 'var(--teal-500)' }}>-PRO</span></div>
        </div>
        <h1 style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.15, letterSpacing: '-.03em', maxWidth: 420 }}>
          O sistema que cuida da sua clínica enquanto você cuida dos pets.
        </h1>
        <p style={{ marginTop: 18, opacity: .82, maxWidth: 400, lineHeight: 1.6 }}>
          Prontuário digital, agendamento inteligente, diagnóstico assistido por IA, faturamento e BI — tudo em um só lugar.
        </p>
        <div className="flex gap wrap" style={{ marginTop: 30 }}>
          {['Prontuário', 'Agenda IA', 'Diagnóstico', 'Financeiro', 'Estoque', 'BI'].map((t) => (
            <span key={t} style={{ padding: '6px 12px', background: 'rgba(255,255,255,.12)', borderRadius: 999, fontSize: 13, fontWeight: 600 }}>{t}</span>
          ))}
        </div>
      </div>

      {/* Lado do formulário */}
      <div style={{ display: 'grid', placeItems: 'center', padding: 32 }}>
        <form onSubmit={submit} style={{ width: '100%', maxWidth: 360 }}>
          <div className="title">{mode === 'login' ? 'Entrar' : 'Criar conta'}</div>
          <p className="sub" style={{ marginBottom: 22 }}>
            {mode === 'login' ? 'Acesse o painel da sua clínica.' : 'Cadastre o primeiro usuário (vira administrador).'}
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

          {err && <div className="badge red" style={{ width: '100%', marginBottom: 12, padding: '8px 12px' }}>{err}</div>}

          <button className="btn" style={{ width: '100%' }} disabled={busy}>
            {busy ? 'Aguarde…' : mode === 'login' ? 'Entrar' : 'Criar conta'}
          </button>

          <p className="sub" style={{ textAlign: 'center', marginTop: 16 }}>
            {mode === 'login' ? 'Ainda não tem conta? ' : 'Já tem conta? '}
            <button type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setErr(''); }}
              style={{ background: 'none', color: 'var(--teal-600)', fontWeight: 700 }}>
              {mode === 'login' ? 'Cadastre-se' : 'Entrar'}
            </button>
          </p>

          {mode === 'login' && (
            <div className="card pad" style={{ marginTop: 18, background: 'var(--teal-50)', borderColor: 'var(--teal-100)' }}>
              <div className="sub"><strong>Demo:</strong> admin@vetcare.pro · senha <strong>admin123</strong></div>
            </div>
          )}
        </form>
      </div>

      <style>{`@media (max-width: 820px){ .vc-login{ grid-template-columns: 1fr !important; } .vc-brand{ display: none !important; } }`}</style>
    </div>
  );
}
