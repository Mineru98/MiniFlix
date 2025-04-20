import {
  getAllContents,
  getContentsByGenre,
  searchContents,
} from "@/infrastructure/api";
import type { ContentListResponseWrapper } from "@/infrastructure/api";
import type { PagingContentListResponseWrapper } from "@/infrastructure/api/content/dtos";
import { useBaseQuery } from "../use_base_query";
import { ApiQueryKeys } from "../constants";
import { PaginationQueryParams } from "@/infrastructure/api/base_dtos";

export const useContentList = () => {
  return useBaseQuery<ContentListResponseWrapper>({
    queryKey: [ApiQueryKeys.CONTENT, "list"],
    queryFn: () => getAllContents(),
  });
};

export const useContentsByGenre = (
  genreId: number,
  pagination?: PaginationQueryParams
) => {
  const paginationKey = pagination
    ? `page-${pagination.page}-size-${pagination.size}`
    : "default";

  return useBaseQuery<PagingContentListResponseWrapper>({
    queryKey: [ApiQueryKeys.CONTENT, "byGenre", String(genreId), paginationKey],
    queryFn: () => getContentsByGenre(genreId, pagination),
    enabled: !!genreId,
  });
};

export const useSearchContents = (
  query: string,
  pagination?: PaginationQueryParams
) => {
  const paginationKey = pagination
    ? `page-${pagination.page}-size-${pagination.size}`
    : "default";

  return useBaseQuery<PagingContentListResponseWrapper>({
    queryKey: [ApiQueryKeys.CONTENT, "search", query, paginationKey],
    queryFn: () => searchContents(query, pagination),
    enabled: !!query,
  });
};
