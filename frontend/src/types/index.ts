// 사용자 관련 타입
export interface User {
  id: number;
  email: string;
  name: string;
  created_at: string;
  is_active: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface ProfileUpdateRequest {
  name: string;
  current_password: string;
  new_password?: string;
}

// 콘텐츠 관련 타입
export interface Content {
  id: number;
  title: string;
  thumbnail_url: string;
  release_year: number;
  genres: string[];
  is_wishlisted: boolean;
}

export interface ContentDetail extends Omit<Content, 'genres'> {
  description: string;
  video_url: string;
  duration: number;
  genres: Genre[];
  last_position: number;
}

// 장르 관련 타입
export interface Genre {
  id: number;
  name: string;
  description: string;
}

// 찜목록 관련 타입
export interface WishlistToggleResponse {
  message: string;
  is_wishlisted: boolean;
}

// 시청 기록 관련 타입
export interface ViewingHistory {
  id: number;
  content_id: number;
  watch_duration: number;
  last_position: number;
  watched_at: string;
  is_completed: boolean;
  title: string;
  thumbnail_url: string;
  duration: number;
  progress_percent: number;
}

export interface ViewingHistoryRequest {
  content_id: number;
  last_position: number;
  watch_duration: number;
  is_completed: boolean;
}

// API 응답 타입
export interface ApiResponse<T> {
  data: T;
  error?: string;
  details?: string;
}

export interface ApiError {
  error: string;
  details?: string;
} 