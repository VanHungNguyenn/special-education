import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "./api";
import { authKeys } from "./query-keys";

export const useMe = () => useQuery({ queryKey: authKeys.me(), queryFn: authApi.me });

export const useLogin = () => {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: authApi.login, onSuccess: (user) => queryClient.setQueryData(authKeys.me(), user) });
};

export const useLogout = () => useMutation({ mutationFn: authApi.logout, onSettled: () => window.location.replace("/login") });

export const useChangePassword = () => useMutation({ mutationFn: authApi.changePassword });
