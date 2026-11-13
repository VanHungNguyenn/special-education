import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authApi } from "./api";
import { authKeys } from "./query-keys";

export const useMe = () => useQuery({ queryKey: authKeys.me(), queryFn: authApi.me });

export const useLogin = () => {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: authApi.login, onSuccess: (user) => queryClient.setQueryData(authKeys.me(), user) });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      queryClient.clear();
      router.replace("/login");
    },
  });
};

export const useChangePassword = () => useMutation({ mutationFn: authApi.changePassword });
