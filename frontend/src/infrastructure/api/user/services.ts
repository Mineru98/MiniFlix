import { apiRequest } from "../client";
import { ApiEndpoints } from "../constants";
import {
  UserProfileResponse,
  UserUpdateRequest,
  ViewingHistoryListResponse,
} from "./dtos";

/**
 * 사용자 프로필 조회
 */
export const getUserProfile = async (): Promise<UserProfileResponse> => {
  return await apiRequest<UserProfileResponse>({
    method: "GET",
    url: ApiEndpoints.USER_PROFILE,
  });
};

/**
 * 사용자 프로필 업데이트
 * @param userData - 업데이트할 사용자 정보
 */
export const updateUserProfile = async (
  userData: UserUpdateRequest
): Promise<UserProfileResponse> => {
  return await apiRequest<UserProfileResponse>({
    method: "PUT",
    url: ApiEndpoints.USER_PROFILE,
    data: userData,
  });
};

/**
 * 사용자 시청 기록 조회
 */
export const getViewingHistory =
  async (): Promise<ViewingHistoryListResponse> => {
    return await apiRequest<ViewingHistoryListResponse>({
      method: "GET",
      url: ApiEndpoints.USER_VIEWING_HISTORY,
    });
  };
