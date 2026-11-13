import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { CreateNoteUseCase } from '../application/create-note.use-case.js';
import { GetNoteUseCase } from '../application/get-note.use-case.js';
import { CreateNoteRequest, NoteResponse } from './note.dto.js';

@Controller('template')
export class NoteController {
  constructor(
    private readonly createNote: CreateNoteUseCase,
    private readonly getNote: GetNoteUseCase,
  ) {}

  @Post('notes')
  async create(@Body() body: CreateNoteRequest): Promise<NoteResponse> {
    return NoteResponse.from(await this.createNote.execute(body));
  }

  @Get('notes/:id')
  async get(@Param('id', ParseUUIDPipe) id: string): Promise<NoteResponse> {
    return NoteResponse.from(await this.getNote.execute(id));
  }

  @Get('boom')
  boom(): never {
    throw new Error('boom');
  }
}
