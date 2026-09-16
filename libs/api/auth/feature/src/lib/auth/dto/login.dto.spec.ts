import { validate } from 'class-validator';
import { LoginDto } from './login.dto';

describe('LoginDto', () => {
  it('does not apply signup password complexity rules', async () => {
    const dto = new LoginDto();
    dto.email = 'user@example.com';
    dto.password = 'z';

    await expect(validate(dto)).resolves.toEqual([]);
  });

  it('still rejects an empty password', async () => {
    const dto = new LoginDto();
    dto.email = 'user@example.com';
    dto.password = '';

    const errors = await validate(dto);
    const passwordError = errors.find((error) => error.property === 'password');

    expect(passwordError?.constraints?.isNotEmpty).toBe('password should not be empty');
    expect(Object.keys(passwordError?.constraints ?? {})).toEqual(['isNotEmpty']);
  });
});
