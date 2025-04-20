import { useQuery } from "@tanstack/react-query";
import { getViewingHistory } from "@/infrastructure/api";
import { ViewingHistoryResponse } from "@/infrastructure/api/user/dtos";

/**
 * 사용자의 시청 기록을 조회하고 관리하는 훅
 * @param options - 쿼리 옵션 (enabled, staleTime 등)
 * @returns 시청 기록 데이터와 로딩 상태
 */
export const useViewingHistory = (options?: {
  enabled?: boolean;
  staleTime?: number;
  limit?: number;
}) => {
  const { limit = 4, ...queryOptions } = options || {};

  const result = useQuery({
    queryKey: ["viewingHistory"],
    queryFn: getViewingHistory,
    staleTime: 5 * 60 * 1000, // 기본값: 5분
    ...queryOptions,
  });

  // 시청 기록 데이터 추출 및 정렬 (최근에 시청한 항목 우선)
  const viewingHistoryList: ViewingHistoryResponse[] = result.data?.data || [];

  // 최신순으로 정렬 후 limit 개수만큼 반환
  const sortedViewingHistory = [...viewingHistoryList]
    .sort(
      (a, b) =>
        new Date(b.watched_at).getTime() - new Date(a.watched_at).getTime()
    )
    .slice(0, limit);

  // 진행 중인 콘텐츠 (is_completed가 false인 항목들)
  const inProgressContents = sortedViewingHistory.filter(
    (item) => !item.is_completed
  );

  // 시청 완료된 콘텐츠 (is_completed가 true인 항목들)
  const completedContents = sortedViewingHistory.filter(
    (item) => item.is_completed
  );

  return {
    ...result,
    viewingHistory: sortedViewingHistory,
    inProgressContents,
    completedContents,
  };
};
