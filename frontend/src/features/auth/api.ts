import { request } from "@/lib/api/http-client";
import type { ChangePasswordInput, LoginInput, User } from "./types";

export const authApi = {
  login: (input: LoginInput) => request<User>("/auth/login", { method: "POST", body: input }),
  logout: () => request<void>("/auth/logout", { method: "POST" }),
  me: () => request<User>("/auth/me"),
  changePassword: (input: ChangePasswordInput) => request<void>("/auth/me/password", { method: "PUT", body: input }),
};
