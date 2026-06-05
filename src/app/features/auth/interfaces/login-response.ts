export interface LoginResponse {
  token: string;
  expiresInSeconds: number;
  userId: string;
}
