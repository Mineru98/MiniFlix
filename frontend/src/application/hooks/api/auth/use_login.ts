import { login } from "@/infrastructure/api";
import type { LoginResponse, UserLoginRequest } from "@/infrastructure/api";
import { useBaseMutation } from "../use_base_mutation";
import { ApiMutationKeys } from "../constants";

export const useLogin = () => {
  return useBaseMutation<LoginResponse, UserLoginRequest>({
    mutationKey: [ApiMutationKeys.AUTH, "login"],
    mutationFn: (credentials: UserLoginRequest) => login(credentials),
  });
};
