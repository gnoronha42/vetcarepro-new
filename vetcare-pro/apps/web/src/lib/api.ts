import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('vc_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401 && !location.pathname.includes('login')) {
      localStorage.removeItem('vc_token');
      localStorage.removeItem('vc_user');
      location.href = '/login';
    }
    return Promise.reject(err);
  },
);

export const fmtMoney = (n: number) =>
  (n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
export const fmtDate = (s?: string) =>
  s ? new Date(s).toLocaleDateString('pt-BR') : '—';
export const fmtDateTime = (s?: string) =>
  s ? new Date(s).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '—';
