import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { compare, hash } from 'bcrypt';
import { Model } from 'mongoose';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { Auth, AuthDocument } from '@gm-vocabulary/api/auth/data-access';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Auth.name) private readonly userModel: Model<AuthDocument>,
    private readonly jwtService: JwtService,
  ) {}

  async signup(createUserDto: SignupDto) {
    try {
      const user = await this.userModel.create({
        email: createUserDto.email,
        username: createUserDto.username,
        password: await hash(createUserDto.password, 10),
      });

      return { _id: user._id, email: user.email, username: user.username! };
    } catch (error: unknown) {
      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException('Email already in use');
      }
      throw error;
    }
  }

  async login(credentials: LoginDto) {
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not configured');
    }

    const user = await this.userModel.findOne({ email: credentials.email });
    if (!user || !(await compare(credentials.password, user.password))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.username?.trim()) {
      user.username = user.email.split('@')[0];
      await user.save();
    }

    const expiresInSeconds = 3600;
    const userId = user._id.toString();
    const token = await this.jwtService.signAsync(
      { email: user.email, userId },
      {
        secret: jwtSecret,
        expiresIn: expiresInSeconds,
      },
    );

    return { token, expiresInSeconds, userId, username: user.username };
  }

  private isDuplicateKeyError(error: unknown): error is { code: number } {
    return typeof error === 'object' && error !== null && 'code' in error && error.code === 11000;
  }
}
