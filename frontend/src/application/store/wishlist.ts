import { create } from 'zustand';
import { Content } from '@/types';

interface WishlistState {
  wishlistedContents: Content[];
  isLoading: boolean;
  error: string | null;
  setWishlist: (contents: Content[]) => void;
  addToWishlist: (content: Content) => void;
  removeFromWishlist: (contentId: number) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

const useWishlistStore = create<WishlistState>((set) => ({
  wishlistedContents: [],
  isLoading: false,
  error: null,

  setWishlist: (contents) => {
    set({ wishlistedContents: contents, isLoading: false, error: null });
  },

  addToWishlist: (content) => {
    set((state) => ({
      wishlistedContents: [...state.wishlistedContents, content],
    }));
  },

  removeFromWishlist: (contentId) => {
    set((state) => ({
      wishlistedContents: state.wishlistedContents.filter(
        (content) => content.id !== contentId
      ),
    }));
  },

  setLoading: (isLoading) => {
    set({ isLoading });
  },

  setError: (error) => {
    set({ error });
  },
}));

export default useWishlistStore; 