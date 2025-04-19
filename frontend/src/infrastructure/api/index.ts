// 인증 관련 API
export * from "./auth/services";
export type {
  UserLoginRequest,
  UserRegisterRequest,
  LoginResponse,
  RegisterResponse,
} from "./auth/dtos";

// 사용자 관련 API
export * from "./user/services";
export type {
  UserResponse,
  UserUpdateRequest,
  ViewingHistoryResponse,
  UserProfileResponse,
  ViewingHistoryListResponse,
} from "./user/dtos";

// 콘텐츠 관련 API
export * from "./content/services";
export type {
  ContentListResponse,
  ContentDetailResponse,
  StreamingResponse,
  PlaybackPositionRequest,
  FinalPositionRequest,
  ViewingHistoryRequest,
  ContentListResponseWrapper,
  ContentDetailResponseWrapper,
  StreamingResponseWrapper,
  ContentActionResponse,
} from "./content/dtos";

// 장르 관련 API
export * from "./genre/services";
export type { Genre, GenreListResponse } from "./genre/dtos";

// 찜 목록 관련 API
export * from "./wishlist/services";
export type {
  WishlistToggleResponse,
  WishlistResponse,
  WishlistToggleResponseWrapper,
} from "./wishlist/dtos";

// API 기본 타입 및 클라이언트
export * from "./base_dtos";
export * from "./client";
export * from "./constants";
