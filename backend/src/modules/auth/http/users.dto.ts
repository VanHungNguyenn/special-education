import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ROLES, type Role } from '../domain/user.js';
import { newPassword, trim } from './auth.dto.js';

export class CreateUserRequest {
  @trim()
  @MaxLength(254, { message: 'Email quá dài.' })
  @IsEmail({}, { message: 'Email không hợp lệ.' })
  email: string;

  @trim()
  @MaxLength(100, { message: 'Họ tên tối đa 100 ký tự.' })
  @IsNotEmpty({ message: 'Vui lòng nhập họ tên.' })
  @IsString({ message: 'Họ tên phải là chuỗi.' })
  fullName: string;

  @trim()
  @IsOptional()
  @MaxLength(20, { message: 'Số điện thoại tối đa 20 ký tự.' })
  @IsString({ message: 'Số điện thoại phải là chuỗi.' })
  phone?: string;

  @IsIn(ROLES, { message: 'Vai trò không hợp lệ.' })
  role: Role;

  @newPassword()
  @IsString({ message: 'Mật khẩu phải là chuỗi.' })
  password: string;
}
