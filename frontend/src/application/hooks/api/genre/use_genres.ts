import { getAllGenres } from "@/infrastructure/api";
import type { GenreListResponse } from "@/infrastructure/api";
import { useBaseQuery } from "../use_base_query";
import { ApiQueryKeys } from "../constants";

export const useGenres = () => {
  return useBaseQuery<GenreListResponse>({
    queryKey: [ApiQueryKeys.GENRE, "list"],
    queryFn: () => getAllGenres(),
  });
};
