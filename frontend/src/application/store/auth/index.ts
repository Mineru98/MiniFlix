import { create } from "zustand";
import { AuthStore, AuthState } from "./types";

// 기본 상태 값
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  isLoginState: false,
  loginForm: {
    email: "",
    password: "",
  },
  registerForm: {
    email: "",
    name: "",
    password: "",
    passwordConfirm: "",
  },
};

const useAuthStore = create<AuthStore>((set) => {
  // 초기 상태 - 로컬 스토리지에서 기존 데이터 확인
  let state = { ...initialState };

  if (typeof window !== "undefined") {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      try {
        state.token = storedToken;
        state.user = JSON.parse(storedUser);
        state.isAuthenticated = true;
      } catch (e) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
  }

  return {
    ...state,

    // 인증 상태 관리
    setAuth: (user, token) => {
      if (typeof window !== "undefined") {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
      }
      set({ user, token, isAuthenticated: true, error: null });
    },

    clearAuth: () => {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        error: null,
      });
    },

    setLoading: (isLoading) => set({ isLoading }),

    setError: (error) => set({ error, isLoading: false }),

    setLoginState: (isLoginState) => set({ isLoginState }),

    // 로그인 폼 관리
    setLoginEmail: (email) =>
      set((state) => ({
        loginForm: { ...state.loginForm, email },
      })),

    setLoginPassword: (password) =>
      set((state) => ({
        loginForm: { ...state.loginForm, password },
      })),

    resetLoginForm: () =>
      set({
        loginForm: initialState.loginForm,
        error: null,
      }),

    // 회원가입 폼 관리
    setRegisterEmail: (email) =>
      set((state) => ({
        registerForm: { ...state.registerForm, email },
      })),

    setRegisterName: (name) =>
      set((state) => ({
        registerForm: { ...state.registerForm, name },
      })),

    setRegisterPassword: (password) =>
      set((state) => ({
        registerForm: { ...state.registerForm, password },
      })),

    setRegisterPasswordConfirm: (passwordConfirm) =>
      set((state) => ({
        registerForm: { ...state.registerForm, passwordConfirm },
      })),

    resetRegisterForm: () =>
      set({
        registerForm: initialState.registerForm,
        error: null,
      }),
  };
});

export default useAuthStore;
