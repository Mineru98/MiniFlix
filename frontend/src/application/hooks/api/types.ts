import type { ResponsePagingWithMetadata } from "@/infrastructure/api/base_dtos";
import type { InfiniteData, QueryFunctionContext } from "@tanstack/react-query";
import type { AxiosError } from "axios";

export type BasePaginatedProps = {
  size: number;
  page?: number;
  query?: string;
};

export type BaseQueryProps<Res> = {
  queryKey: string[];
  queryFn: () => Res | Promise<Res>;
  initialData?: Res;
  enabled?: boolean;
  staleTime?: number;
  keepPreviousData?: boolean;
};

export type BaseQueryResult<Res> = {
  data?: Res;
  isError: boolean;
  isFetching: boolean;
  isLoading: boolean;
  refetch: () => void;
};

export type BasePaginatedQueryProps<Res> = {
  page: number;
  pageSize: number;
  queryKey: string[];
  queryFn: () =>
    | ResponsePagingWithMetadata<Res>
    | Promise<ResponsePagingWithMetadata<Res>>;
  enabled?: boolean;
  staleTime?: number;
};

export type BasePaginatedInfinityQueryProps<Res> = {
  enabled?: boolean;
  queryKey: string[];
  queryFn: (
    param: QueryFunctionContext
  ) =>
    | ResponsePagingWithMetadata<Res>
    | Promise<ResponsePagingWithMetadata<Res>>;
};

export type CursorPageParam = {
  cursorId: number | null;
  cursorDate: string | null;
  cursorAddressNum: number | null;
  cursorIsStartDateConfirmed: boolean | null;
  size: number;
};

export type BasePaginatedInfinityQueryResult<Res> = {
  data?: InfiniteData<ResponsePagingWithMetadata<Res>>;
  isError: boolean;
  isFetching: boolean;
  isLoading: boolean;
  hasPreviousPage: boolean;
  fetchPreviousPage: () => void;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
  status: "success" | "pending" | "error";
  refetch: () => void;
};

export type BasePaginatedQueryResult<Res> = {
  totalCount: number;
  totalPages: number;
  data?: Res[];
  rawData?: Res[];
  isError: boolean;
  isFetching: boolean;
  isLoading: boolean;
  isNextFetching: boolean;
  refetch: () => void;
};

export type BaseMutationProps<Res, Req> = {
  mutationKey: string[];
  mutationFn: (input: Req) => Promise<Res>;
};

export type BaseMutationResult<Res, Req> = {
  data?: Res;
  isError: boolean;
  isLoading: boolean;
  error: AxiosError | null;
  mutate: (
    input: Req,
    options?: {
      onSuccess?: (data: Res) => void;
      onError?: (error: AxiosError) => void;
    }
  ) => void;
  mutateAsync: (input: Req) => Promise<Res>;
};
