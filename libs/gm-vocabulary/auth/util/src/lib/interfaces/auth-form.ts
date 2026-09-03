import { Auth } from './auth';

export interface AuthForm extends Auth {
  repeatPassword: string;
}
