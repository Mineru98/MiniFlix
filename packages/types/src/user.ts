export interface User {
  id: number;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface UserCreateDto {
  email: string;
  password: string;
  name: string;
}

export interface UserUpdateDto {
  name?: string;
  password?: string;
  currentPassword: string;
}

export interface UserResponseDto {
  id: number;
  email: string;
  name: string;
  createdAt: Date;
} 