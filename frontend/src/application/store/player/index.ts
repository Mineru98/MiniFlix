import { create } from "zustand";
import { PlayerStore, PlayerState } from "./types";

// 기본 상태 값
const initialState: PlayerState = {
  currentContentId: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 1,
  isMuted: false,
  isFullScreen: false,
  playbackRate: 1,
  watchDuration: 0,
};

const usePlayerStore = create<PlayerStore>((set) => {
  return {
    ...initialState,

    setCurrentContent: (currentContentId) =>
      set({
        currentContentId,
        currentTime: 0,
        duration: 0,
        isPlaying: false,
        watchDuration: 0,
      }),

    clearCurrentContent: () =>
      set({
        currentContentId: null,
        currentTime: 0,
        duration: 0,
        isPlaying: false,
        watchDuration: 0,
      }),

    setIsPlaying: (isPlaying) => set({ isPlaying }),

    setCurrentTime: (currentTime) => set({ currentTime }),

    setDuration: (duration) => set({ duration }),

    setVolume: (volume) => set({ volume }),

    toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),

    toggleFullScreen: () =>
      set((state) => ({ isFullScreen: !state.isFullScreen })),

    setPlaybackRate: (playbackRate) => set({ playbackRate }),

    updateWatchDuration: (seconds) =>
      set((state) => ({
        watchDuration: state.watchDuration + seconds,
      })),

    resetPlayer: () => set(initialState),
  };
});

export default usePlayerStore;
