import { apiRequest } from "../client";
import { ApiEndpoints } from "../constants";
import { WishlistResponse, WishlistToggleResponseWrapper } from "./dtos";

/**
 * 사용자의 찜 목록 조회
 */
export const getWishlists = async (): Promise<WishlistResponse> => {
  return await apiRequest<WishlistResponse>({
    method: "GET",
    url: ApiEndpoints.WISHLISTS,
  });
};

/**
 * 콘텐츠 찜하기/취소
 * @param contentId - 콘텐츠 ID
 */
export const toggleWishlist = async (
  contentId: number
): Promise<WishlistToggleResponseWrapper> => {
  return await apiRequest<WishlistToggleResponseWrapper>({
    method: "POST",
    url: `${ApiEndpoints.WISHLIST_TOGGLE}/${contentId}`,
  });
};
