import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { LoginResponse } from '../../interfaces/login-response';
import { Auth } from '../../interfaces/auth';

@Service()
export class AuthApiService {
  private http = inject(HttpClient);

  private readonly BASE_URL = `${environment.vocabularyApiUrl}/user`;

  login(user: Auth): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.BASE_URL}/login`, user);
  }

  signup(user: Auth): Observable<Auth> {
    return this.http.post<Auth>(`${this.BASE_URL}/signup`, user);
  }
}
