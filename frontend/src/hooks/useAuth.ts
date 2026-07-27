import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/entities/session';
import { authApi } from '../services/api';
import type { LoginRequest, RegisterRequest } from '../types';

export function useAuth() {
  const { token, email, role, setToken, logout, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const login = async (data: LoginRequest): Promise<void> => {
    const jwt = await authApi.login(data);
    setToken(jwt);
    navigate('/dashboard');
  };

  const register = async (data: RegisterRequest): Promise<void> => {
    await authApi.register(data);
    // Auto-login after registration
    const jwt = await authApi.login({ email: data.email, password: data.password });
    setToken(jwt);
    navigate('/dashboard');
  };

  const signOut = () => {
    logout();
    navigate('/auth/connexion');
  };

  return {
    token,
    email,
    role,
    isAuthenticated: isAuthenticated(),
    login,
    register,
    logout: signOut,
  };
}
