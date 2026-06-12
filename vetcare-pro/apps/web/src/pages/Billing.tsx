import { useEffect, useState } from 'react';
import { api, fmtMoney, fmtDate } from '../lib/api';
import { Modal, Empty, Stat } from '../components/ui';

const STATUS_BADGE: Record<string, string> = {
  aberta: 'badge amber', paga: 'badge green', cancelada: 'badge red',
};

export default function Billing() {
  const [items, setItems] = useState<any[]>([]);
  const [tutors, setTutors] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({ total: 0, paid: 0, open: 0, count: 0 });
  const [show, setShow] = useState(false);
  const [form, setForm] = useState<any>({});

  const load = () => {
    api.get('/billing').then((r) => setItems(r.data));
    api.get('/billing/summary').then((r) => setSummary(r.data));
  };
  useEffect(() => {
    load();
    api.get('/tutors').then((r) => setTutors(r.data)).catch(() => {});
  }, []);

  const save = async () => {
    if (!form.description || !form.amount) return;
    await api.post('/billing', { ...form, amount: Number(form.amount) });
    setShow(false); setForm({}); load();
  };
  const pay = async (id: string) => { await api.patch(`/billing/${id}/pay`, { method: 'pix' }); load(); };
  const remove = async (id: string) => {
    if (confirm('Excluir esta cobrança?')) { await api.delete(`/billing/${id}`); load(); }
  };

  return (
    <div>
      <div className="flex between wrap gap">
        <div><div className="title">Financeiro</div><p className="sub">Faturamento e cobranças da clínica.</p></div>
        <button className="btn" onClick={() => { setForm({}); setShow(true); }}>+ Nova cobrança</button>
      </div>

      <div className="flex gap wrap mt">
        <Stat label="Faturamento total" value={fmtMoney(summary.total)} icon="money" tone="teal" />
        <Stat label="Recebido" value={fmtMoney(summary.paid)} icon="activity" tone="green" />
        <Stat label="Em aberto" value={fmtMoney(summary.open)} icon="clock" tone="amber" />
        <Stat label="Cobranças" value={summary.count} icon="billing" tone="blue" />
      </div>

      <div className="card mt">
        {items.length === 0 ? <Empty text="Nenhuma cobrança registrada." /> : (
          <table className="table">
            <thead><tr><th>Descrição</th><th className="hide-sm">Tutor</th><th>Valor</th><th>Status</th><th className="hide-sm">Pago em</th><th></th></tr></thead>
            <tbody>
              {items.map((i) => (
                <tr key={i.id}>
                  <td><strong>{i.description}</strong><div className="muted hide-sm" style={{ fontSize: 12 }}>{i.method || '—'}</div></td>
                  <td className="hide-sm muted">{i.tutor?.name || '—'}</td>
                  <td><strong>{fmtMoney(i.amount)}</strong></td>
                  <td><span className={STATUS_BADGE[i.status] || 'badge gray'}>{i.status}</span></td>
                  <td className="hide-sm muted" style={{ fontSize: 12 }}>{i.paidAt ? fmtDate(i.paidAt) : '—'}</td>
                  <td className="flex gap">
                    {i.status === 'aberta' && <button className="btn sm" onClick={() => pay(i.id)}>Receber</button>}
                    <button className="btn ghost sm" onClick={() => remove(i.id)}>🗑</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {show && (
        <Modal title="Nova cobrança" onClose={() => setShow(false)}
          footer={<><button className="btn ghost" onClick={() => setShow(false)}>Cancelar</button><button className="btn" onClick={save}>Salvar</button></>}>
          <div className="field"><label>Tutor (opcional)</label>
            <select value={form.tutorId || ''} onChange={(e) => setForm({ ...form, tutorId: e.target.value || undefined })}>
              <option value="">— Avulso —</option>
              {tutors.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div className="field"><label>Descrição *</label><input value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Ex.: Consulta + vacina V10" /></div>
          <div className="row">
            <div className="field"><label>Valor (R$) *</label><input type="number" step="0.01" value={form.amount || ''} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></div>
            <div className="field"><label>Método</label>
              <select value={form.method || 'pix'} onChange={(e) => setForm({ ...form, method: e.target.value })}>
                <option value="pix">PIX</option><option value="cartao">Cartão</option>
                <option value="dinheiro">Dinheiro</option><option value="boleto">Boleto</option>
              </select>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
