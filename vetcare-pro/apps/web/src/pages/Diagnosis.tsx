import { useState } from 'react';
import { api } from '../lib/api';
import { Icon } from '../components/icons';

export default function Diagnosis() {
  const [form, setForm] = useState({ species: 'Canino', symptoms: '', notes: '' });
  const [res, setRes] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  const run = async () => {
    if (!form.symptoms.trim()) return;
    setBusy(true); setRes(null);
    try { const { data } = await api.post('/ai/diagnose', form); setRes(data); }
    finally { setBusy(false); }
  };

  return (
    <div>
      <div className="title">Diagnóstico assistido por IA</div>
      <p className="sub">Sistema de apoio à decisão clínica. Informe os sinais e receba hipóteses ranqueadas.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="mt2 vc-grid">
        <div className="card pad">
          <div className="row">
            <div className="field"><label>Espécie</label><select value={form.species} onChange={(e) => setForm({ ...form, species: e.target.value })}><option>Canino</option><option>Felino</option><option>Outro</option></select></div>
          </div>
          <div className="field"><label>Sinais clínicos *</label><textarea rows={4} value={form.symptoms} onChange={(e) => setForm({ ...form, symptoms: e.target.value })} placeholder="Ex.: vômito, diarreia com sangue, apatia, filhote não vacinado…" /></div>
          <div className="field"><label>Observações</label><textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
          <button className="btn" onClick={run} disabled={busy || !form.symptoms.trim()} style={{ width: '100%' }}>
            <Icon name="sparkles" size={16} />
            {busy ? 'Analisando…' : 'Gerar hipóteses'}
          </button>
        </div>

        <div className="card pad">
          <strong>Resultado</strong>
          {!res && <p className="sub mt">Preencha os sinais e clique em gerar.</p>}
          {res && res.results.length === 0 && <p className="sub mt">Nenhuma hipótese reconhecida. Refine os sinais clínicos descritos.</p>}
          {res?.results.map((r: any, i: number) => (
            <div key={i} className="card pad" style={{ marginTop: 12, borderLeft: `3px solid ${r.hasRedFlags ? 'var(--danger)' : 'var(--accent)'}` }}>
              <div className="flex between">
                <strong>{r.condition}</strong>
                <span className={`badge ${r.hasRedFlags ? 'red' : 'green'}`}>{r.confidence}%{r.hasRedFlags ? ' · grave' : ''}</span>
              </div>
              <div className="flex gap wrap" style={{ marginTop: 6 }}>{r.matchedSigns.map((s: string) => <span key={s} className="badge gray" style={{ fontSize: 11 }}>{s}</span>)}</div>
              <p className="sub" style={{ marginTop: 8 }}>{r.recommendation}</p>
              <p className="muted" style={{ fontSize: 12, marginTop: 4 }}><strong>Exames:</strong> {r.suggestedExams.join(', ')}</p>
            </div>
          ))}
          {res && <p className="muted" style={{ fontSize: 11, marginTop: 12, fontStyle: 'italic' }}>{res.disclaimer}</p>}
        </div>
      </div>
      <style>{`@media (max-width: 820px){ .vc-grid{ grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}
