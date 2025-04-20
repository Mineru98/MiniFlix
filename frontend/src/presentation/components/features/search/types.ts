// 검색 페이지 관련 타입 정의

// 검색 결과 콘텐츠 타입
export interface SearchContent {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  contentType?: string;
}

// 검색 응답 페이지네이션 타입
export interface SearchPagination {
  page: number;
  size: number;
}

// 검색 결과 데이터 타입
export interface SearchResultData {
  content: SearchContent[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// 검색 응답 타입
export interface SearchResponse {
  data: SearchResultData;
}
