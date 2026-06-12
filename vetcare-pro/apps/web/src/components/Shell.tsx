import { ReactNode, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { ChatWidget } from './ChatWidget';
import { Icon } from './icons';

const NAV = [
  { to: '/', label: 'Painel', icon: 'dashboard', end: true },
  { to: '/pacientes', label: 'Pacientes', icon: 'patients' },
  { to: '/tutores', label: 'Tutores', icon: 'tutors' },
  { to: '/agenda', label: 'Agenda', icon: 'calendar' },
  { to: '/diagnostico', label: 'Diagnóstico IA', icon: 'brain' },
  { to: '/notificacoes', label: 'Notificações', icon: 'bell' },
  { to: '/financeiro', label: 'Financeiro', icon: 'billing' },
  { to: '/estoque', label: 'Estoque', icon: 'inventory' },
];

export function Shell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <Icon name="logo" size={20} />
          </div>
          <div>
            <div className="sidebar-brand-text">VETCARE<span>-PRO</span></div>
            <div className="sidebar-brand-sub">Gestão veterinária</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            >
              <span className="sidebar-link-icon">
                <Icon name={n.icon} size={18} />
              </span>
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-user">
          <div className="sidebar-avatar">{user?.name?.[0]?.toUpperCase()}</div>
          <div className="grow" style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', textTransform: 'capitalize' }}>{user?.role}</div>
          </div>
          <button onClick={logout} title="Sair" className="btn ghost sm btn-icon" style={{ color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.12)' }}>
            <Icon name="logout" size={16} />
          </button>
        </div>
      </aside>

      {open && <div className="sidebar-backdrop" onClick={() => setOpen(false)} />}

      <main className="app-main">
        <header className="app-header flex between">
          <button className="btn ghost sm btn-icon burger-btn" onClick={() => setOpen(true)} style={{ display: 'none' }}>
            <Icon name="menu" size={18} />
          </button>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{user?.name}</div>
            <div className="sub" style={{ marginTop: 0, fontSize: 12 }}>Painel da clínica</div>
          </div>
          <span className="badge green"><span className="dot" /> Online</span>
        </header>
        <div className="app-content animate-in">{children}</div>
      </main>

      <ChatWidget />
    </div>
  );
}
