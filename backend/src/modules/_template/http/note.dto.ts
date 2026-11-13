import { IsString, MaxLength } from 'class-validator';
import type { Note } from '../domain/note.js';

export class CreateNoteRequest {
  @MaxLength(200, { message: 'Tiêu đề tối đa 200 ký tự.' })
  @IsString({ message: 'Tiêu đề phải là chuỗi.' })
  title: string;
}

export class NoteResponse {
  id: string;
  title: string;

  static from(note: Note): NoteResponse {
    return { id: note.id, title: note.title };
  }
}
