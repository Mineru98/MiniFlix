import { apiRequest } from "../client";
import { ApiEndpoints } from "../constants";
import { GenreListResponse } from "./dtos";

/**
 * 모든 장르 목록 조회
 */
export const getAllGenres = async (): Promise<GenreListResponse> => {
  return await apiRequest<GenreListResponse>({
    method: "GET",
    url: ApiEndpoints.GENRES,
  });
};
