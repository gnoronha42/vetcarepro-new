import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api, fmtDate, fmtDateTime } from '../lib/api';
import { Modal, Empty } from '../components/ui';

export default function PatientDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [p, setP] = useState<any>(null);
  const [show, setShow] = useState(false);
  const [rec, setRec] = useState<any>({ type: 'consulta' });
  const [ai, setAi] = useState<any>(null);
  const [aiBusy, setAiBusy] = useState(false);

  const load = () => api.get(`/patients/${id}`).then((r) => setP(r.data));
  useEffect(() => { load(); }, [id]);
  if (!p) return <Empty text="Carregando prontuário…" />;

  const age = p.birthDate ? Math.max(0, new Date().getFullYear() - new Date(p.birthDate).getFullYear()) : null;

  const suggestAI = async () => {
    if (!rec.symptoms) return;
    setAiBusy(true); setAi(null);
    try {
      const { data } = await api.post('/ai/diagnose', { species: p.species, symptoms: rec.symptoms, notes: rec.anamnesis });
      setAi(data);
    } finally { setAiBusy(false); }
  };

  const saveRec = async () => {
    await api.post('/records', {
      patientId: p.id, ...rec,
      weightKg: rec.weightKg ? Number(rec.weightKg) : undefined,
      temperatureC: rec.temperatureC ? Number(rec.temperatureC) : undefined,
      aiSuggestion: ai?.results?.[0] ? `${ai.results[0].condition} (${ai.results[0].confidence}%)` : undefined,
    });
    setShow(false); setRec({ type: 'consulta' }); setAi(null); load();
  };

  return (
    <div>
      <Link to="/pacientes" className="btn ghost sm">← Pacientes</Link>

      <div className="card pad mt2 flex between wrap gap">
        <div className="flex gap">
          <div style={{ width: 60, height: 60, borderRadius: 16, background: 'var(--teal-50)', display: 'grid', placeItems: 'center', fontSize: 30 }}>
            {p.species === 'Felino' ? '🐱' : p.species === 'Ave' ? '🦜' : '🐶'}
          </div>
          <div>
            <div className="title">{p.name}</div>
            <div className="sub">{p.species} {p.breed ? `· ${p.breed}` : ''} {p.sex ? `· ${p.sex}` : ''} {age !== null ? `· ${age} ano(s)` : ''}</div>
            <div className="flex gap wrap" style={{ marginTop: 8 }}>
              {p.weightKg && <span className="badge">⚖ {p.weightKg} kg</span>}
              {p.microchip && <span className="badge gray">🔖 {p.microchip}</span>}
              {p.tutor && <span className="badge coral">👤 {p.tutor.name}</span>}
            </div>
          </div>
        </div>
        <button className="btn" onClick={() => setShow(true)}>+ Nova consulta</button>
      </div>

      <div className="mt2"><strong style={{ fontSize: 17 }}>Histórico clínico</strong></div>
      <div className="mt">
        {(!p.records || p.records.length === 0) ? <Empty text="Nenhum registro no prontuário." /> : p.records.map((r: any) => (
          <div key={r.id} className="card pad" style={{ marginBottom: 12, borderLeft: '4px solid var(--teal-500)' }}>
            <div className="flex between wrap">
              <span className="badge" style={{ textTransform: 'capitalize' }}>{r.type}</span>
              <span className="muted" style={{ fontSize: 13 }}>{fmtDateTime(r.createdAt)} {r.vetName ? `· ${r.vetName}` : ''}</span>
            </div>
            {r.anamnesis && <p className="mt" style={{ fontSize: 14 }}><strong>Anamnese:</strong> {r.anamnesis}</p>}
            {r.symptoms && <p style={{ fontSize: 14 }}><strong>Sinais:</strong> {r.symptoms}</p>}
            {r.physicalExam && <p style={{ fontSize: 14 }}><strong>Exame físico:</strong> {r.physicalExam}</p>}
            {r.diagnosis && <p style={{ fontSize: 14 }}><strong>Diagnóstico:</strong> {r.diagnosis}</p>}
            {r.aiSuggestion && <p style={{ fontSize: 13 }} className="muted">🧠 IA sugeriu: {r.aiSuggestion}</p>}
            {r.treatment && <p style={{ fontSize: 14 }}><strong>Conduta:</strong> {r.treatment}</p>}
            <div className="flex gap wrap muted" style={{ fontSize: 13, marginTop: 6 }}>
              {r.weightKg && <span>⚖ {r.weightKg} kg</span>}
              {r.temperatureC && <span>🌡 {r.temperatureC} °C</span>}
              {r.followUpDate && <span>↩ retorno {fmtDate(r.followUpDate)}</span>}
            </div>
          </div>
        ))}
      </div>

      {show && (
        <Modal
          title={`Nova consulta — ${p.name}`}
          size="lg"
          onClose={() => setShow(false)}
          footer={<><button className="btn ghost" onClick={() => setShow(false)}>Cancelar</button><button className="btn" onClick={saveRec}>Salvar consulta</button></>}
        >
          <div className="field"><label>Tipo</label><select value={rec.type} onChange={(e) => setRec({ ...rec, type: e.target.value })}><option>consulta</option><option>vacina</option><option>exame</option><option>cirurgia</option><option>retorno</option></select></div>
          <div className="field"><label>Anamnese / queixa</label><textarea rows={2} value={rec.anamnesis || ''} onChange={(e) => setRec({ ...rec, anamnesis: e.target.value })} /></div>
          <div className="field">
            <label>Sinais clínicos (separe por vírgula)</label>
            <textarea rows={2} value={rec.symptoms || ''} onChange={(e) => setRec({ ...rec, symptoms: e.target.value })} placeholder="vômito, apatia, anorexia…" />
            <button className="btn coral sm" style={{ marginTop: 8 }} onClick={suggestAI} disabled={aiBusy || !rec.symptoms}>
              🧠 {aiBusy ? 'Analisando…' : 'Sugerir diagnóstico (IA)'}
            </button>
          </div>

          {ai && (
            <div className="card pad" style={{ background: 'var(--teal-50)', borderColor: 'var(--teal-100)', marginBottom: 14 }}>
              <strong style={{ fontSize: 14 }}>Sugestões da IA</strong>
              {ai.results.length === 0 ? <p className="sub mt">Nenhuma hipótese reconhecida. Refine os sinais.</p> :
                ai.results.map((res: any, i: number) => (
                  <div key={i} style={{ marginTop: 10, paddingTop: 10, borderTop: i ? '1px solid var(--teal-100)' : 'none' }}>
                    <div className="flex between">
                      <strong style={{ fontSize: 14 }}>{res.condition}</strong>
                      <span className={`badge ${res.hasRedFlags ? 'red' : 'green'}`}>{res.confidence}%{res.hasRedFlags ? ' ⚠' : ''}</span>
                    </div>
                    <p className="sub" style={{ marginTop: 4 }}>{res.recommendation}</p>
                    <p className="muted" style={{ fontSize: 12, marginTop: 4 }}>Exames: {res.suggestedExams.join(', ')}</p>
                  </div>
                ))}
              <p className="muted" style={{ fontSize: 11, marginTop: 10, fontStyle: 'italic' }}>{ai.disclaimer}</p>
            </div>
          )}

          <div className="field"><label>Exame físico</label><textarea rows={2} value={rec.physicalExam || ''} onChange={(e) => setRec({ ...rec, physicalExam: e.target.value })} /></div>
          <div className="field"><label>Diagnóstico</label><input value={rec.diagnosis || ''} onChange={(e) => setRec({ ...rec, diagnosis: e.target.value })} /></div>
          <div className="field"><label>Conduta / prescrição</label><textarea rows={2} value={rec.treatment || ''} onChange={(e) => setRec({ ...rec, treatment: e.target.value })} /></div>
          <div className="row">
            <div className="field"><label>Peso (kg)</label><input type="number" step="0.1" value={rec.weightKg || ''} onChange={(e) => setRec({ ...rec, weightKg: e.target.value })} /></div>
            <div className="field"><label>Temp. (°C)</label><input type="number" step="0.1" value={rec.temperatureC || ''} onChange={(e) => setRec({ ...rec, temperatureC: e.target.value })} /></div>
          </div>
          <div className="field"><label>Data de retorno</label><input type="date" value={rec.followUpDate || ''} onChange={(e) => setRec({ ...rec, followUpDate: e.target.value })} /></div>
        </Modal>
      )}
    </div>
  );
}
