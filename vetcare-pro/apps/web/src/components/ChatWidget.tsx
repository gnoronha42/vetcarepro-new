import { useState, useRef, useEffect } from 'react';
import { api } from '../lib/api';
import { Icon } from './icons';

interface Msg { from: 'bot' | 'user'; text: string; }

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    { from: 'bot', text: 'Olá! Sou o assistente do VETCARE-PRO. Posso ajudar com horários, agendamento, vacinas, microchip e mais.' },
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
      <button onClick={() => setOpen(!open)} aria-label="Abrir assistente" className="chat-fab">
        <Icon name={open ? 'close' : 'chat'} size={22} />
      </button>

      {open && (
        <div className="chat-panel">
          <div className="chat-header">
            <strong style={{ fontSize: 14 }}>Assistente VETCARE</strong>
            <div style={{ fontSize: 12, opacity: 0.6, marginTop: 2 }}>Dúvidas frequentes</div>
          </div>
          <div className="grow" style={{ padding: 16, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {msgs.map((m, i) => (
              <div key={i} className={`chat-bubble ${m.from}`}>{m.text}</div>
            ))}
            {loading && <div className="muted" style={{ fontSize: 12, padding: '4px 0' }}>digitando…</div>}
            <div ref={endRef} />
          </div>
          <div className="flex gap" style={{ padding: 14, borderTop: '1px solid var(--line-soft)' }}>
            <input className="input" placeholder="Escreva sua dúvida…" value={text}
              onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} />
            <button className="btn btn-icon" onClick={send} disabled={loading}>
              <Icon name="send" size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
