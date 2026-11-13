import { DomainError } from '../../../common/errors/domain-error.js';

export class Note {
  private constructor(
    readonly id: string,
    readonly title: string,
  ) {}

  static create(id: string, title: string): Note {
    const trimmed = title.trim();
    if (!trimmed) throw new DomainError('NOTE_TITLE_REQUIRED', 'Tiêu đề không được để trống.', 422);
    return new Note(id, trimmed);
  }
}
