import {
  requestStreaming,
  updatePlaybackPosition,
  saveFinalPosition,
  updateViewingHistory,
} from "@/infrastructure/api";
import type {
  StreamingResponseWrapper,
  ContentActionResponse,
  PlaybackPositionRequest,
  FinalPositionRequest,
  ViewingHistoryRequest,
} from "@/infrastructure/api";
import { useBaseQuery } from "../use_base_query";
import { useBaseMutation } from "../use_base_mutation";
import { ApiQueryKeys, ApiMutationKeys } from "../constants";

export const useStreaming = (contentId: number) => {
  return useBaseQuery<StreamingResponseWrapper>({
    queryKey: [ApiQueryKeys.CONTENT, "stream", String(contentId)],
    queryFn: () => requestStreaming(contentId),
    enabled: !!contentId,
  });
};

export const useUpdatePlaybackPosition = (contentId: number) => {
  return useBaseMutation<ContentActionResponse, PlaybackPositionRequest>({
    mutationKey: [ApiMutationKeys.CONTENT, "updatePlayback", String(contentId)],
    mutationFn: (playbackData: PlaybackPositionRequest) =>
      updatePlaybackPosition(contentId, playbackData),
  });
};

export const useSaveFinalPosition = (contentId: number) => {
  return useBaseMutation<ContentActionResponse, FinalPositionRequest>({
    mutationKey: [
      ApiMutationKeys.CONTENT,
      "saveFinalPosition",
      String(contentId),
    ],
    mutationFn: (finalPositionData: FinalPositionRequest) =>
      saveFinalPosition(contentId, finalPositionData),
  });
};

export const useUpdateViewingHistory = (contentId: number) => {
  return useBaseMutation<ContentActionResponse, ViewingHistoryRequest>({
    mutationKey: [ApiMutationKeys.CONTENT, "updateHistory", String(contentId)],
    mutationFn: (historyData: ViewingHistoryRequest) =>
      updateViewingHistory(contentId, historyData),
  });
};
