import { getContentsByGenre } from "@/infrastructure/api";
import type { PagingContentListResponseWrapper } from "@/infrastructure/api/content/dtos";
import { useQueries } from "@tanstack/react-query";
import { ApiQueryKeys } from "../constants";
import { Genre } from "@/infrastructure/api/genre/dtos";
import { PaginationQueryParams } from "@/infrastructure/api/base_dtos";

/**
 * 여러 장르에 대한 콘텐츠를 병렬로 가져오는 훅
 * @param genres - 콘텐츠를 가져올 장르 배열
 * @param options - 쿼리 옵션
 */
export const useContentsByGenres = (
  genres: Genre[],
  options?: {
    enabled?: boolean;
    pagination?: PaginationQueryParams;
  }
) => {
  const { enabled = true, pagination } = options || {};

  return useQueries({
    queries: genres.map((genre) => ({
      queryKey: [ApiQueryKeys.CONTENT, "byGenre", String(genre.id), pagination],
      queryFn: () => getContentsByGenre(genre.id, pagination),
      enabled: enabled && !!genre.id,
    })),
  });
};
