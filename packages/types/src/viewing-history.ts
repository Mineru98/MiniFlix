export interface ViewingHistory {
  id: number;
  userId: number;
  contentId: number;
  watchDuration: number;
  lastPosition: number;
  watchedAt: Date;
  isCompleted: boolean;
}

export interface ViewingHistoryUpdateDto {
  contentId: number;
  currentPosition: number;
  watchDuration: number;
  isCompleted?: boolean;
} 