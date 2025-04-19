import { getViewingHistory } from "@/infrastructure/api";
import type { ViewingHistoryListResponse } from "@/infrastructure/api";
import { useBaseQuery } from "../use_base_query";
import { ApiQueryKeys } from "../constants";

export const useViewingHistory = () => {
  return useBaseQuery<ViewingHistoryListResponse>({
    queryKey: [ApiQueryKeys.USER, "viewingHistory"],
    queryFn: () => getViewingHistory(),
  });
};
