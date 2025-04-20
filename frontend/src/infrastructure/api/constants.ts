export enum ApiEndpoints {
  // 인증 관련
  LOGIN = "/auth/login",
  REGISTER = "/auth/register",

  // 사용자 관련
  USER_PROFILE = "/users/profile",
  USER_VIEWING_HISTORY = "/users/viewing-history",

  // 콘텐츠 관련
  CONTENTS = "/contents",
  CONTENT_DETAIL = "/contents", // /{id} 추가 필요
  CONTENT_STREAM = "/contents", // /{id}/stream 추가 필요
  CONTENT_PLAYBACK = "/contents", // /{id}/playback 추가 필요
  CONTENT_FINAL_POSITION = "/contents", // /{id}/final-position 추가 필요
  CONTENT_HISTORY = "/contents", // /{id}/history 추가 필요
  CONTENT_BY_GENRE = "/contents/genre", // /{genreId} 추가 필요
  CONTENT_SEARCH = "/contents/search",

  // 장르 관련
  GENRES = "/genres",

  // 찜 목록 관련
  WISHLISTS = "/wishlists",
  WISHLIST_TOGGLE = "/wishlists", // /{contentId} 추가 필요
}
