import { create } from 'zustand';
import { ViewingHistory } from '@/types';

interface ViewingHistoryState {
  history: ViewingHistory[];
  isLoading: boolean;
  error: string | null;
  setHistory: (history: ViewingHistory[]) => void;
  addHistory: (history: ViewingHistory) => void;
  updateHistory: (contentId: number, updatedData: Partial<ViewingHistory>) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

const useViewingHistoryStore = create<ViewingHistoryState>((set) => ({
  history: [],
  isLoading: false,
  error: null,

  setHistory: (history) => {
    set({ history, isLoading: false, error: null });
  },

  addHistory: (history) => {
    set((state) => {
      // 이미 있는 콘텐츠의 기록인지 확인
      const existingIndex = state.history.findIndex(
        (h) => h.content_id === history.content_id
      );

      if (existingIndex >= 0) {
        // 기존 기록 업데이트
        const updatedHistory = [...state.history];
        updatedHistory[existingIndex] = history;
        return { history: updatedHistory };
      } else {
        // 새 기록 추가
        return { history: [history, ...state.history] };
      }
    });
  },

  updateHistory: (contentId, updatedData) => {
    set((state) => {
      const updatedHistory = state.history.map((history) => {
        if (history.content_id === contentId) {
          return { ...history, ...updatedData };
        }
        return history;
      });
      return { history: updatedHistory };
    });
  },

  setLoading: (isLoading) => {
    set({ isLoading });
  },

  setError: (error) => {
    set({ error });
  },
}));

export default useViewingHistoryStore; 