import { SignupRequest } from './signup-request';

export interface AuthForm extends SignupRequest {
  repeatPassword: string;
}
