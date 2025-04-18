export interface Wishlist {
  id: number;
  userId: number;
  contentId: number;
  createdAt: Date;
}

export interface WishlistToggleDto {
  contentId: number;
} 