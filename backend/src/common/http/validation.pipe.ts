import { ValidationPipe } from '@nestjs/common';
import type { ValidationError } from 'class-validator';
import { DomainError, type ErrorDetail } from '../errors/domain-error.js';

const toDetails = (errors: ValidationError[], parent = ''): ErrorDetail[] =>
  errors.flatMap((error) => {
    const field = parent ? `${parent}.${error.property}` : error.property;
    const own = Object.values(error.constraints ?? {}).map((message) => ({ field, message }));
    return [...own, ...toDetails(error.children ?? [], field)];
  });

export const createValidationPipe = () =>
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    stopAtFirstError: true,
    transform: true,
    exceptionFactory: (errors) => new DomainError('VALIDATION_FAILED', 'Dữ liệu không hợp lệ.', 400, toDetails(errors)),
  });
