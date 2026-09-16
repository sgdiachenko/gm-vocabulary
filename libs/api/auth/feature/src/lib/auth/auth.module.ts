import { MongooseModule } from '@nestjs/mongoose';
import { Auth, AuthSchema } from '@gm-vocabulary/api/auth/data-access';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
  imports: [
    JwtModule.register({}),
    MongooseModule.forFeature([{ name: Auth.name, schema: AuthSchema }]),
  ],
  controllers: [AuthController],
  providers: [JwtAuthGuard, AuthService],
  exports: [JwtModule, JwtAuthGuard],
})
export class AuthModule {}
