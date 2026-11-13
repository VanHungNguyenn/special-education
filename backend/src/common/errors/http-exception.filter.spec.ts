import { ArgumentsHost, BadRequestException, Logger, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { DomainError } from './domain-error.js';
import { HttpExceptionFilter } from './http-exception.filter.js';

const catchWith = (exception: unknown) => {
  const response = { status: vi.fn().mockReturnThis(), json: vi.fn() };
  const host = { switchToHttp: () => ({ getResponse: () => response }) } as unknown as ArgumentsHost;
  new HttpExceptionFilter().catch(exception, host);
  return { status: response.status.mock.calls[0][0], body: response.json.mock.calls[0][0] };
};

describe('HttpExceptionFilter', () => {
  beforeEach(() => {
    vi.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('keeps code, message, status and details of a DomainError', () => {
    const details = [{ field: 'title', message: 'Không được để trống.' }];
    expect(catchWith(new DomainError('NOTE_INVALID', 'Ghi chú không hợp lệ.', 422, details))).toEqual({
      status: 422,
      body: { error: { code: 'NOTE_INVALID', message: 'Ghi chú không hợp lệ.', details } },
    });
  });

  it('defaults a DomainError to 400 with empty details', () => {
    expect(catchWith(new DomainError('X', 'Lỗi.'))).toEqual({
      status: 400,
      body: { error: { code: 'X', message: 'Lỗi.', details: [] } },
    });
  });

  it('maps a Nest NotFoundException to NOT_FOUND with a Vietnamese message', () => {
    expect(catchWith(new NotFoundException('Cannot GET /api/v1/x'))).toEqual({
      status: 404,
      body: { error: { code: 'NOT_FOUND', message: 'Không tìm thấy.', details: [] } },
    });
  });

  it('maps other 4xx HttpExceptions without leaking their English message', () => {
    const { status, body } = catchWith(new BadRequestException('Unexpected token } in JSON'));
    expect(status).toBe(400);
    expect(body.error.code).toBe('BAD_REQUEST');
    expect(JSON.stringify(body)).not.toContain('Unexpected token');
  });

  it('hides unexpected errors behind INTERNAL_ERROR and logs the stack', () => {
    const { status, body } = catchWith(new Error('db password is hunter2'));
    expect(status).toBe(500);
    expect(body).toEqual({ error: { code: 'INTERNAL_ERROR', message: 'Đã có lỗi xảy ra, vui lòng thử lại sau.', details: [] } });
    expect(Logger.prototype.error).toHaveBeenCalledWith('db password is hunter2', expect.stringContaining('Error: db password'));
  });

  it('treats 5xx HttpExceptions like unexpected errors but keeps their status', () => {
    const { status, body } = catchWith(new ServiceUnavailableException('pool exhausted'));
    expect(status).toBe(503);
    expect(body.error.code).toBe('INTERNAL_ERROR');
    expect(Logger.prototype.error).toHaveBeenCalled();
  });
});
