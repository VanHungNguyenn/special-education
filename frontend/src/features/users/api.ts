import type { User } from "@/features/auth/types";
import { request } from "@/lib/api/http-client";
import type { CreateUserInput, UpdateUserInput } from "./types";

export const usersApi = {
  list: () => request<User[]>("/users"),
  create: (input: CreateUserInput) => request<User>("/users", { method: "POST", body: input }),
  update: ({ id, changes }: { id: string; changes: UpdateUserInput }) => request<User>(`/users/${id}`, { method: "PATCH", body: changes }),
  resetPassword: ({ id, password }: { id: string; password: string }) => request<void>(`/users/${id}/password`, { method: "PUT", body: { password } }),
};
