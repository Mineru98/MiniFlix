import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import type { BaseMutationProps, BaseMutationResult } from "./types";

export function useBaseMutation<Res, Req>(
  props: BaseMutationProps<Res, Req>
): BaseMutationResult<Res, Req> {
  const { mutationKey, mutationFn } = props;
  const { data, isError, mutate, mutateAsync, isPending, error } = useMutation<
    Res,
    AxiosError,
    Req
  >({
    mutationKey,
    mutationFn,
  });

  return {
    data,
    isError,
    isLoading: isPending,
    error,
    mutate,
    mutateAsync,
  };
}
