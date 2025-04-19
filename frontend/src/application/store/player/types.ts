export interface PlayerState {
  currentContentId: number | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isFullScreen: boolean;
  playbackRate: number;
  watchDuration: number;
}

export interface PlayerActions {
  setCurrentContent: (contentId: number) => void;
  clearCurrentContent: () => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setCurrentTime: (currentTime: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleFullScreen: () => void;
  setPlaybackRate: (rate: number) => void;
  updateWatchDuration: (seconds: number) => void;
  resetPlayer: () => void;
}

export type PlayerStore = PlayerState & PlayerActions;
