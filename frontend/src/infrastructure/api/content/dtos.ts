import { ResponseWithMetadata } from "../base_dtos";

// 장르 정보 모델
export interface Genre {
  id: number;
  name: string;
  description?: string;
}

// 콘텐츠 목록 응답 DTO
export interface ContentListResponse {
  id: number;
  title: string;
  thumbnail_url: string;
  release_year: number;
  genres: string[];
  is_wishlisted: boolean;
}

// 콘텐츠 상세 정보 응답 DTO
export interface ContentDetailResponse {
  id: number;
  title: string;
  description: string;
  thumbnail_url: string;
  video_url: string;
  duration: number;
  release_year: number;
  genres: Genre[];
  is_wishlisted: boolean;
  last_position?: number;
}

// 콘텐츠 스트리밍 응답 DTO
export interface StreamingResponse {
  content_id: number;
  streaming_url: string;
  duration: number;
  last_position: number;
}

// 재생 위치 업데이트 요청 DTO
export interface PlaybackPositionRequest {
  content_id: number;
  current_position: number;
  watch_duration: number;
  is_completed?: boolean;
}

// 최종 재생 위치 저장 요청 DTO
export interface FinalPositionRequest {
  content_id: number;
  final_position: number;
  watch_duration: number;
  is_completed?: boolean;
}

// 시청 기록 요청 DTO
export interface ViewingHistoryRequest {
  content_id: number;
  last_position: number;
  watch_duration: number;
  is_completed?: boolean;
}

// 콘텐츠 목록 응답
export interface ContentListResponseWrapper extends ResponseWithMetadata {
  data: ContentListResponse[];
}

// 콘텐츠 상세 응답
export interface ContentDetailResponseWrapper extends ResponseWithMetadata {
  data: ContentDetailResponse;
}

// 콘텐츠 스트리밍 응답
export interface StreamingResponseWrapper extends ResponseWithMetadata {
  data: StreamingResponse;
}

// 일반 응답 (재생 위치, 최종 위치 등)
export interface ContentActionResponse extends ResponseWithMetadata {
  data: {
    success: boolean;
    message?: string;
  };
}
