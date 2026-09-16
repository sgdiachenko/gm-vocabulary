import { Transform } from 'class-transformer';
import { Matches, IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { MatchesRule } from '@gm-vocabulary/api/shared/util';

export class SignupDto {
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @Matches(/\S/, { message: 'Username must not be blank' })
  username!: string;

  @IsEmail()
  email!: string;

  @MinLength(8, {
    message: 'Password must contain at least 8 characters',
  })
  @MatchesRule('hasLowercaseLetter', /[a-z]/, {
    message: 'Password must contain at least one lowercase letter',
  })
  @MatchesRule('hasUppercaseLetter', /[A-Z]/, {
    message: 'Password must contain at least one uppercase letter',
  })
  @MatchesRule('hasNumber', /\d/, {
    message: 'Password must contain at least one number',
  })
  @MatchesRule('hasSpecialCharacter', /[^A-Za-z0-9]/, {
    message: 'Password must contain at least one special character',
  })
  @IsString()
  @IsNotEmpty()
  password!: string;
}
