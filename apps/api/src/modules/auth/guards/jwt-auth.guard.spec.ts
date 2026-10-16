import { vi } from 'vitest';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  const jwtService = { verifyAsync: vi.fn() };
  const guard = new JwtAuthGuard(jwtService as unknown as JwtService);

  function createContext(authorization?: string) {
    const request = { headers: { authorization }, user: undefined };
    const context = {
      switchToHttp: () => ({ getRequest: () => request }),
    } as ExecutionContext;

    return { context, request };
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should attach the verified user to the request', async () => {
    jwtService.verifyAsync.mockResolvedValue({
      email: 'user@example.com',
      userId: 'user-id',
    });
    const { context, request } = createContext('Bearer valid-token');

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.user).toEqual({ email: 'user@example.com', id: 'user-id' });
  });

  it('should reject a request without a bearer token', async () => {
    const { context } = createContext();

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('should reject an invalid token', async () => {
    jwtService.verifyAsync.mockRejectedValue(new Error('invalid token'));
    const { context } = createContext('Bearer invalid-token');

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });
});
