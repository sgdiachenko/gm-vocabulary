import { vi } from 'vitest';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcrypt';
import { Types } from 'mongoose';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  const originalJwtSecret = process.env.JWT_SECRET;

  interface UserInput {
    email: string;
    password: string;
  }

  const userModel = {
    create: vi.fn(),
    findOne: vi.fn(),
  };
  const jwtService = {
    signAsync: vi.fn(),
  };
  const service = new AuthService(userModel as never, jwtService as unknown as JwtService);

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.JWT_SECRET = 'unit-test-secret';
  });

  afterAll(() => {
    if (originalJwtSecret === undefined) {
      delete process.env.JWT_SECRET;
    } else {
      process.env.JWT_SECRET = originalJwtSecret;
    }
  });

  it('should hash a password before creating a user', async () => {
    const id = new Types.ObjectId();
    let savedUser: UserInput | undefined;
    userModel.create.mockImplementation((user: UserInput) => {
      savedUser = user;
      return Promise.resolve({ _id: id, ...user });
    });

    const result = await service.signup({
      email: 'user@example.com',
      username: 'Test User',
      password: 'plain-password',
    });
    if (!savedUser) {
      throw new Error('Expected userModel.create to be called');
    }

    expect(savedUser.password).not.toBe('plain-password');
    await expect(compare('plain-password', savedUser.password)).resolves.toBe(true);
    expect(result).toEqual({ _id: id, email: 'user@example.com', username: 'Test User' });
  });

  it('should translate duplicate emails into a conflict response', async () => {
    userModel.create.mockRejectedValue({ code: 11000 });

    await expect(
      service.signup({ email: 'user@example.com', username: 'Test User', password: 'password' }),
    ).rejects.toThrow(ConflictException);
  });

  it('should issue a token for valid credentials', async () => {
    const id = new Types.ObjectId();
    userModel.findOne.mockResolvedValue({
      _id: id,
      email: 'user@example.com',
      username: 'Test User',
      password: await hash('password', 4),
    });
    jwtService.signAsync.mockResolvedValue('signed-token');

    await expect(
      service.login({ email: 'user@example.com', password: 'password' }),
    ).resolves.toEqual({
      token: 'signed-token',
      expiresInSeconds: 3600,
      userId: id.toString(),
      username: 'Test User',
    });
  });

  it.each([undefined, '', '   '])(
    'backfills a legacy username (%s) after successful login',
    async (username) => {
      const account = {
        _id: new Types.ObjectId(),
        email: 'john.smith@outlook.com',
        password: await hash('password', 4),
        username,
        save: vi.fn().mockResolvedValue(undefined),
      };
      userModel.findOne.mockResolvedValue(account);
      const result = await service.login({ email: account.email, password: 'password' });
      expect(account.save).toHaveBeenCalledOnce();
      expect(account.username).toBe('john.smith');
      expect(result.username).toBe('john.smith');
    },
  );

  it('preserves an existing username', async () => {
    const account = {
      _id: new Types.ObjectId(),
      email: 'john@example.com',
      password: await hash('password', 4),
      username: 'Custom Name',
      save: vi.fn(),
    };
    userModel.findOne.mockResolvedValue(account);
    const result = await service.login({ email: account.email, password: 'password' });
    expect(result.username).toBe('Custom Name');
    expect(account.save).not.toHaveBeenCalled();
  });

  it('does not backfill or issue a token when the password is wrong', async () => {
    const account = {
      _id: new Types.ObjectId(),
      email: 'john@example.com',
      password: await hash('password', 4),
      save: vi.fn(),
    };
    userModel.findOne.mockResolvedValue(account);
    await expect(service.login({ email: account.email, password: 'wrong' })).rejects.toThrow(
      UnauthorizedException,
    );
    expect(account.save).not.toHaveBeenCalled();
    expect(jwtService.signAsync).not.toHaveBeenCalled();
  });

  it('should reject invalid credentials', async () => {
    userModel.findOne.mockResolvedValue(null);

    await expect(
      service.login({ email: 'missing@example.com', password: 'password' }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
