export interface ContentSearchState {
  searchQuery: string;
  isSearching: boolean;
}

export interface ContentSearchActions {
  setSearchQuery: (query: string) => void;
  clearSearchQuery: () => void;
  setIsSearching: (isSearching: boolean) => void;
}

export type ContentSearchStore = ContentSearchState & ContentSearchActions;
