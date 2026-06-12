import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, CartesianGrid,
} from 'recharts';
import { api, fmtMoney, fmtDateTime } from '../lib/api';
import { Stat, Empty, Loading } from '../components/ui';

const COLORS = ['#0d9488', '#2563eb', '#d97706', '#059669', '#7c3aed', '#dc2626'];

const tooltipStyle = {
  borderRadius: 8,
  border: '1px solid var(--line)',
  boxShadow: 'var(--shadow)',
  fontSize: 12,
};

export default function Dashboard() {
  const [d, setD] = useState<any>(null);
  useEffect(() => { api.get('/reports/dashboard').then((r) => setD(r.data)); }, []);
  if (!d) return <Loading text="Carregando indicadores…" />;
  const c = d.counters;

  return (
    <div>
      <div className="page-header">
        <div className="title">Painel de controle</div>
        <p className="sub">Visão geral da clínica em tempo real.</p>
      </div>

      <div className="flex gap wrap">
        <Stat label="Pacientes" value={c.patients} icon="patients" />
        <Stat label="Consultas hoje" value={c.appointmentsToday} icon="calendar" tone="blue" />
        <Stat label="Recebido" value={fmtMoney(c.revenuePaid)} icon="money" tone="green" />
        <Stat label="Em aberto" value={fmtMoney(c.revenueOpen)} icon="clock" tone="amber" />
        <Stat label="Estoque baixo" value={c.lowStock} icon="inventory" tone={c.lowStock ? 'coral' : 'teal'} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }} className="mt2 vc-grid">
        <div className="card">
          <div className="card-header">
            <strong>Faturamento (6 meses)</strong>
          </div>
          <div className="pad" style={{ paddingTop: 8 }}>
            <div style={{ height: 280 }}>
              <ResponsiveContainer>
                <BarChart data={d.revenueByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--line-soft)" vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} tick={{ fill: 'var(--ink-muted)' }} />
                  <YAxis tickLine={false} axisLine={false} fontSize={11} width={48} tick={{ fill: 'var(--ink-muted)' }} />
                  <Tooltip formatter={(v: any) => fmtMoney(v)} contentStyle={tooltipStyle} />
                  <Bar dataKey="value" fill="var(--accent)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <strong>Espécies atendidas</strong>
          </div>
          <div className="pad" style={{ paddingTop: 8 }}>
            <div style={{ height: 280 }}>
              {d.speciesDistribution.length === 0 ? <Empty text="Sem dados" /> : (
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={d.speciesDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={3}>
                      {d.speciesDistribution.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card mt2">
        <div className="card-header">
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
    </div>
  );
}
