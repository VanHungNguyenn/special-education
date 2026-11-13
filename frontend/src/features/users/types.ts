import type { Role } from "@/features/auth/types";

export type CreateUserInput = { email: string; fullName: string; phone: string; role: Role; password: string };

export type UpdateUserInput = Partial<Omit<CreateUserInput, "password"> & { isActive: boolean }>;
