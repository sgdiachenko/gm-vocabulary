import { validate } from 'class-validator';
import { SignupDto } from './signup.dto';

describe('SignupDto', () => {
  it('accepts a password that satisfies every signup rule', async () => {
    const dto = new SignupDto();
    dto.username = 'Test User';
    dto.email = 'user@example.com';
    dto.password = 'ValidPassword1!';

    await expect(validate(dto)).resolves.toEqual([]);
  });

  it.each([undefined, '', '   '])('rejects an empty username (%s)', async (username) => {
    const dto = Object.assign(new SignupDto(), {
      email: 'user@example.com',
      password: 'ValidPassword1!',
      username,
    });
    const errors = await validate(dto);
    expect(errors.some((error) => error.property === 'username')).toBe(true);
  });

  it('reports every password rule that is not satisfied', async () => {
    const dto = new SignupDto();
    dto.username = 'Test User';
    dto.email = 'user@example.com';
    dto.password = 'z';

    const errors = await validate(dto);
    const passwordError = errors.find((error) => error.property === 'password');
    const messages = Object.values(passwordError?.constraints ?? {});

    expect(messages).toEqual(
      expect.arrayContaining([
        'Password must contain at least one uppercase letter',
        'Password must contain at least one number',
        'Password must contain at least one special character',
        'Password must contain at least 8 characters',
      ]),
    );
    expect(messages).toHaveLength(4);
  });
});
