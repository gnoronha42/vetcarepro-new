import { useState, useRef, useEffect } from 'react';
import { api } from '../lib/api';

interface Msg { from: 'bot' | 'user'; text: string; }

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    { from: 'bot', text: 'Olá! Sou o assistente do VETCARE-PRO. Posso ajudar com horários, agendamento, vacinas, microchip e mais. O que você precisa?' },
  ]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, open]);

  const send = async () => {
    const q = text.trim();
    if (!q || loading) return;
    setMsgs((m) => [...m, { from: 'user', text: q }]);
    setText(''); setLoading(true);
    try {
      const { data } = await api.post('/chatbot', { message: q });
      setMsgs((m) => [...m, { from: 'bot', text: data.answer }]);
    } catch {
      setMsgs((m) => [...m, { from: 'bot', text: 'Desculpe, tive um problema. Tente novamente.' }]);
    } finally { setLoading(false); }
  };

  return (
    <>
      <button onClick={() => setOpen(!open)} aria-label="Abrir assistente" style={{
        position: 'fixed', right: 22, bottom: 22, width: 56, height: 56, borderRadius: '50%',
        background: 'var(--coral)', color: '#fff', fontSize: 24, boxShadow: 'var(--shadow)', zIndex: 60,
      }}>{open ? '✕' : '💬'}</button>

      {open && (
        <div style={{
          position: 'fixed', right: 22, bottom: 88, width: 340, maxWidth: 'calc(100vw - 32px)',
          height: 460, maxHeight: '70vh', background: '#fff', borderRadius: 16,
          boxShadow: '0 16px 48px rgba(0,0,0,.22)', display: 'flex', flexDirection: 'column', zIndex: 60,
          overflow: 'hidden', border: '1px solid var(--line)',
        }}>
          <div style={{ background: 'var(--teal-700)', color: '#fff', padding: '14px 16px' }}>
            <strong>Assistente VETCARE</strong>
            <div style={{ fontSize: 12, opacity: .8 }}>Dúvidas frequentes</div>
          </div>
          <div className="grow" style={{ padding: 14, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {msgs.map((m, i) => (
              <div key={i} style={{
                alignSelf: m.from === 'user' ? 'flex-end' : 'flex-start',
                background: m.from === 'user' ? 'var(--teal-600)' : 'var(--teal-50)',
                color: m.from === 'user' ? '#fff' : 'var(--ink)',
                padding: '9px 13px', borderRadius: 13, maxWidth: '82%', fontSize: 14, lineHeight: 1.45,
              }}>{m.text}</div>
            ))}
            {loading && <div className="muted" style={{ fontSize: 13 }}>digitando…</div>}
            <div ref={endRef} />
          </div>
          <div className="flex gap" style={{ padding: 12, borderTop: '1px solid var(--line)' }}>
            <input className="input" placeholder="Escreva sua dúvida…" value={text}
              onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} />
            <button className="btn" onClick={send} disabled={loading}>➤</button>
          </div>
        </div>
      )}
    </>
  );
}
