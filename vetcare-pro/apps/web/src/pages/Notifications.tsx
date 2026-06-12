import { useEffect, useState } from 'react';
import { api, fmtDateTime } from '../lib/api';
import { Modal, Empty } from '../components/ui';
import { Icon } from '../components/icons';

const KIND_BADGE: Record<string, string> = {
  lembrete: 'badge', vacina: 'badge green', retorno: 'badge amber',
  financeiro: 'badge blue', geral: 'badge gray',
};
const STATUS_BADGE: Record<string, string> = {
  pendente: 'badge amber', enviada: 'badge', lida: 'badge green',
};

export default function Notifications() {
  const [items, setItems] = useState<any[]>([]);
  const [tutors, setTutors] = useState<any[]>([]);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState<any>({ kind: 'lembrete', channel: 'app' });

  const load = () => api.get('/notifications').then((r) => setItems(r.data));
  useEffect(() => {
    load();
    api.get('/tutors').then((r) => setTutors(r.data)).catch(() => {});
  }, []);

  const save = async () => {
    if (!form.title || !form.message) return;
    await api.post('/notifications', form);
    setShow(false); setForm({ kind: 'lembrete', channel: 'app' }); load();
  };
  const setStatus = async (id: string, status: string) => {
    await api.patch(`/notifications/${id}/status`, { status }); load();
  };
  const remove = async (id: string) => {
    if (confirm('Excluir esta notificação?')) { await api.delete(`/notifications/${id}`); load(); }
  };

  return (
    <div>
      <div className="flex between wrap gap">
        <div><div className="title">Notificações</div><p className="sub">Alertas e comunicação com tutores.</p></div>
        <button className="btn" onClick={() => { setForm({ kind: 'lembrete', channel: 'app' }); setShow(true); }}>+ Nova notificação</button>
      </div>

      <div className="card mt">
        {items.length === 0 ? <Empty text="Nenhuma notificação enviada." /> : (
          <table className="table">
            <thead><tr><th>Mensagem</th><th className="hide-sm">Tipo</th><th className="hide-sm">Canal</th><th>Status</th><th className="hide-sm">Data</th><th></th></tr></thead>
            <tbody>
              {items.map((n) => (
                <tr key={n.id}>
                  <td><strong>{n.title}</strong><div className="muted" style={{ fontSize: 12 }}>{n.message}</div>{n.tutor && <div className="muted hide-sm" style={{ fontSize: 11 }}>→ {n.tutor.name}</div>}</td>
                  <td className="hide-sm"><span className={KIND_BADGE[n.kind] || 'badge gray'}>{n.kind}</span></td>
                  <td className="hide-sm muted">{n.channel}</td>
                  <td><span className={STATUS_BADGE[n.status] || 'badge gray'}>{n.status}</span></td>
                  <td className="hide-sm muted" style={{ fontSize: 12 }}>{fmtDateTime(n.createdAt)}</td>
                  <td className="flex gap">
                    {n.status !== 'enviada' && <button className="btn ghost sm" onClick={() => setStatus(n.id, 'enviada')}>Enviar</button>}
                    {n.status !== 'lida' && <button className="btn ghost sm" onClick={() => setStatus(n.id, 'lida')}><Icon name="check" size={14} /> Lida</button>}
                    <button className="btn ghost sm btn-icon" onClick={() => remove(n.id)} title="Excluir"><Icon name="trash" size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {show && (
        <Modal title="Nova notificação" onClose={() => setShow(false)}
          footer={<><button className="btn ghost" onClick={() => setShow(false)}>Cancelar</button><button className="btn" onClick={save}>Enviar</button></>}>
          <div className="field"><label>Tutor (opcional)</label>
            <select value={form.tutorId || ''} onChange={(e) => setForm({ ...form, tutorId: e.target.value || undefined })}>
              <option value="">— Geral —</option>
              {tutors.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div className="field"><label>Título *</label><input value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div className="field"><label>Mensagem *</label><textarea rows={3} value={form.message || ''} onChange={(e) => setForm({ ...form, message: e.target.value })} /></div>
          <div className="row">
            <div className="field"><label>Tipo</label>
              <select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })}>
                <option value="lembrete">Lembrete</option><option value="vacina">Vacina</option>
                <option value="retorno">Retorno</option><option value="financeiro">Financeiro</option>
                <option value="geral">Geral</option>
              </select>
            </div>
            <div className="field"><label>Canal</label>
              <select value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })}>
                <option value="app">App</option><option value="email">E-mail</option><option value="whatsapp">WhatsApp</option>
              </select>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
