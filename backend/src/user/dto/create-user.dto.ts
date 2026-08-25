import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { MatchesRule } from '../../common/validators/matches-rule.decorator';

export class CreateUserDto {
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
