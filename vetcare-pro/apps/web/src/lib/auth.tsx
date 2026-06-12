import { createContext, useContext, useState, ReactNode } from 'react';
import { api } from './api';

interface User { id: string; name: string; email: string; role: string; }
interface AuthCtx {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
}

const Ctx = createContext<AuthCtx>(null as any);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem('vc_user');
    return raw ? JSON.parse(raw) : null;
  });

  const persist = (data: { accessToken: string; user: User }) => {
    localStorage.setItem('vc_token', data.accessToken);
    localStorage.setItem('vc_user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    persist(data);
  };
  const register = async (payload: any) => {
    const { data } = await api.post('/auth/register', payload);
    persist(data);
  };
  const logout = () => {
    localStorage.removeItem('vc_token');
    localStorage.removeItem('vc_user');
    setUser(null);
    location.href = '/login';
  };

  return <Ctx.Provider value={{ user, login, register, logout }}>{children}</Ctx.Provider>;
}
