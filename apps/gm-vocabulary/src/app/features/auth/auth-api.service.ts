import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { LoginResponse } from './contracts/login-response';
import { SignupRequest } from './contracts/signup-request';
import { SignupResponse } from './contracts/signup-response';
import { LoginCredentials } from './contracts/login-credentials';

@Service()
export class AuthApiService {
  private http = inject(HttpClient);

  private readonly BASE_URL = `${environment.vocabularyApiUrl}/auth`;

  login(user: LoginCredentials): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.BASE_URL}/login`, user);
  }

  signup(user: SignupRequest): Observable<SignupResponse> {
    return this.http.post<SignupResponse>(`${this.BASE_URL}/signup`, user);
  }
}
