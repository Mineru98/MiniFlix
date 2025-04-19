import { apiRequest } from "../client";
import { ApiEndpoints } from "../constants";
import {
  LoginResponse,
  RegisterResponse,
  UserLoginRequest,
  UserRegisterRequest,
} from "./dtos";

/**
 * 사용자 로그인
 * @param credentials - 로그인 정보
 */
export const login = async (
  credentials: UserLoginRequest
): Promise<LoginResponse> => {
  return await apiRequest<LoginResponse>({
    method: "POST",
    url: ApiEndpoints.LOGIN,
    data: credentials,
  });
};

/**
 * 사용자 회원가입
 * @param userData - 회원가입 정보
 */
export const register = async (
  userData: UserRegisterRequest
): Promise<RegisterResponse> => {
  return await apiRequest<RegisterResponse>({
    method: "POST",
    url: ApiEndpoints.REGISTER,
    data: userData,
  });
};
