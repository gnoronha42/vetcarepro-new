import { useEffect, useState } from 'react';
import { api, fmtDateTime } from '../lib/api';
import { Modal, Empty } from '../components/ui';
import { Icon } from '../components/icons';

export default function Agenda() {
  const [items, setItems] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState<any>({ type: 'consulta', durationMin: 30 });
  const [slots, setSlots] = useState<string[]>([]);
  const [slotDate, setSlotDate] = useState('');
  const [err, setErr] = useState('');

  const load = () => api.get('/appointments').then((r) => setItems(r.data));
  useEffect(() => { load(); api.get('/patients').then((r) => setPatients(r.data)); }, []);

  const findSlots = async (date: string) => {
    setSlotDate(date);
    if (!date) return setSlots([]);
    const { data } = await api.get('/appointments/slots', { params: { date, duration: form.durationMin } });
    setSlots(data.freeSlots);
  };

  const save = async () => {
    setErr('');
    try {
      await api.post('/appointments', { ...form, durationMin: Number(form.durationMin) });
      setShow(false); setForm({ type: 'consulta', durationMin: 30 }); setSlots([]); load();
    } catch (e: any) { setErr(e.response?.data?.message || 'Erro ao agendar.'); }
  };

  const setStatus = async (id: string, status: string) => { await api.patch(`/appointments/${id}`, { status }); load(); };
  const cancel = async (id: string) => { if (confirm('Cancelar agendamento?')) { await api.patch(`/appointments/${id}`, { status: 'cancelado' }); load(); } };

  const statusColor: Record<string, string> = { agendado: 'gray', confirmado: 'green', atendido: 'teal', cancelado: 'red', faltou: 'amber' };

  return (
    <div>
      <div className="flex between wrap gap">
        <div><div className="title">Agenda</div><p className="sub">Agendamento inteligente com detecção de conflitos.</p></div>
        <button className="btn" onClick={() => { setForm({ type: 'consulta', durationMin: 30 }); setSlots([]); setShow(true); }}>+ Agendar</button>
      </div>

      <div className="card mt2">
        {items.length === 0 ? <Empty text="Nenhum agendamento." /> : (
          <table className="table">
            <thead><tr><th>Quando</th><th>Paciente</th><th>Tipo</th><th className="hide-sm">Vet.</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {items.map((a) => (
                <tr key={a.id}>
                  <td><strong>{fmtDateTime(a.startsAt)}</strong><div className="muted" style={{ fontSize: 12 }}>{a.durationMin} min</div></td>
                  <td>{a.patient?.name}</td>
                  <td style={{ textTransform: 'capitalize' }}>{a.type}</td>
                  <td className="hide-sm muted">{a.vetName || '—'}</td>
                  <td><span className={`badge ${statusColor[a.status] || 'gray'}`} style={{ textTransform: 'capitalize' }}>{a.status}</span></td>
                  <td className="flex gap">
                    {a.status === 'agendado' && <button className="btn ghost sm" onClick={() => setStatus(a.id, 'confirmado')}>Confirmar</button>}
                    {['agendado', 'confirmado'].includes(a.status) && <button className="btn ghost sm" onClick={() => setStatus(a.id, 'atendido')}>Atendido</button>}
                    {a.status !== 'cancelado' && (
                      <button className="btn ghost sm btn-icon" onClick={() => cancel(a.id)} title="Cancelar">
                        <Icon name="close" size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {show && (
        <Modal title="Novo agendamento" onClose={() => setShow(false)}
          footer={<><button className="btn ghost" onClick={() => setShow(false)}>Cancelar</button><button className="btn" onClick={save} disabled={!form.patientId || !form.startsAt}>Agendar</button></>}>
          <div className="field"><label>Paciente *</label><select value={form.patientId || ''} onChange={(e) => setForm({ ...form, patientId: e.target.value })}><option value="">Selecione…</option>{patients.map((p) => <option key={p.id} value={p.id}>{p.name} — {p.tutor?.name || 's/ tutor'}</option>)}</select></div>
          <div className="row">
            <div className="field"><label>Tipo</label><select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}><option>consulta</option><option>retorno</option><option>vacina</option><option>exame</option><option>cirurgia</option><option>banho</option></select></div>
            <div className="field"><label>Duração (min)</label><select value={form.durationMin} onChange={(e) => setForm({ ...form, durationMin: e.target.value })}><option>15</option><option>30</option><option>45</option><option>60</option><option>90</option></select></div>
          </div>
          <div className="field"><label>Ver horários livres do dia</label><input type="date" value={slotDate} onChange={(e) => findSlots(e.target.value)} /></div>
          {slotDate && (
            <div className="field">
              <label>Horários sugeridos</label>
              {slots.length === 0 ? <p className="sub">Sem horários livres neste dia.</p> : (
                <div className="flex gap wrap">
                  {slots.slice(0, 14).map((s) => (
                    <button key={s} type="button" className={`btn sm ${form.startsAt === s ? '' : 'ghost'}`} onClick={() => setForm({ ...form, startsAt: s })}>
                      {new Date(s).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          <div className="field"><label>Ou escolha data/hora manualmente</label><input type="datetime-local" onChange={(e) => setForm({ ...form, startsAt: new Date(e.target.value).toISOString() })} /></div>
          <div className="field"><label>Veterinário</label><input value={form.vetName || ''} onChange={(e) => setForm({ ...form, vetName: e.target.value })} /></div>
          {err && <div className="badge red" style={{ padding: '8px 12px', width: '100%' }}>{err}</div>}
        </Modal>
      )}
    </div>
  );
}
