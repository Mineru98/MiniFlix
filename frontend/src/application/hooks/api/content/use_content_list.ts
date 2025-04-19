import {
  getAllContents,
  getContentsByGenre,
  searchContents,
} from "@/infrastructure/api";
import type { ContentListResponseWrapper } from "@/infrastructure/api";
import { useBaseQuery } from "../use_base_query";
import { ApiQueryKeys } from "../constants";

export const useContentList = () => {
  return useBaseQuery<ContentListResponseWrapper>({
    queryKey: [ApiQueryKeys.CONTENT, "list"],
    queryFn: () => getAllContents(),
  });
};

export const useContentsByGenre = (genreId: number) => {
  return useBaseQuery<ContentListResponseWrapper>({
    queryKey: [ApiQueryKeys.CONTENT, "byGenre", String(genreId)],
    queryFn: () => getContentsByGenre(genreId),
    enabled: !!genreId,
  });
};

export const useSearchContents = (query: string) => {
  return useBaseQuery<ContentListResponseWrapper>({
    queryKey: [ApiQueryKeys.CONTENT, "search", query],
    queryFn: () => searchContents(query),
    enabled: !!query,
  });
};
