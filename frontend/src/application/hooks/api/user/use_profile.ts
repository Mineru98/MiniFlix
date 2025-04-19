import { getUserProfile, updateUserProfile } from "@/infrastructure/api";
import type {
  UserProfileResponse,
  UserUpdateRequest,
} from "@/infrastructure/api";
import { useBaseQuery } from "../use_base_query";
import { useBaseMutation } from "../use_base_mutation";
import { ApiQueryKeys, ApiMutationKeys } from "../constants";

export const useUserProfile = () => {
  return useBaseQuery<UserProfileResponse>({
    queryKey: [ApiQueryKeys.USER, "profile"],
    queryFn: () => getUserProfile(),
  });
};

export const useUpdateUserProfile = () => {
  return useBaseMutation<UserProfileResponse, UserUpdateRequest>({
    mutationKey: [ApiMutationKeys.USER, "updateProfile"],
    mutationFn: (userData: UserUpdateRequest) => updateUserProfile(userData),
  });
};
