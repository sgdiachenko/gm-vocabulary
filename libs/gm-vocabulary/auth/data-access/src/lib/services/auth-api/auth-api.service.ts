import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '@gm-vocabulary/shared/environments';
import { LoginResponse } from '@gm-vocabulary/auth/util';
import { Auth } from '@gm-vocabulary/auth/util';

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
