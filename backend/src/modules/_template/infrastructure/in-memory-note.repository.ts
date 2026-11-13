import { Injectable } from '@nestjs/common';
import type { Note } from '../domain/note.js';
import type { NoteRepository } from '../domain/note.repository.js';

@Injectable()
export class InMemoryNoteRepository implements NoteRepository {
  private readonly notes = new Map<string, Note>();

  async findById(id: string) {
    return this.notes.get(id) ?? null;
  }

  async save(note: Note) {
    this.notes.set(note.id, note);
  }
}
