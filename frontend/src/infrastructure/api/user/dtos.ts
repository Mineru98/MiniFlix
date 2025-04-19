import { ResponseWithMetadata } from "../base_dtos";

// 사용자 정보 응답 DTO
export interface UserResponse {
  id: number;
  email: string;
  name: string;
  is_active: boolean;
  created_at: string;
}

// 사용자 정보 업데이트 요청 DTO
export interface UserUpdateRequest {
  name?: string;
  current_password: string;
  new_password?: string;
}

// 시청 기록 응답 DTO
export interface ViewingHistoryResponse {
  id: number;
  content_id: number;
  title: string;
  thumbnail_url: string;
  duration: number;
  watch_duration: number;
  last_position: number;
  progress_percent: number;
  is_completed: boolean;
  watched_at: string;
}

// 사용자 프로필 응답 DTO
export interface UserProfileResponse extends ResponseWithMetadata {
  data: UserResponse;
}

// 시청 기록 목록 응답 DTO
export interface ViewingHistoryListResponse extends ResponseWithMetadata {
  data: ViewingHistoryResponse[];
}
