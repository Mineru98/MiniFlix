import { register } from "@/infrastructure/api";
import type {
  RegisterResponse,
  UserRegisterRequest,
} from "@/infrastructure/api";
import { useBaseMutation } from "../use_base_mutation";
import { ApiMutationKeys } from "../constants";

export const useRegister = () => {
  return useBaseMutation<RegisterResponse, UserRegisterRequest>({
    mutationKey: [ApiMutationKeys.AUTH, "register"],
    mutationFn: (userData: UserRegisterRequest) => register(userData),
  });
};
