import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, fmtDate } from '../lib/api';
import { Modal, Empty } from '../components/ui';
import { Icon } from '../components/icons';

const SPECIES = ['Canino', 'Felino', 'Ave', 'Roedor', 'Réptil', 'Outro'];

export default function Patients() {
  const nav = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [tutors, setTutors] = useState<any[]>([]);
  const [q, setQ] = useState('');
  const [show, setShow] = useState(false);
  const [form, setForm] = useState<any>({ species: 'Canino' });

  const load = () => api.get('/patients', { params: { q } }).then((r) => setItems(r.data));
  useEffect(() => { load(); }, [q]);
  useEffect(() => { api.get('/tutors').then((r) => setTutors(r.data)); }, []);

  const save = async () => {
    const payload = { ...form, weightKg: form.weightKg ? Number(form.weightKg) : undefined };
    if (form.id) await api.patch(`/patients/${form.id}`, payload);
    else await api.post('/patients', payload);
    setShow(false); setForm({ species: 'Canino' }); load();
  };

  return (
    <div>
      <div className="flex between wrap gap">
        <div><div className="title">Pacientes</div><p className="sub">Animais atendidos na clínica.</p></div>
        <button className="btn" onClick={() => { setForm({ species: 'Canino' }); setShow(true); }}>+ Novo paciente</button>
      </div>

      <div className="search-box mt2">
        <Icon name="search" size={16} />
        <input className="input" placeholder="Buscar por nome, espécie ou microchip…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <div className="card mt">
        {items.length === 0 ? <Empty text="Nenhum paciente cadastrado." /> : (
          <table className="table">
            <thead><tr><th>Paciente</th><th>Espécie</th><th className="hide-sm">Tutor</th><th className="hide-sm">Microchip</th><th></th></tr></thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id} style={{ cursor: 'pointer' }} onClick={() => nav(`/pacientes/${p.id}`)}>
                  <td><strong>{p.name}</strong><div className="muted" style={{ fontSize: 12 }}>{p.breed || '—'} {p.sex ? `· ${p.sex}` : ''}</div></td>
                  <td><span className="badge">{p.species}</span></td>
                  <td className="hide-sm">{p.tutor?.name || '—'}</td>
                  <td className="hide-sm muted" style={{ fontSize: 13 }}>{p.microchip || '—'}</td>
                  <td><button className="btn ghost sm">Abrir <Icon name="arrowRight" size={14} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {show && (
        <Modal title="Novo paciente" onClose={() => setShow(false)}
          footer={<><button className="btn ghost" onClick={() => setShow(false)}>Cancelar</button><button className="btn" onClick={save}>Salvar</button></>}>
          <div className="row">
            <div className="field"><label>Nome *</label><input value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="field"><label>Espécie *</label><select value={form.species} onChange={(e) => setForm({ ...form, species: e.target.value })}>{SPECIES.map((s) => <option key={s}>{s}</option>)}</select></div>
          </div>
          <div className="row">
            <div className="field"><label>Raça</label><input value={form.breed || ''} onChange={(e) => setForm({ ...form, breed: e.target.value })} /></div>
            <div className="field"><label>Sexo</label><select value={form.sex || ''} onChange={(e) => setForm({ ...form, sex: e.target.value })}><option value="">—</option><option>Macho</option><option>Fêmea</option></select></div>
          </div>
          <div className="row">
            <div className="field"><label>Nascimento</label><input type="date" value={form.birthDate || ''} onChange={(e) => setForm({ ...form, birthDate: e.target.value })} /></div>
            <div className="field"><label>Peso (kg)</label><input type="number" step="0.1" value={form.weightKg || ''} onChange={(e) => setForm({ ...form, weightKg: e.target.value })} /></div>
          </div>
          <div className="field"><label>Tutor</label><select value={form.tutorId || ''} onChange={(e) => setForm({ ...form, tutorId: e.target.value })}><option value="">Selecione…</option>{tutors.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
          <div className="field"><label>Microchip (RFID / ISO)</label><input value={form.microchip || ''} onChange={(e) => setForm({ ...form, microchip: e.target.value })} placeholder="982000123456789" /></div>
        </Modal>
      )}
    </div>
  );
}
