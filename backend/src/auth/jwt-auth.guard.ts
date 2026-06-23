import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthenticatedRequest } from './authenticated-request.interface';

interface TokenPayload {
  email: string;
  userId: string;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const [type, token] = request.headers.authorization?.split(' ') ?? [];

    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Authentication failed');
    }

    try {
      const payload = await this.jwtService.verifyAsync<TokenPayload>(token, {
        secret: process.env.JWT_SECRET ?? 'long_secret_string',
      });
      request.user = { email: payload.email, id: payload.userId };
      return true;
    } catch {
      throw new UnauthorizedException('Authentication failed');
    }
  }
}
