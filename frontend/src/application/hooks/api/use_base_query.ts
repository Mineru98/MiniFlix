import { useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import type { BaseQueryProps, BaseQueryResult } from "./types";

export function useBaseQuery<Res>(
  props: BaseQueryProps<Res>
): BaseQueryResult<Res> {
  const { enabled, initialData, queryFn, queryKey, staleTime } = props;
  const { data, isError, isFetching, isLoading, refetch } = useQuery<
    Res,
    AxiosError
  >({
    queryKey,
    queryFn,
    enabled,
    staleTime,
    initialData,
  });

  return {
    data,
    isError,
    isFetching,
    isLoading,
    refetch,
  };
}
