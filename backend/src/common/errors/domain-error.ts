export type ErrorDetail = { field: string; message: string };

export class DomainError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status: number = 400,
    readonly details: ErrorDetail[] = [],
  ) {
    super(message);
    this.name = 'DomainError';
  }
}
