import { InMemoryNoteRepository } from '../infrastructure/in-memory-note.repository.js';
import { CreateNoteUseCase } from './create-note.use-case.js';
import { GetNoteUseCase } from './get-note.use-case.js';

describe('Note use cases', () => {
  const setup = () => {
    const notes = new InMemoryNoteRepository();
    return { create: new CreateNoteUseCase(notes), get: new GetNoteUseCase(notes) };
  };

  it('creates a note that can be read back', async () => {
    const { create, get } = setup();
    const note = await create.execute({ title: 'Ghi chú' });
    await expect(get.execute(note.id)).resolves.toEqual(note);
  });

  it('throws NOTE_NOT_FOUND for an unknown id', async () => {
    const { get } = setup();
    await expect(get.execute('00000000-0000-4000-8000-000000000000')).rejects.toMatchObject({ code: 'NOTE_NOT_FOUND', status: 404 });
  });
});
