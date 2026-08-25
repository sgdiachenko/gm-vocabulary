import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcrypt';
import { Types } from 'mongoose';
import { UserService } from './user.service';

describe('UserService', () => {
  const originalJwtSecret = process.env.JWT_SECRET;

  interface UserInput {
    email: string;
    password: string;
  }

  const userModel = {
    create: jest.fn(),
    findOne: jest.fn(),
  };
  const jwtService = {
    signAsync: jest.fn(),
  };
  const service = new UserService(
    userModel as never,
    jwtService as unknown as JwtService,
  );

  beforeEach(() => {
    jest.clearAllMocks();
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
      password: 'plain-password',
    });
    if (!savedUser) {
      throw new Error('Expected userModel.create to be called');
    }

    expect(savedUser.password).not.toBe('plain-password');
    await expect(compare('plain-password', savedUser.password)).resolves.toBe(
      true,
    );
    expect(result).toEqual({ _id: id, email: 'user@example.com' });
  });

  it('should translate duplicate emails into a conflict response', async () => {
    userModel.create.mockRejectedValue({ code: 11000 });

    await expect(
      service.signup({ email: 'user@example.com', password: 'password' }),
    ).rejects.toThrow(ConflictException);
  });

  it('should issue a token for valid credentials', async () => {
    const id = new Types.ObjectId();
    userModel.findOne.mockResolvedValue({
      _id: id,
      email: 'user@example.com',
      password: await hash('password', 4),
    });
    jwtService.signAsync.mockResolvedValue('signed-token');

    await expect(
      service.login({ email: 'user@example.com', password: 'password' }),
    ).resolves.toEqual({
      token: 'signed-token',
      expiresInSeconds: 3600,
      userId: id.toString(),
    });
  });

  it('should reject invalid credentials', async () => {
    userModel.findOne.mockResolvedValue(null);

    await expect(
      service.login({ email: 'missing@example.com', password: 'password' }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
