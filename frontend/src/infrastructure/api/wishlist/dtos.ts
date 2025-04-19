import { ResponseWithMetadata } from "../base_dtos";
import { ContentListResponse } from "../content/dtos";

// 찜하기/취소 응답 DTO
export interface WishlistToggleResponse {
  is_wishlisted: boolean;
  message: string;
}

// 찜 목록 응답 DTO
export interface WishlistResponse extends ResponseWithMetadata {
  data: ContentListResponse[];
}

// 찜하기/취소 응답 wrapper DTO
export interface WishlistToggleResponseWrapper extends ResponseWithMetadata {
  data: WishlistToggleResponse;
}
