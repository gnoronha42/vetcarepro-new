import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './lib/auth';
import { Shell } from './components/Shell';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import PatientDetail from './pages/PatientDetail';
import Tutors from './pages/Tutors';
import Agenda from './pages/Agenda';
import Diagnosis from './pages/Diagnosis';
import Notifications from './pages/Notifications';
import Billing from './pages/Billing';
import Inventory from './pages/Inventory';

function Private({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <Private>
            <Shell>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/pacientes" element={<Patients />} />
                <Route path="/pacientes/:id" element={<PatientDetail />} />
                <Route path="/tutores" element={<Tutors />} />
                <Route path="/agenda" element={<Agenda />} />
                <Route path="/diagnostico" element={<Diagnosis />} />
                <Route path="/notificacoes" element={<Notifications />} />
                <Route path="/financeiro" element={<Billing />} />
                <Route path="/estoque" element={<Inventory />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Shell>
          </Private>
        }
      />
    </Routes>
  );
}
