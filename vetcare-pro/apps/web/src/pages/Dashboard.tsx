import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, CartesianGrid,
} from 'recharts';
import { api, fmtMoney, fmtDateTime } from '../lib/api';
import { Stat, Empty } from '../components/ui';

const COLORS = ['#1f9d8f', '#ff7a66', '#f5a623', '#2bb673', '#7c83ff', '#e0524d'];

export default function Dashboard() {
  const [d, setD] = useState<any>(null);
  useEffect(() => { api.get('/reports/dashboard').then((r) => setD(r.data)); }, []);
  if (!d) return <Empty text="Carregando indicadores…" />;
  const c = d.counters;

  return (
    <div>
      <div className="title">Painel de controle</div>
      <p className="sub">Visão geral da clínica em tempo real.</p>

      <div className="flex gap wrap mt2">
        <Stat label="Pacientes" value={c.patients} icon="🐾" />
        <Stat label="Consultas hoje" value={c.appointmentsToday} icon="📅" tone="coral" />
        <Stat label="Recebido" value={fmtMoney(c.revenuePaid)} icon="💰" tone="green" />
        <Stat label="Em aberto" value={fmtMoney(c.revenueOpen)} icon="⏳" tone="amber" />
        <Stat label="Estoque baixo" value={c.lowStock} icon="📦" tone={c.lowStock ? 'coral' : 'teal'} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }} className="mt2 vc-grid">
        <div className="card pad">
          <strong>Faturamento (6 meses)</strong>
          <div style={{ height: 260, marginTop: 12 }}>
            <ResponsiveContainer>
              <BarChart data={d.revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f1" vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} width={40} />
                <Tooltip formatter={(v: any) => fmtMoney(v)} />
                <Bar dataKey="value" fill="var(--teal-600)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card pad">
          <strong>Espécies atendidas</strong>
          <div style={{ height: 260, marginTop: 12 }}>
            {d.speciesDistribution.length === 0 ? <Empty text="Sem dados" /> : (
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={d.speciesDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {d.speciesDistribution.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="card mt2">
        <div className="flex between pad" style={{ borderBottom: '1px solid var(--line)' }}>
          <strong>Próximos atendimentos</strong>
          <Link to="/agenda" className="btn ghost sm">Ver agenda</Link>
        </div>
        {d.upcoming.length === 0 ? <Empty text="Nenhum atendimento agendado." /> : (
          <table className="table">
            <thead><tr><th>Paciente</th><th>Tipo</th><th className="hide-sm">Veterinário</th><th>Quando</th><th>Status</th></tr></thead>
            <tbody>
              {d.upcoming.map((a: any) => (
                <tr key={a.id}>
                  <td><strong>{a.patient?.name}</strong></td>
                  <td style={{ textTransform: 'capitalize' }}>{a.type}</td>
                  <td className="hide-sm muted">{a.vetName || '—'}</td>
                  <td>{fmtDateTime(a.startsAt)}</td>
                  <td><span className="badge gray" style={{ textTransform: 'capitalize' }}>{a.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <style>{`@media (max-width: 820px){ .vc-grid{ grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}
