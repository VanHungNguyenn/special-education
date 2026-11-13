import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authKeys } from "@/features/auth/query-keys";
import { usersApi } from "./api";
import { userKeys } from "./query-keys";

export const useUsers = (enabled = true) => useQuery({ queryKey: userKeys.lists(), queryFn: usersApi.list, enabled });

const useInvalidatingMutation = <TInput, TResult>(mutationFn: (input: TInput) => Promise<TResult>) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => Promise.all([queryClient.invalidateQueries({ queryKey: userKeys.lists() }), queryClient.invalidateQueries({ queryKey: authKeys.me() })]),
  });
};

export const useCreateUser = () => useInvalidatingMutation(usersApi.create);

export const useUpdateUser = () => useInvalidatingMutation(usersApi.update);

export const useResetUserPassword = () => useInvalidatingMutation(usersApi.resetPassword);
