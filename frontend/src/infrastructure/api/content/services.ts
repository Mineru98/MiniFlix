import { apiRequest } from "../client";
import { ApiEndpoints } from "../constants";
import {
  ContentActionResponse,
  ContentDetailResponseWrapper,
  ContentListResponseWrapper,
  FinalPositionRequest,
  PlaybackPositionRequest,
  StreamingResponseWrapper,
  ViewingHistoryRequest,
  PagingContentListResponseWrapper,
} from "./dtos";
import { PaginationQueryParams } from "../base_dtos";

/**
 * 모든 콘텐츠 목록 조회
 */
export const getAllContents = async (): Promise<ContentListResponseWrapper> => {
  return await apiRequest<ContentListResponseWrapper>({
    method: "GET",
    url: ApiEndpoints.CONTENTS,
  });
};

/**
 * 콘텐츠 상세 정보 조회
 * @param contentId - 콘텐츠 ID
 */
export const getContentDetail = async (
  contentId: number
): Promise<ContentDetailResponseWrapper> => {
  return await apiRequest<ContentDetailResponseWrapper>({
    method: "GET",
    url: `${ApiEndpoints.CONTENT_DETAIL}/${contentId}`,
  });
};

/**
 * 콘텐츠 스트리밍 요청
 * @param contentId - 콘텐츠 ID
 */
export const requestStreaming = async (
  contentId: number
): Promise<StreamingResponseWrapper> => {
  return await apiRequest<StreamingResponseWrapper>({
    method: "GET",
    url: `${ApiEndpoints.CONTENT_STREAM}/${contentId}/stream`,
  });
};

/**
 * 콘텐츠 재생 위치 업데이트
 * @param contentId - 콘텐츠 ID
 * @param playbackData - 재생 위치 데이터
 */
export const updatePlaybackPosition = async (
  contentId: number,
  playbackData: PlaybackPositionRequest
): Promise<ContentActionResponse> => {
  return await apiRequest<ContentActionResponse>({
    method: "POST",
    url: `${ApiEndpoints.CONTENT_PLAYBACK}/${contentId}/playback`,
    data: playbackData,
  });
};

/**
 * 콘텐츠 최종 재생 위치 저장
 * @param contentId - 콘텐츠 ID
 * @param finalPositionData - 최종 재생 위치 데이터
 */
export const saveFinalPosition = async (
  contentId: number,
  finalPositionData: FinalPositionRequest
): Promise<ContentActionResponse> => {
  return await apiRequest<ContentActionResponse>({
    method: "POST",
    url: `${ApiEndpoints.CONTENT_FINAL_POSITION}/${contentId}/final-position`,
    data: finalPositionData,
  });
};

/**
 * 콘텐츠 시청 기록 업데이트
 * @param contentId - 콘텐츠 ID
 * @param historyData - 시청 기록 데이터
 */
export const updateViewingHistory = async (
  contentId: number,
  historyData: ViewingHistoryRequest
): Promise<ContentActionResponse> => {
  return await apiRequest<ContentActionResponse>({
    method: "POST",
    url: `${ApiEndpoints.CONTENT_HISTORY}/${contentId}/history`,
    data: historyData,
  });
};

/**
 * 장르별 콘텐츠 조회
 * @param genreId - 장르 ID
 * @param params - 페이징 파라미터 (선택)
 */
export const getContentsByGenre = async (
  genreId: number,
  params?: PaginationQueryParams
): Promise<PagingContentListResponseWrapper> => {
  return await apiRequest<PagingContentListResponseWrapper>({
    method: "GET",
    url: `${ApiEndpoints.CONTENT_BY_GENRE}/${genreId}`,
    params,
  });
};

/**
 * 콘텐츠 검색
 * @param query - 검색어
 * @param params - 페이징 파라미터 (선택)
 */
export const searchContents = async (
  query: string,
  params?: PaginationQueryParams
): Promise<PagingContentListResponseWrapper> => {
  return await apiRequest<PagingContentListResponseWrapper>({
    method: "GET",
    url: ApiEndpoints.CONTENT_SEARCH,
    params: {
      q: query,
      ...params,
    },
  });
};
