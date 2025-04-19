import { getWishlists, toggleWishlist } from "@/infrastructure/api";
import type {
  WishlistResponse,
  WishlistToggleResponseWrapper,
} from "@/infrastructure/api";
import { useBaseQuery } from "../use_base_query";
import { useBaseMutation } from "../use_base_mutation";
import { ApiQueryKeys, ApiMutationKeys } from "../constants";

export const useWishlists = () => {
  return useBaseQuery<WishlistResponse>({
    queryKey: [ApiQueryKeys.WISHLIST, "list"],
    queryFn: () => getWishlists(),
  });
};

export const useToggleWishlist = (contentId: number) => {
  return useBaseMutation<WishlistToggleResponseWrapper, void>({
    mutationKey: [ApiMutationKeys.WISHLIST, "toggle", String(contentId)],
    mutationFn: () => toggleWishlist(contentId),
  });
};
