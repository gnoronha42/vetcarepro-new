import { ReactNode } from 'react';

export function Modal({ title, onClose, children, footer }: {
  title: string; onClose: () => void; children: ReactNode; footer?: ReactNode;
}) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="flex between pad" style={{ borderBottom: '1px solid var(--line)' }}>
          <strong style={{ fontSize: 17 }}>{title}</strong>
          <button className="btn ghost sm" onClick={onClose}>✕</button>
        </div>
        <div className="pad">{children}</div>
        {footer && (
          <div className="flex between gap pad" style={{ borderTop: '1px solid var(--line)' }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function Stat({ label, value, icon, tone = 'teal' }: {
  label: string; value: ReactNode; icon: string; tone?: string;
}) {
  const colors: Record<string, string> = {
    teal: 'var(--teal-600)', coral: 'var(--coral)', amber: 'var(--amber)', green: 'var(--green)',
  };
  return (
    <div className="card pad" style={{ flex: 1, minWidth: 150 }}>
      <div className="flex between">
        <span className="sub">{label}</span>
        <span style={{ fontSize: 20 }}>{icon}</span>
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, marginTop: 6, color: colors[tone] }}>{value}</div>
    </div>
  );
}

export function Empty({ text }: { text: string }) {
  return <div className="pad muted" style={{ textAlign: 'center', padding: '40px 20px' }}>🐾 {text}</div>;
}
