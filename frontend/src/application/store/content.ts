import { create } from 'zustand';
import { Content, Genre } from '@/types';

interface ContentState {
  contents: Content[];
  filteredContents: Content[];
  genres: Genre[];
  selectedGenre: Genre | null;
  searchQuery: string;
  setContents: (contents: Content[]) => void;
  setGenres: (genres: Genre[]) => void;
  setSelectedGenre: (genre: Genre | null) => void;
  setSearchQuery: (query: string) => void;
  filterByGenre: (genreId: number | null) => void;
  filterBySearch: (query: string) => void;
  updateWishlistStatus: (contentId: number, isWishlisted: boolean) => void;
}

const useContentStore = create<ContentState>((set, get) => ({
  contents: [],
  filteredContents: [],
  genres: [],
  selectedGenre: null,
  searchQuery: '',

  setContents: (contents) => {
    set({ contents, filteredContents: contents });
  },

  setGenres: (genres) => {
    set({ genres });
  },

  setSelectedGenre: (genre) => {
    set({ selectedGenre: genre });
    get().filterByGenre(genre?.id || null);
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
    get().filterBySearch(query);
  },

  filterByGenre: (genreId) => {
    const { contents, searchQuery } = get();
    
    let filtered = contents;
    
    // 먼저 검색어로 필터링
    if (searchQuery) {
      filtered = filtered.filter(content => 
        content.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // 그 다음 장르로 필터링
    if (genreId !== null) {
      filtered = filtered.filter(content => 
        content.genres.includes(get().genres.find(g => g.id === genreId)?.name || '')
      );
    }
    
    set({ filteredContents: filtered });
  },

  filterBySearch: (query) => {
    const { contents, selectedGenre } = get();
    
    let filtered = contents;
    
    // 검색어로 필터링
    if (query) {
      filtered = filtered.filter(content => 
        content.title.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    // 선택된 장르가 있으면 추가 필터링
    if (selectedGenre) {
      filtered = filtered.filter(content => 
        content.genres.includes(selectedGenre.name)
      );
    }
    
    set({ filteredContents: filtered });
  },

  updateWishlistStatus: (contentId, isWishlisted) => {
    set(state => ({
      contents: state.contents.map(content => 
        content.id === contentId 
          ? { ...content, is_wishlisted: isWishlisted } 
          : content
      ),
      filteredContents: state.filteredContents.map(content => 
        content.id === contentId 
          ? { ...content, is_wishlisted: isWishlisted } 
          : content
      )
    }));
  }
}));

export default useContentStore; 