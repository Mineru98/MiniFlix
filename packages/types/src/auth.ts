export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface LoginResponseDto {
  token: string;
  user: {
    id: number;
    email: string;
    name: string;
  };
}

export interface JwtPayload {
  userId: number;
  email: string;
  name: string;
} 