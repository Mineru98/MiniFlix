import { ResponseWithMetadata } from "../base_dtos";

// 장르 정보 모델
export interface Genre {
  id: number;
  name: string;
  description?: string;
}

// 장르 목록 응답 DTO
export interface GenreListResponse extends ResponseWithMetadata {
  data: Genre[];
}
