import type { ResponsePagingWithMetadata } from "@/infrastructure/api/base_dtos";
import { useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { slice } from "es-toolkit/compat";
import { useMemo, useState } from "react";
import type {
  BasePaginatedQueryProps,
  BasePaginatedQueryResult,
} from "./types";

export function useBasePaginatedQuery<Res>(
  props: BasePaginatedQueryProps<Res>
): BasePaginatedQueryResult<Res> {
  const { enabled, page, pageSize, queryFn, queryKey, staleTime } = props;
  const {
    data: rawData,
    isError,
    isFetching,
    isLoading,
    refetch,
  } = useQuery<ResponsePagingWithMetadata<Res>, AxiosError>({
    queryKey,
    queryFn,
    enabled,
    staleTime,
  });
  const [isNextFetching, setNextFetching] = useState<boolean>(false);

  // 기존 코드 -> 슬라이스 데이터 못가져 오는 이슈로 코드 수정함
  // const data = useMemo((): Res[] | undefined => {
  //   if (!rawData) {
  //     return undefined;
  //   }

  //   if (page !== 1) {
  //     setNextFetching(true);
  //   }
  //   try {
  //     return slice(rawData.data.content, 0, pageSize * page);
  //   } finally {
  //     setNextFetching(false);
  //   }
  // }, [rawData, page, pageSize]);

  const data = useMemo((): Res[] | undefined => {
    if (!rawData || !rawData.data.content) {
      return undefined;
    }

    // 페이지가 1이 아닌 경우 다음 데이터를 가져오고 있음을 표시
    if (page !== 1) {
      setNextFetching(true);
    }

    try {
      // 데이터 슬라이스 수행
      const maxIndex = Math.min(
        pageSize * (page + 1),
        rawData.data.content.length
      );
      const slicedData = slice(rawData.data.content, 0, maxIndex);

      return slicedData;
    } finally {
      // 슬라이스 완료 후 isNextFetching을 false로 설정
      setNextFetching(false);
    }
  }, [rawData, page, pageSize]);

  // suspense 와 errorBoundary 를 사용하기 때문에 일반적으로 data 값만 필요함
  return {
    totalCount: rawData?.data.totalElements || 0,
    totalPages: rawData?.data.totalPages || 0,
    rawData: rawData?.data.content || [],
    data,
    isError,
    isFetching,
    isLoading,
    isNextFetching,
    refetch,
  };
}
