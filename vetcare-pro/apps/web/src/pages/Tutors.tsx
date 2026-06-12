import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Modal, Empty } from '../components/ui';
import { Icon } from '../components/icons';

export default function Tutors() {
  const [items, setItems] = useState<any[]>([]);
  const [q, setQ] = useState('');
  const [show, setShow] = useState(false);
  const [form, setForm] = useState<any>({});

  const load = () => api.get('/tutors', { params: { q } }).then((r) => setItems(r.data));
  useEffect(() => { load(); }, [q]);

  const save = async () => {
    if (form.id) await api.patch(`/tutors/${form.id}`, form);
    else await api.post('/tutors', form);
    setShow(false); setForm({}); load();
  };
  const remove = async (id: string) => { if (confirm('Excluir este tutor?')) { await api.delete(`/tutors/${id}`); load(); } };

  return (
    <div>
      <div className="flex between wrap gap">
        <div><div className="title">Tutores</div><p className="sub">Responsáveis pelos pacientes.</p></div>
        <button className="btn" onClick={() => { setForm({}); setShow(true); }}>+ Novo tutor</button>
      </div>

      <div className="search-box mt2">
        <Icon name="search" size={16} />
        <input className="input" placeholder="Buscar por nome ou telefone…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <div className="card mt">
        {items.length === 0 ? <Empty text="Nenhum tutor cadastrado." /> : (
          <table className="table">
            <thead><tr><th>Nome</th><th className="hide-sm">Contato</th><th className="hide-sm">Documento</th><th>Pets</th><th></th></tr></thead>
            <tbody>
              {items.map((t) => (
                <tr key={t.id}>
                  <td><strong>{t.name}</strong><div className="muted hide-sm" style={{ fontSize: 12 }}>{t.email}</div></td>
                  <td className="hide-sm">{t.phone || '—'}</td>
                  <td className="hide-sm muted">{t.document || '—'}</td>
                  <td><span className="badge">{t.patients?.length ?? 0}</span></td>
                  <td className="flex gap">
                    <button className="btn ghost sm" onClick={() => { setForm(t); setShow(true); }}><Icon name="edit" size={14} /> Editar</button>
                    <button className="btn ghost sm btn-icon" onClick={() => remove(t.id)} title="Excluir"><Icon name="trash" size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {show && (
        <Modal title={form.id ? 'Editar tutor' : 'Novo tutor'} onClose={() => setShow(false)}
          footer={<><button className="btn ghost" onClick={() => setShow(false)}>Cancelar</button><button className="btn" onClick={save}>Salvar</button></>}>
          <div className="field"><label>Nome *</label><input value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="row">
            <div className="field"><label>Telefone</label><input value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div className="field"><label>E-mail</label><input value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          </div>
          <div className="field"><label>CPF</label><input value={form.document || ''} onChange={(e) => setForm({ ...form, document: e.target.value })} /></div>
          <div className="field"><label>Endereço</label><input value={form.address || ''} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
        </Modal>
      )}
    </div>
  );
}
