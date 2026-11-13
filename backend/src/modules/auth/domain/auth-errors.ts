import { DomainError } from '../../../common/errors/domain-error.js';

export const invalidCredentials = () => new DomainError('INVALID_CREDENTIALS', 'Email hoặc mật khẩu không đúng.', 401);

export const accountDisabled = () =>
  new DomainError('ACCOUNT_DISABLED', 'Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ quản lý trung tâm.', 403);

export const accountLocked = (minutesLeft: number) =>
  new DomainError('ACCOUNT_LOCKED', `Tài khoản tạm khóa do đăng nhập sai nhiều lần. Vui lòng thử lại sau ${minutesLeft} phút.`, 423);

export const unauthenticated = () => new DomainError('UNAUTHENTICATED', 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', 401);

export const wrongPassword = () => new DomainError('WRONG_PASSWORD', 'Mật khẩu hiện tại không đúng.', 400);

export const weakPassword = () => new DomainError('WEAK_PASSWORD', 'Mật khẩu phải có từ 8 đến 128 ký tự.', 400);

export const emailTaken = () => new DomainError('EMAIL_TAKEN', 'Email đã được dùng cho tài khoản khác.', 409);

export const userNotFound = () => new DomainError('USER_NOT_FOUND', 'Không tìm thấy tài khoản.', 404);

export const lastManager = () => new DomainError('LAST_MANAGER', 'Phải còn ít nhất một quản lý đang hoạt động.', 409);

export const cannotChangeSelf = () =>
  new DomainError('CANNOT_CHANGE_SELF', 'Bạn không thể tự vô hiệu hóa hoặc tự hạ vai trò của mình.', 409);
