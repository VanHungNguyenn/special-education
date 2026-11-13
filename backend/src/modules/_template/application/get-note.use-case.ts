import { Inject, Injectable } from '@nestjs/common';
import { DomainError } from '../../../common/errors/domain-error.js';
import type { Note } from '../domain/note.js';
import { NOTE_REPOSITORY, type NoteRepository } from '../domain/note.repository.js';

@Injectable()
export class GetNoteUseCase {
  constructor(@Inject(NOTE_REPOSITORY) private readonly notes: NoteRepository) {}

  async execute(id: string): Promise<Note> {
    const note = await this.notes.findById(id);
    if (!note) throw new DomainError('NOTE_NOT_FOUND', 'Không tìm thấy ghi chú.', 404);
    return note;
  }
}
