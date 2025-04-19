import { create } from 'zustand';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
}

const useAuthStore = create<AuthState>((set) => {
  // 초기 상태 - 로컬 스토리지에서 기존 데이터 확인
  let initialUser = null;
  let initialToken = null;
  let initialIsAuthenticated = false;

  if (typeof window !== 'undefined') {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        initialToken = storedToken;
        initialUser = JSON.parse(storedUser);
        initialIsAuthenticated = true;
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }

  return {
    user: initialUser,
    token: initialToken,
    isAuthenticated: initialIsAuthenticated,
    
    setAuth: (user, token) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
      }
      set({ user, token, isAuthenticated: true });
    },
    
    clearAuth: () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      set({ user: null, token: null, isAuthenticated: false });
    }
  };
});

export default useAuthStore; 