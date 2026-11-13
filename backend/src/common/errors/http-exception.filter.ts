import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import type { Response } from 'express';
import { DomainError, type ErrorDetail } from './domain-error.js';

const KNOWN_STATUSES: Record<number, { code: string; message: string }> = {
  400: { code: 'BAD_REQUEST', message: 'Yêu cầu không hợp lệ.' },
  401: { code: 'UNAUTHORIZED', message: 'Bạn cần đăng nhập để tiếp tục.' },
  403: { code: 'FORBIDDEN', message: 'Bạn không có quyền thực hiện thao tác này.' },
  404: { code: 'NOT_FOUND', message: 'Không tìm thấy.' },
  405: { code: 'METHOD_NOT_ALLOWED', message: 'Thao tác không được hỗ trợ.' },
  413: { code: 'PAYLOAD_TOO_LARGE', message: 'Dữ liệu gửi lên quá lớn.' },
  429: { code: 'TOO_MANY_REQUESTS', message: 'Bạn thao tác quá nhanh, vui lòng thử lại sau.' },
};

const INTERNAL = { code: 'INTERNAL_ERROR', message: 'Đã có lỗi xảy ra, vui lòng thử lại sau.' };

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const { status, code, message, details } = this.toError(exception);
    response.status(status).json({ error: { code, message, details } });
  }

  private toError(exception: unknown): { status: number; code: string; message: string; details: ErrorDetail[] } {
    if (exception instanceof DomainError) {
      return { status: exception.status, code: exception.code, message: exception.message, details: exception.details };
    }
    const status = exception instanceof HttpException ? exception.getStatus() : 500;
    if (status >= 500) {
      const error = exception instanceof Error ? exception : new Error(String(exception));
      this.logger.error(error.message, error.stack);
      return { status, ...INTERNAL, details: [] };
    }
    return { status, ...(KNOWN_STATUSES[status] ?? KNOWN_STATUSES[400]), details: [] };
  }
}
