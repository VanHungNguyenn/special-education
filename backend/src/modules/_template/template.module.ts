import { Module } from '@nestjs/common';
import { CreateNoteUseCase } from './application/create-note.use-case.js';
import { GetNoteUseCase } from './application/get-note.use-case.js';
import { NOTE_REPOSITORY } from './domain/note.repository.js';
import { NoteController } from './http/note.controller.js';
import { InMemoryNoteRepository } from './infrastructure/in-memory-note.repository.js';

@Module({
  controllers: [NoteController],
  providers: [{ provide: NOTE_REPOSITORY, useClass: InMemoryNoteRepository }, CreateNoteUseCase, GetNoteUseCase],
})
export class TemplateModule {}
