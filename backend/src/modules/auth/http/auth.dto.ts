import { Transform } from 'class-transformer';
import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString, Length, MaxLength } from 'class-validator';
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '../domain/password-policy.js';
import type { Role, User } from '../domain/user.js';

export const trim = () => Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value));

export class LoginRequest {
  @trim()
  @MaxLength(254, { message: 'Email quá dài.' })
  @IsEmail({}, { message: 'Email không hợp lệ.' })
  email: string;

  @MaxLength(PASSWORD_MAX_LENGTH, { message: 'Mật khẩu quá dài.' })
  @IsNotEmpty({ message: 'Vui lòng nhập mật khẩu.' })
  @IsString({ message: 'Mật khẩu phải là chuỗi.' })
  password: string;

  @IsOptional()
  @IsBoolean({ message: 'Giá trị ghi nhớ đăng nhập không hợp lệ.' })
  remember?: boolean;
}

export const newPassword = () =>
  Length(PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH, { message: `Mật khẩu phải có từ ${PASSWORD_MIN_LENGTH} đến ${PASSWORD_MAX_LENGTH} ký tự.` });

export class ChangePasswordRequest {
  @MaxLength(PASSWORD_MAX_LENGTH, { message: 'Mật khẩu quá dài.' })
  @IsNotEmpty({ message: 'Vui lòng nhập mật khẩu hiện tại.' })
  @IsString({ message: 'Mật khẩu phải là chuỗi.' })
  currentPassword: string;

  @newPassword()
  @IsString({ message: 'Mật khẩu phải là chuỗi.' })
  newPassword: string;
}

export class UserResponse {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: Role;
  isActive: boolean;
  lockedUntil: string | null;

  static from(user: User): UserResponse {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      lockedUntil: user.lockedUntil?.toISOString() ?? null,
    };
  }
}


