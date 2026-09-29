import { LoginCredentials } from './login-credentials';

export interface SignupRequest extends LoginCredentials {
  username: string;
}
