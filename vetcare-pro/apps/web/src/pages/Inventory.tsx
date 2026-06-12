import { useEffect, useState } from 'react';
import { api, fmtMoney, fmtDate } from '../lib/api';
import { Modal, Empty, Stat } from '../components/ui';

export default function Inventory() {
  const [items, setItems] = useState<any[]>([]);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState<any>({});

  const load = () => api.get('/inventory').then((r) => setItems(r.data));
  useEffect(() => { load(); }, []);

  const low = items.filter((i) => i.quantity <= i.minQuantity);
  const stockValue = items.reduce((a, i) => a + (i.quantity * (i.unitPrice || 0)), 0);

  const save = async () => {
    if (!form.name) return;
    const payload = {
      ...form,
      quantity: Number(form.quantity || 0),
      minQuantity: Number(form.minQuantity || 0),
      unitPrice: Number(form.unitPrice || 0),
    };
    if (form.id) await api.patch(`/inventory/${form.id}`, payload);
    else await api.post('/inventory', payload);
    setShow(false); setForm({}); load();
  };
  const move = async (id: string, delta: number) => { await api.patch(`/inventory/${id}/move`, { delta }); load(); };
  const remove = async (id: string) => {
    if (confirm('Excluir este item?')) { await api.delete(`/inventory/${id}`); load(); }
  };

  return (
    <div>
      <div className="flex between wrap gap">
        <div><div className="title">Estoque</div><p className="sub">Medicamentos, vacinas e insumos.</p></div>
        <button className="btn" onClick={() => { setForm({}); setShow(true); }}>+ Novo item</button>
      </div>

      <div className="flex gap wrap mt">
        <Stat label="Itens cadastrados" value={items.length} icon="📦" tone="teal" />
        <Stat label="Estoque baixo" value={low.length} icon="⚠️" tone="amber" />
        <Stat label="Valor em estoque" value={fmtMoney(stockValue)} icon="💵" tone="green" />
      </div>

      {low.length > 0 && (
        <div className="card pad mt" style={{ borderLeft: '4px solid var(--amber)' }}>
          <strong>⚠️ Reposição necessária:</strong>{' '}
          <span className="muted">{low.map((i) => `${i.name} (${i.quantity})`).join(', ')}</span>
        </div>
      )}

      <div className="card mt">
        {items.length === 0 ? <Empty text="Nenhum item no estoque." /> : (
          <table className="table">
            <thead><tr><th>Item</th><th className="hide-sm">Categoria</th><th>Qtd.</th><th className="hide-sm">Preço un.</th><th className="hide-sm">Validade</th><th>Movimentar</th><th></th></tr></thead>
            <tbody>
              {items.map((i) => {
                const isLow = i.quantity <= i.minQuantity;
                return (
                  <tr key={i.id}>
                    <td><strong>{i.name}</strong>{isLow && <span className="badge amber" style={{ marginLeft: 6 }}>baixo</span>}</td>
                    <td className="hide-sm muted">{i.category || '—'}</td>
                    <td><span className={isLow ? 'badge amber' : 'badge green'}>{i.quantity}</span><span className="muted" style={{ fontSize: 11 }}> /mín {i.minQuantity}</span></td>
                    <td className="hide-sm">{fmtMoney(i.unitPrice)}</td>
                    <td className="hide-sm muted" style={{ fontSize: 12 }}>{i.expiresAt ? fmtDate(i.expiresAt) : '—'}</td>
                    <td className="flex gap">
                      <button className="btn ghost sm" onClick={() => move(i.id, -1)}>−</button>
                      <button className="btn ghost sm" onClick={() => move(i.id, 1)}>+</button>
                    </td>
                    <td className="flex gap">
                      <button className="btn ghost sm" onClick={() => { setForm(i); setShow(true); }}>Editar</button>
                      <button className="btn ghost sm" onClick={() => remove(i.id)}>🗑</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {show && (
        <Modal title={form.id ? 'Editar item' : 'Novo item'} onClose={() => setShow(false)}
          footer={<><button className="btn ghost" onClick={() => setShow(false)}>Cancelar</button><button className="btn" onClick={save}>Salvar</button></>}>
          <div className="field"><label>Nome *</label><input value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="row">
            <div className="field"><label>Categoria</label><input value={form.category || ''} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Vacina, medicamento…" /></div>
            <div className="field"><label>Validade</label><input type="date" value={form.expiresAt ? String(form.expiresAt).slice(0, 10) : ''} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} /></div>
          </div>
          <div className="row">
            <div className="field"><label>Quantidade</label><input type="number" value={form.quantity ?? ''} onChange={(e) => setForm({ ...form, quantity: e.target.value })} /></div>
            <div className="field"><label>Estoque mínimo</label><input type="number" value={form.minQuantity ?? ''} onChange={(e) => setForm({ ...form, minQuantity: e.target.value })} /></div>
          </div>
          <div className="field"><label>Preço unitário (R$)</label><input type="number" step="0.01" value={form.unitPrice ?? ''} onChange={(e) => setForm({ ...form, unitPrice: e.target.value })} /></div>
        </Modal>
      )}
    </div>
  );
}
