export interface LoginResponse {
  username: string;
  token: string;
  expiresInSeconds: number;
  userId: string;
}
