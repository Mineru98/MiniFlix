import { getContentDetail } from "@/infrastructure/api";
import type { ContentDetailResponseWrapper } from "@/infrastructure/api";
import { useBaseQuery } from "../use_base_query";
import { ApiQueryKeys } from "../constants";

export const useContentDetail = (contentId: number) => {
  return useBaseQuery<ContentDetailResponseWrapper>({
    queryKey: [ApiQueryKeys.CONTENT, "detail", String(contentId)],
    queryFn: () => getContentDetail(contentId),
    enabled: !!contentId,
  });
};
