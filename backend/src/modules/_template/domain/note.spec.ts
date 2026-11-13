import { DomainError } from '../../../common/errors/domain-error.js';
import { Note } from './note.js';

describe('Note', () => {
  it('trims the title', () => {
    expect(Note.create('id-1', '  Họp phụ huynh  ').title).toBe('Họp phụ huynh');
  });

  it('rejects a blank title', () => {
    expect(() => Note.create('id-1', '   ')).toThrow(DomainError);
    expect(() => Note.create('id-1', '   ')).toThrow(expect.objectContaining({ code: 'NOTE_TITLE_REQUIRED', status: 422 }));
  });
});
