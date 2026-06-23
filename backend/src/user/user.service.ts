import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { compare, hash } from 'bcrypt';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { User, UserDocument } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
  ) {}

  async signup(createUserDto: CreateUserDto) {
    try {
      const user = await this.userModel.create({
        email: createUserDto.email,
        password: await hash(createUserDto.password, 10),
      });

      return { _id: user._id, email: user.email };
    } catch (error: unknown) {
      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException('Email already in use');
      }
      throw error;
    }
  }

  async login(credentials: CreateUserDto) {
    const user = await this.userModel.findOne({ email: credentials.email });
    if (!user) {
      throw new UnauthorizedException('User does not exist');
    }

    if (!(await compare(credentials.password, user.password))) {
      throw new UnauthorizedException('Password does not match');
    }

    const expiresInSeconds = 3600;
    const userId = user._id.toString();
    const token = await this.jwtService.signAsync(
      { email: user.email, userId },
      {
        secret: process.env.JWT_SECRET ?? 'long_secret_string',
        expiresIn: expiresInSeconds,
      },
    );

    return { token, expiresInSeconds, userId };
  }

  private isDuplicateKeyError(error: unknown): error is { code: number } {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 11000
    );
  }
}
