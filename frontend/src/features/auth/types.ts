export type Role = "MANAGER" | "TEACHER";

export type User = {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: Role;
  isActive: boolean;
  lockedUntil: string | null;
};

export type LoginInput = { email: string; password: string; remember: boolean };

export type ChangePasswordInput = { currentPassword: string; newPassword: string };

export const roleLabel: Record<Role, string> = { MANAGER: "Quản lý", TEACHER: "Giáo viên" };
