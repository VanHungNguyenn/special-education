import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Note } from '../domain/note.js';
import { NOTE_REPOSITORY, type NoteRepository } from '../domain/note.repository.js';

@Injectable()
export class CreateNoteUseCase {
  constructor(@Inject(NOTE_REPOSITORY) private readonly notes: NoteRepository) {}

  async execute(input: { title: string }): Promise<Note> {
    const note = Note.create(randomUUID(), input.title);
    await this.notes.save(note);
    return note;
  }
}
