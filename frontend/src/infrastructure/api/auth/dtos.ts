import { ResponseWithMetadata } from "../base_dtos";

// 로그인 요청 DTO
export interface UserLoginRequest {
  email: string;
  password: string;
}

// 회원가입 요청 DTO
export interface UserRegisterRequest {
  email: string;
  name: string;
  password: string;
}

// 사용자 응답 DTO
export interface UserResponse {
  id: number;
  email: string;
  name: string;
  is_active: boolean;
  created_at: string;
}

// 로그인 응답 DTO
export interface LoginResponse extends ResponseWithMetadata {
  data: {
    token: string;
    user: UserResponse;
  };
}

// 회원가입 응답 DTO
export interface RegisterResponse extends ResponseWithMetadata {
  data: UserResponse;
}
