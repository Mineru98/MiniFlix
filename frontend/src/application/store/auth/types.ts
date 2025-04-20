import { UserResponse } from "@/infrastructure/api";

export interface AuthState {
  user: UserResponse | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isLoginState: boolean;
  loginForm: {
    email: string;
    password: string;
  };
  registerForm: {
    email: string;
    name: string;
    password: string;
    passwordConfirm: string;
  };
}

export interface AuthActions {
  // 인증 상태 관리
  setAuth: (user: UserResponse, token: string) => void;
  clearAuth: () => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setLoginState: (isLoginState: boolean) => void;

  // 로그인 폼 관리
  setLoginEmail: (email: string) => void;
  setLoginPassword: (password: string) => void;
  resetLoginForm: () => void;

  // 회원가입 폼 관리
  setRegisterEmail: (email: string) => void;
  setRegisterName: (name: string) => void;
  setRegisterPassword: (password: string) => void;
  setRegisterPasswordConfirm: (passwordConfirm: string) => void;
  resetRegisterForm: () => void;
}

export type AuthStore = AuthState & AuthActions;
