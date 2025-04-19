import { create } from "zustand";
import { ContentSearchStore, ContentSearchState } from "./types";

// 기본 상태 값
const initialState: ContentSearchState = {
  searchQuery: "",
  isSearching: false,
};

const useContentSearchStore = create<ContentSearchStore>((set) => {
  return {
    ...initialState,

    setSearchQuery: (searchQuery) => set({ searchQuery }),

    clearSearchQuery: () => set({ searchQuery: "" }),

    setIsSearching: (isSearching) => set({ isSearching }),
  };
});

export default useContentSearchStore;
