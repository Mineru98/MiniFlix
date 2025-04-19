export enum ApiEndpoints {
  // 인증 관련
  LOGIN = "/api/auth/login",
  REGISTER = "/api/auth/register",

  // 사용자 관련
  USER_PROFILE = "/api/users/profile",
  USER_VIEWING_HISTORY = "/api/users/viewing-history",

  // 콘텐츠 관련
  CONTENTS = "/api/contents",
  CONTENT_DETAIL = "/api/contents", // /{id} 추가 필요
  CONTENT_STREAM = "/api/contents", // /{id}/stream 추가 필요
  CONTENT_PLAYBACK = "/api/contents", // /{id}/playback 추가 필요
  CONTENT_FINAL_POSITION = "/api/contents", // /{id}/final-position 추가 필요
  CONTENT_HISTORY = "/api/contents", // /{id}/history 추가 필요
  CONTENT_BY_GENRE = "/api/contents/genre", // /{genreId} 추가 필요
  CONTENT_SEARCH = "/api/contents/search",

  // 장르 관련
  GENRES = "/api/genres",

  // 찜 목록 관련
  WISHLISTS = "/api/wishlists",
  WISHLIST_TOGGLE = "/api/wishlists", // /{contentId} 추가 필요
}
