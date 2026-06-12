import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../../../environments/environment';
import { AuthApiService } from './auth-api.service';
import { Auth } from '../../interfaces/auth';

describe('AuthApiService', () => {
  let service: AuthApiService;
  let httpTestingController: HttpTestingController;
  const baseUrl = `${environment.vocabularyApiUrl}/user`;
  const user: Auth = {
    email: 'test@example.com',
    password: 'password',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthApiService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(AuthApiService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should send login request', () => {
    service.login(user).subscribe(response => {
      expect(response).toEqual({
        token: 'token-1',
        expiresInSeconds: 60,
        userId: 'user-1',
      });
    });

    const req = httpTestingController.expectOne(`${baseUrl}/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(user);

    req.flush({
      token: 'token-1',
      expiresInSeconds: 60,
      userId: 'user-1',
    });
  });

  it('should send signup request', () => {
    service.signup(user).subscribe(response => {
      expect(response).toEqual(user);
    });

    const req = httpTestingController.expectOne(`${baseUrl}/signup`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(user);

    req.flush(user);
  });
});
