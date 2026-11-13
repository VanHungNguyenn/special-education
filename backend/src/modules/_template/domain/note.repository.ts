import type { Note } from './note.js';

export const NOTE_REPOSITORY = Symbol('NOTE_REPOSITORY');

export interface NoteRepository {
  findById(id: string): Promise<Note | null>;
  save(note: Note): Promise<void>;
}
