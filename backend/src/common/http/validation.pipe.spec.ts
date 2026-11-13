import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { DomainError } from '../errors/domain-error.js';
import { createValidationPipe } from './validation.pipe.js';

class AddressDto {
  @IsNotEmpty({ message: 'Thành phố không được để trống.' })
  city: string;
}

class StudentDto {
  @IsString({ message: 'Tên phải là chuỗi.' })
  name: string;

  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;
}

const validate = (value: unknown) => createValidationPipe().transform(value, { type: 'body', metatype: StudentDto });

describe('createValidationPipe', () => {
  it('returns a typed instance for a valid body', async () => {
    await expect(validate({ name: 'An', address: { city: 'Hà Nội' } })).resolves.toBeInstanceOf(StudentDto);
  });

  it('throws VALIDATION_FAILED with one detail per field, nested paths joined by dots', async () => {
    const error = await validate({ name: 1, address: { city: '' } }).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(DomainError);
    expect(error).toMatchObject({
      code: 'VALIDATION_FAILED',
      status: 400,
      message: 'Dữ liệu không hợp lệ.',
      details: [
        { field: 'name', message: 'Tên phải là chuỗi.' },
        { field: 'address.city', message: 'Thành phố không được để trống.' },
      ],
    });
  });

  it('rejects properties that the DTO does not declare', async () => {
    const error = await validate({ name: 'An', address: { city: 'Huế' }, role: 'MANAGER' }).catch((e: unknown) => e);
    expect(error).toMatchObject({ code: 'VALIDATION_FAILED', details: [{ field: 'role' }] });
  });
});
