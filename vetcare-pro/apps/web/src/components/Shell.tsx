import { ReactNode, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { ChatWidget } from './ChatWidget';

const NAV = [
  { to: '/', label: 'Painel', icon: '📊', end: true },
  { to: '/pacientes', label: 'Pacientes', icon: '🐾' },
  { to: '/tutores', label: 'Tutores', icon: '👥' },
  { to: '/agenda', label: 'Agenda', icon: '📅' },
  { to: '/diagnostico', label: 'Diagnóstico IA', icon: '🧠' },
  { to: '/notificacoes', label: 'Notificações', icon: '🔔' },
  { to: '/financeiro', label: 'Financeiro', icon: '💳' },
  { to: '/estoque', label: 'Estoque', icon: '📦' },
];

export function Shell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: 232, background: 'var(--teal-900)', color: '#fff', padding: '20px 14px',
        position: 'fixed', top: 0, bottom: 0, left: open ? 0 : -240, transition: '.25s', zIndex: 40,
      }} className="vc-side">
        <div className="flex gap" style={{ padding: '4px 8px 22px' }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--teal-500)',
            display: 'grid', placeItems: 'center', fontSize: 18 }}>🐾</div>
          <div>
            <div style={{ fontWeight: 800, letterSpacing: '-.02em' }}>VETCARE<span style={{ color: 'var(--teal-500)' }}>-PRO</span></div>
            <div style={{ fontSize: 11, opacity: .65 }}>Gestão veterinária</div>
          </div>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} onClick={() => setOpen(false)}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 11, padding: '10px 12px',
                borderRadius: 10, fontWeight: 600, fontSize: 14,
                background: isActive ? 'rgba(255,255,255,.14)' : 'transparent',
                color: isActive ? '#fff' : 'rgba(255,255,255,.78)',
              })}>
              <span style={{ fontSize: 17 }}>{n.icon}</span> {n.label}
            </NavLink>
          ))}
        </nav>
        <div style={{ position: 'absolute', bottom: 16, left: 14, right: 14 }}>
          <div className="flex gap" style={{ padding: '10px 12px', background: 'rgba(0,0,0,.18)', borderRadius: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--coral)',
              display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 13 }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="grow" style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
              <div style={{ fontSize: 11, opacity: .6, textTransform: 'capitalize' }}>{user?.role}</div>
            </div>
            <button onClick={logout} title="Sair" className="btn ghost sm"
              style={{ color: '#fff', borderColor: 'rgba(255,255,255,.2)', padding: '4px 8px' }}>↩</button>
          </div>
        </div>
      </aside>

      {open && <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', zIndex: 35 }} className="vc-backdrop" />}

      {/* Conteúdo */}
      <main className="vc-main" style={{ flex: 1, marginLeft: 232 }}>
        <header className="flex between" style={{
          padding: '14px 24px', background: '#fff', borderBottom: '1px solid var(--line)',
          position: 'sticky', top: 0, zIndex: 30,
        }}>
          <button className="btn ghost sm vc-burger" onClick={() => setOpen(true)} style={{ display: 'none' }}>☰</button>
          <div className="sub">Bem-vindo(a) de volta 👋</div>
          <span className="badge green">● Sistema online</span>
        </header>
        <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>{children}</div>
      </main>

      <ChatWidget />

      <style>{`
        @media (min-width: 861px) { .vc-side { left: 0 !important; } }
        @media (max-width: 860px) {
          .vc-main { margin-left: 0 !important; }
          .vc-burger { display: inline-flex !important; }
        }
      `}</style>
    </div>
  );
}
