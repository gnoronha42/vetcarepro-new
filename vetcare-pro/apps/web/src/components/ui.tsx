import { ReactNode } from 'react';
import { Icon } from './icons';

export function Modal({ title, onClose, children, footer, size = 'md' }: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'md' | 'lg';
}) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className={`modal modal-${size}`} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="modal-header">
          <strong>{title}</strong>
          <button className="btn ghost sm btn-icon" onClick={onClose} aria-label="Fechar">
            <Icon name="close" size={16} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

const STAT_THEMES: Record<string, { accent: string; bg: string }> = {
  teal: { accent: 'var(--accent)', bg: 'var(--accent-soft)' },
  green: { accent: 'var(--success)', bg: 'var(--success-soft)' },
  amber: { accent: 'var(--warning)', bg: 'var(--warning-soft)' },
  coral: { accent: 'var(--danger)', bg: 'var(--danger-soft)' },
  blue: { accent: 'var(--info)', bg: 'var(--info-soft)' },
};

export function Stat({ label, value, icon, tone = 'teal' }: {
  label: string; value: ReactNode; icon: string; tone?: string;
}) {
  const theme = STAT_THEMES[tone] || STAT_THEMES.teal;
  return (
    <div
      className="stat-card animate-in"
      style={{ '--stat-accent': theme.accent, '--stat-bg': theme.bg } as React.CSSProperties}
    >
      <div className="flex between">
        <span className="stat-label">{label}</span>
        <div className="stat-icon">
          <Icon name={icon} size={18} />
        </div>
      </div>
      <div className="stat-value">{value}</div>
    </div>
  );
}

export function Empty({ text }: { text: string }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <Icon name="search" size={22} />
      </div>
      <p>{text}</p>
    </div>
  );
}

export function Loading({ text = 'Carregando…' }: { text?: string }) {
  return (
    <div className="empty-state">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
        <div className="skeleton" style={{ width: 48, height: 48, borderRadius: 12 }} />
        <div className="skeleton" style={{ width: 160, height: 14 }} />
        <p className="muted" style={{ fontSize: 13 }}>{text}</p>
      </div>
    </div>
  );
}
